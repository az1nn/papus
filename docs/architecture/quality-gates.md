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
| Cross-domain | Reviews from affected owner roles and conflict resolution |

Risk level must be recorded in the PR or plan. A failed or missing mandatory check blocks approval. A historical green check does not establish PASS for a new SHA. Documentation-only changes do not automatically require Android builds, but existing required branch protection remains binding.
