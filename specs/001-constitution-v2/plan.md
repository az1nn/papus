# Plan — Constitutional governance v2.0.0

**Branch:** `chore/spec-kit-constitution-v1` (historical source branch)
**PR:** [#2](https://github.com/az1nn/papus/pull/2) (merged 2026-10-28)
**Constitution Check:** Ratified v2.0.0 on 2026-10-28 following explicit maintainer approval and merge. MAJOR amendment resolves prior v1.0.0 conflicts; runtime implementation is not implied.

## Design (historical implementation plan)
- Amend eight constitutional principles and governance with the approved G1–G8 outcomes.
- Record eight proposed ADRs for implementation choices; do not treat proposals as implemented.
- Add owner-role contracts and risk-based gate selection matrix.
- Update AGENTS.md to keep SIGA, Spec Kit and CI consistent.
- Preserve application source and all prior PR changes.

## Affected domains
Governance, privacy/inference, document parsing, Intelligent UI, security, platform, CI and SIGA. Owner names are not assumed; domain roles require explicit assignment before production implementation.

## Risks and mitigations
- Breaking policy: v2.0.0 and migration note; approval required.
- Remote disclosure: no runtime change; scoped consent and secure auth are preconditions.
- Sandbox relaxation: no runtime isolation removed.
- Concurrency: single atomic commit on observed head, lease-protected ref update.
- CI: documentation checks and workflow status verified on exact SHA; no unsupported PASS claims.

## Verification
Review changed paths for docs-only scope; validate links and decisions; inspect CI for new head; report missing checks as NOT VERIFIED.
