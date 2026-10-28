# Tasks — Constitutional governance v2.0.0

- [x] T01 Reconcile PR #2, branch and existing constitution.
- [x] T02 Capture approved G1–G8 and choose breaking SemVer v2.0.0.
- [x] T03 Draft revised constitutional principles and migration.
- [x] T04 Draft eight architecture decision records.
- [x] T05 Draft domain ownership and quality gate contracts.
- [x] T06 Align AGENTS.md and Spec Kit artifacts.
- [x] T07 Verify exact-head CI and documentation consistency after commit.
- [x] T08 Obtain human review and ratification decision (approved on 2026-10-28; merged in PR #2).

## T07 verification record (2026-10-26)

- Reviewed constitutional decisions G1=B, G2=C, G3=C, G4=C, G5=A, G6=C, G7=B, G8=D, Constitution v2.0.0 proposal, ADR-001–008 and owner/gate contracts for documentary consistency.
- Fixed the Spec Kit workflow's stale version 1.0.0 assertion; aligned the Spec Kit guide's ratification, remote inference and risk-based gate wording.
- Verified source HEAD `de9f8473eeb9b7b497ee805de5bf78fb17a1d32d`: [spec-kit-validation PASS](https://github.com/az1nn/papus/actions/runs/40434646547) and [frontend-gates PASS](https://github.com/az1nn/papus/actions/runs/40434646540); Vercel combined status SUCCESS.
- The task record update itself creates a newer HEAD. Recheck all applicable CI against that final SHA in the PR handoff before approval. At the time of the 2026-10-26 T07 record, T08 was still pending; approval was recorded separately on 2026-10-28 (see T08 below).

## T08 ratification and integration record (2026-10-28)

- The maintainer explicitly approved both PRs #2 and #3 and authorized their merge in the ChatGPT conversation; the approval was recorded as a [PR #2 comment](https://github.com/az1nn/papus/pull/2#issuecomment-6479107415).
- PR #2 was [merged into master](https://github.com/az1nn/papus/commit/6475c072fa3ee2423055bc0c29f1ad0beb35c1dc); PR #3 was subsequently [merged](https://github.com/az1nn/papus/commit/4d23163a0e7d39d7decc21296fdd50ab7143e52e).
- The approval is explicit maintainer ratification in conversation, not a GitHub-submitted formal PR review. The constitutional decisions remain G1=B, G2=C, G3=C, G4=C, G5=A, G6=C, G7=B, G8=D.
- On integrated master `4d23163a0e7d39d7decc21296fdd50ab7143e52e`, `spec-kit-validation`, `frontend-gates`, and `android-debug` completed successfully, and Vercel reported success; see the GitHub Actions runs tied to that SHA.
- Constitutional ratification grants no authorization to implement unstarted feature roadmaps or to introduce remote inference without the specified security/consent gates.
