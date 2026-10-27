# Tasks — Constitutional governance v2.0.0

- [x] T01 Reconcile PR #2, branch and existing constitution.
- [x] T02 Capture approved G1–G8 and choose breaking SemVer v2.0.0.
- [x] T03 Draft revised constitutional principles and migration.
- [x] T04 Draft eight architecture decision records.
- [x] T05 Draft domain ownership and quality gate contracts.
- [x] T06 Align AGENTS.md and Spec Kit artifacts.
- [x] T07 Verify exact-head CI and documentation consistency after commit.
- [ ] T08 Obtain human review and ratification decision (no merge in this scope).

## T07 verification record (2026-10-26)

- Reviewed constitutional decisions G1=B, G2=C, G3=C, G4=C, G5=A, G6=C, G7=B, G8=D, Constitution v2.0.0 proposal, ADR-001–008 and owner/gate contracts for documentary consistency.
- Fixed the Spec Kit workflow's stale version 1.0.0 assertion; aligned the Spec Kit guide's ratification, remote inference and risk-based gate wording.
- Verified source HEAD `de9f8473eeb9b7b497ee805de5bf78fb17a1d32d`: [spec-kit-validation PASS](https://github.com/az1nn/papus/actions/runs/40434646547) and [frontend-gates PASS](https://github.com/az1nn/papus/actions/runs/40434646540); Vercel combined status SUCCESS.
- The task record update itself creates a newer HEAD. Recheck all applicable CI against that final SHA in the PR handoff before approval. T08 remains pending; this record grants no constitutional ratification or merge authorization.
