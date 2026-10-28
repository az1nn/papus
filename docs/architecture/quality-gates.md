# Risk-based quality gates (proposed ADR-007 companion)

| Change surface | Required verification |
|---|---|
| All code changes | Unit tests, typecheck, production build, exact SHA |
| Documentation-only | Markdown/path consistency, constitution/ADR cross-check, applicable existing CI |
| Parsing/format | Representative fixtures, malformed inputs, fidelity and provenance |
| Intelligent UI | Typed program validation, renderer independence, forbidden components/actions |
| Security/privacy/inference | Injection and URL negatives, unauthorized egress, permission and auth failure |
| PWA/storage | Production browser smoke, offline baseline, persistence and migration cases |
| Android or shared platform-sensitive | Android sync/build and affected-device smoke |
| CI workflow changes | Independent `workflow-lint` checks every Actions YAML with pinned actionlint and a malformed-workflow negative case; `spec-kit-validation` still runs |
| Constitution/ADR/spec governance | SemVer, accurate proposed-vs-ratified status, approved v2 G1–G8 consistency, ADR-001–008 presence, and recorded T08 approval/merge evidence (T08 pending only while PR #2 was Draft) |
| Cross-domain | Reviews from affected owner roles and conflict resolution |

Risk level must be recorded in the PR or plan. A failed or missing mandatory check blocks approval. A historical green check does not establish PASS for a new SHA. Documentation-only changes do not automatically require Android builds, but existing required branch protection remains binding.

The workflow lint runs separately from `spec-kit-validation` so a broken Spec Kit workflow can still be diagnosed. Configure required checks in branch protection independently; workflow success alone does not enforce merge protection or ratify a proposed constitution.
