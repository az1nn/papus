#!/usr/bin/env python3
"""Validate the Papus constitution proposal without treating CI as ratification."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys
import tempfile
import unittest

FIELD = re.compile(r"^\*\*(Version|Ratified|Last Amended|Status):\*\*\s+(.+)$", re.M)
SEMVER = re.compile(r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$")
DECISION = re.compile(r"\bG([1-8])=([A-D])\b")
APPROVED_V2 = dict(zip("12345678", "BCC CACBD".replace(" ", "")))


def validate(root: Path, require_proposed: bool = False) -> list[str]:
    errors: list[str] = []
    constitution = root / ".specify/memory/constitution.md"
    if not constitution.is_file():
        return ["missing .specify/memory/constitution.md"]
    text = constitution.read_text(encoding="utf-8")
    found: dict[str, list[str]] = {}
    for key, value in FIELD.findall(text):
        found.setdefault(key, []).append(value.strip())
    for key in ("Version", "Ratified", "Last Amended", "Status"):
        if len(found.get(key, [])) != 1:
            errors.append(f"expected exactly one **{key}:** field")

    version = found.get("Version", [""])[0]
    if not SEMVER.fullmatch(version):
        errors.append(f"invalid constitution SemVer: {version!r}")
    status = found.get("Status", [""])[0].lower()
    proposed = status.startswith("proposed")
    ratified = status.startswith("ratified")
    if not (proposed or ratified):
        errors.append("Status must start with Proposed or Ratified")
    if proposed and ("not ratified" not in status or "draft" not in status):
        errors.append("Proposed status must explicitly state draft and not ratified")
    if require_proposed and not proposed:
        errors.append("Draft PR #2 must not claim constitutional ratification")

    if version == "2.0.0":
        decisions = DECISION.findall(text)
        if len(decisions) != 8 or dict(decisions) != APPROVED_V2:
            errors.append("constitution G1-G8 diverge from approved v2.0.0 decisions")
        required = [
            "docs/architecture/domain-ownership.md",
            "docs/architecture/quality-gates.md",
            "specs/001-constitution-v2/spec.md",
            "specs/001-constitution-v2/plan.md",
            "specs/001-constitution-v2/tasks.md",
        ] + [f"docs/adr/ADR-{n:03d}.md" for n in range(1, 9)]
        for relative in required:
            if not (root / relative).is_file():
                errors.append(f"missing v2 governance artifact: {relative}")
        for relative in ("specs/001-constitution-v2/spec.md", "specs/001-constitution-v2/plan.md"):
            file = root / relative
            if file.is_file():
                body = file.read_text(encoding="utf-8")
                if "v2.0.0" not in body:
                    errors.append(f"{relative} does not identify v2.0.0")
                if relative.endswith("/spec.md"):
                    spec_decisions = DECISION.findall(body)
                    if len(spec_decisions) != 8 or dict(spec_decisions) != APPROVED_V2:
                        errors.append("spec G1-G8 diverge from approved v2.0.0 decisions")
        if require_proposed:
            tasks = root / "specs/001-constitution-v2/tasks.md"
            if tasks.is_file() and not re.search(r"^- \[ \] T08\b", tasks.read_text(encoding="utf-8"), re.M):
                errors.append("T08 ratification must remain pending in draft PR #2")
    return errors


class ValidatorRegressionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.constitution = self.root / ".specify/memory/constitution.md"
        self.constitution.parent.mkdir(parents=True)
        self.constitution.write_text(
            "# Constitution\n**Version:** 2.0.0\n"
            "**Ratified:** 2026-10-25 (original baseline)\n"
            "**Last Amended:** 2026-10-26\n"
            "**Status:** Proposed breaking amendment in draft PR #2; not ratified.\n"
            "G1=B; G2=C; G3=C; G4=C; G5=A; G6=C; G7=B; G8=D\n",
            encoding="utf-8",
        )
        for name in [
            "docs/architecture/domain-ownership.md",
            "docs/architecture/quality-gates.md",
            "specs/001-constitution-v2/spec.md",
            "specs/001-constitution-v2/plan.md",
            "specs/001-constitution-v2/tasks.md",
        ] + [f"docs/adr/ADR-{n:03d}.md" for n in range(1, 9)]:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            body = "v2.0.0 G1=B G2=C G3=C G4=C G5=A G6=C G7=B G8=D\n"
            if name.endswith("/tasks.md"):
                body += "- [ ] T08 Obtain ratification\n"
            path.write_text(body, encoding="utf-8")

    def test_valid_proposal(self) -> None:
        self.assertEqual(validate(self.root, require_proposed=True), [])

    def test_invalid_semver_is_rejected(self) -> None:
        self.constitution.write_text(
            self.constitution.read_text().replace("2.0.0", "02.0.0"), encoding="utf-8"
        )
        self.assertTrue(any("SemVer" in error for error in validate(self.root)))

    def test_silent_decision_change_is_rejected(self) -> None:
        self.constitution.write_text(
            self.constitution.read_text().replace("G6=C", "G6=B"), encoding="utf-8"
        )
        self.assertTrue(any("G1-G8" in error for error in validate(self.root)))

    def test_unratified_proposal_cannot_claim_ratification(self) -> None:
        self.constitution.write_text(
            self.constitution.read_text().replace(
                "Proposed breaking amendment in draft PR #2; not ratified.", "Ratified."
            ),
            encoding="utf-8",
        )
        self.assertTrue(any("must not claim" in error for error in validate(self.root, True)))

    def test_missing_adr_is_rejected(self) -> None:
        (self.root / "docs/adr/ADR-008.md").unlink()
        self.assertTrue(any("ADR-008" in error for error in validate(self.root)))

    def test_missing_ratification_gate_is_rejected(self) -> None:
        task = self.root / "specs/001-constitution-v2/tasks.md"
        task.write_text("- [x] T08 Ratified\n", encoding="utf-8")
        self.assertTrue(any("T08" in error for error in validate(self.root, True)))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--require-proposed", action="store_true")
    args = parser.parse_args()
    errors = validate(args.root, args.require_proposed)
    for error in errors:
        print(f"::error::{error}")
    if errors:
        return 1
    print("PASS: constitution metadata, v2 decisions and governance artifacts")
    return 0


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        unittest.main(argv=[sys.argv[0]])
    else:
        raise SystemExit(main())
