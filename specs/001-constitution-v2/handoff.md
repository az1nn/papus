# CAVEMAN HANDOFF v1 — Papus Constitution v2.0.0

APP: Papus (Universal Reader AI)
WORKSTREAM: PR #2 — Spec Kit, proposed Constitution v2.0.0, CI hardening
STATE: CI hardening implemented; human governance gate pending
MODE: WATCH
CANONICAL SOURCE: https://github.com/az1nn/papus/pull/2 and live GitHub Actions

CURRENT VERIFIED HEAD (before this handoff commit): `124fcc60f0c39845cfb333486d2b3090ba459bde`
BASE: `master` at `9bb79c9839c778c3d3db63754af6bf6fbe6cc8aa` (recheck live)
BRANCH / ENV: `chore/spec-kit-constitution-v1`; PR Draft
PR / MR / TASK: #2; T08 human ratification review pending
SPEC / ADR: `specs/001-constitution-v2/`; ADR-001–ADR-008 proposed

DONE:
- Repaired stale 1.0.0 validation and malformed workflow on earlier commits.
- Added independent `.github/workflows/workflow-lint.yml` with actionlint and malformed-YAML negative test.
- Added `.github/scripts/validate_governance.py` and six regression cases covering SemVer, G1–G8, draft status, ADR completeness and T08.
- Expanded `spec-kit-validation` path triggers to ADRs, architecture, specs, workflow files and validation scripts.
- Updated CI documentation/quality-gates guidance.
- No runtime or Android changes; no merge.

VERIFY (exact verified parent SHA `124fcc60f0c39845cfb333486d2b3090ba459bde`):
- workflow-lint PASS: https://github.com/az1nn/papus/actions/runs/40513024197
- spec-kit-validation PASS: https://github.com/az1nn/papus/actions/runs/40513024137
- frontend-gates PASS (unit tests, build, Playwright offline PWA, frontend-only): https://github.com/az1nn/papus/actions/runs/40513024105
- Vercel SUCCESS: https://vercel.com/az1nns-projects/papus/BTdkt6qkQEjiVPejBEtsLckmct5z
- This handoff commit changes the SHA. Never claim these old runs verify the new SHA; inspect its own runs first.

GATES:
- T08 human constitutional review/ratification is OPEN.
- PR #2 must remain Draft. No merge without separate explicit authorization.
- GitHub master required-check/branch protection settings not verified or changed. CI success does not itself enforce these rules.
- No human PR reviews recorded at handoff creation.

BLOCKERS:
- Human ratification decision and explicitly authorized integration.
- Confirm branch protection required status checks and human-review policy before any merge.

INVARIANTS:
- REAL STATE > HANDOFF > MEMORY > CHAT. VERIFY-FIRST.
- Approved grilling G1=B, G2=C, G3=C, G4=C, G5=A, G6=C, G7=B, G8=D.
- Constitution v2.0.0 is proposed, not ratified.
- No forced pushes, unapproved merges, or claim of CI PASS for untested SHA.
- Keep existing frontend-only/privacy contracts and domain ownership intact.

NEXT:
- Recheck live PR HEAD and CI for this handoff commit.
- If all exact-head checks pass, preserve Draft and present T08 for human review.
- Treat master protection enforcement as NOT VERIFIED until inspected independently.
- Do not make further commits merely to rewrite old SHA identifiers in this handoff.

VERIFY-FIRST:
Fetch PR #2 metadata and HEAD; list pull-request-triggered workflow runs for that SHA and inspect job steps; read current `specs/001-constitution-v2/tasks.md`; confirm Draft/unmerged and reviews.
