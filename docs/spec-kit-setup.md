# Spec Kit adoption — Papus

This repository includes a reviewed snapshot of the official [GitHub Spec Kit](https://github.com/github/spec-kit) templates, Bash helpers and GitHub Copilot skills in `.specify/` and `.github/skills/`, alongside the Papus constitution. The v2.0.0 amendment in draft PR #2 is **proposed**, not ratified; the constitution on `master` remains authoritative until explicit human approval and integration. These files were adopted for an existing application on 2026-10-25; the application source was not regenerated.

## Local Specify CLI installation

Requirements: Python 3.11+, uv and Git. From your local checkout:

```bash
uv tool install specify-cli
specify version
specify check
```

The above installs the **local CLI**; vendored repository scaffolding alone does not install an executable on developer machines. In GitHub Copilot Chat, invoke `/speckit-constitution`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`, `/speckit-converge`. The existing constitution is not to be regenerated without an explicit amendment.

To adopt a fresh upstream Spec Kit release in a separate, reviewable branch, use `specify init --here --force --non-interactive --integration copilot --ignore-agent-tools` and review the entire diff before committing. This command can replace managed paths. Do NOT run it blindly over an uncommitted working tree.

## Project gates

- No required proprietary application backend, hidden document-upload API, or embedded private LLM credentials. Remote inference is permitted only after specific revocable consent and secure public-client authentication.
- Local-first import/read/search with declared DOC/PPT and PDF OCR limitations.
- Typed OpenUI renderer; GPT-6 inference remains separately gated.
- Apply risk-based checks from `docs/architecture/quality-gates.md`: run applicable tests, builds, E2E and Android validation for affected surfaces; preserve existing mandatory CI and bind results to the exact SHA.
- Keep spec → plan → tasks → evidence and CI SHA linkage in PRs.

The copied scaffold is based on upstream project files (MIT license). Upgrades should be synchronized using the official CLI, with peer review and without claiming local CLI installation from the presence of files.

## CI hardening (draft PR #2)

For changes to `.github/workflows/**`, the independent `workflow-lint` job runs pinned `rhysd/actionlint:1.7.12` against every workflow and verifies that malformed YAML is rejected. `spec-kit-validation` also triggers on `docs/adr/**`, `docs/architecture/**`, `specs/**` and `.github/scripts/**`, in addition to the Spec Kit scaffold and existing paths.

To reproduce the constitutional checks locally in the proposal branch:

```bash
python3 .github/scripts/validate_governance.py --self-test
python3 .github/scripts/validate_governance.py --require-proposed
docker run --rm -v "$PWD:/repo:ro" -w /repo rhysd/actionlint:1.7.12 -color
```

`--require-proposed` is enforced automatically on PR #2 and must not be used to infer ratification. Record the exact HEAD SHA, workflow run links and any missing required checks; maintainers must separately configure required status checks and reviews in GitHub branch protection before permitting merge. These checks validate governance metadata and CI syntax, not the normative quality of the constitutional choices.
