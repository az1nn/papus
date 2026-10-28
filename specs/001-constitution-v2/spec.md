# SPEC-001 — Constitutional governance v2.0.0

**Status:** Ratified governance specification / implementation documentation only
**Source:** Approved Papus grilling G1=B, G2=C, G3=C, G4=C, G5=A, G6=C, G7=B, G8=D
**Target:** [PR #2](https://github.com/az1nn/papus/pull/2), merged 2026-10-28

## Problem
The 1.0.0 constitution prohibits remote document inference, mandates sandboxed HTML and immediate Web–Android parity. The approved operating model instead permits consented hybrid inference, chooses sanitization plus allowlists as the constitutional security floor, and prioritizes Web PWA. Technical choices and ownership require separate versioned contracts.

## User stories
1. As a maintainer, I can distinguish binding invariants from replaceable ADR choices.
2. As a reader, my offline core works and remote processing never occurs without valid scoped permission.
3. As a contributor, I can distinguish Original/Intelligent modes and follow typed pipeline contracts.
4. As SIGA, I can identify affected owners, risk gates and exact-head evidence without bypassing human approval.

## Acceptance criteria
- CA01: All eight approved G1–G8 decisions are represented accurately.
- CA02: Constitution version is 2.0.0, correctly marked ratified following human approval and merge.
- CA03: Remote inference permission, revocation, egress and client credential restrictions are explicit.
- CA04: Original and Intelligent representation contracts and provenance are specified.
- CA05: Renderer remains independent of GPT-6 and validates allowlisted OpenUI programs.
- CA06: Sanitization/allowlist mandatory; sandbox not universally mandatory; removal of existing isolation reviewed.
- CA07: Web-first strategy and Android capability matrix requirements are explicit.
- CA08: Risk-based gates and exact-commit PASS evidence are mandatory.
- CA09: Domain owners, review boundaries and SIGA concurrency/merge constraints are explicit.
- CA10: Constitution, ADR proposals, AGENTS.md and Spec Kit artifacts are mutually consistent.
- CA11: Breaking SemVer migration and differences from 1.0.0 are recorded.
- CA12: Documentation-only constitutional amendment integrated by authorized merge; applicable CI tied to the exact tested head.

## Out of scope
Runtime code changes, remote GPT-6 integration, new server endpoints, removing current sandbox, and Android feature implementation. Constitutional ratification and PR #2 integration were governance decisions completed separately on 2026-10-28.
