# SPEC-001 — Constitutional governance v2.0.0

**Status:** Proposed / implementation documentation only
**Source:** Approved Papus grilling G1=B, G2=C, G3=C, G4=C, G5=A, G6=C, G7=B, G8=D
**Target:** Draft PR #2, no merge

## Problem
The 1.0.0 constitution prohibits remote document inference, mandates sandboxed HTML and immediate Web–Android parity. The approved operating model instead permits consented hybrid inference, chooses sanitization plus allowlists as the constitutional security floor, and prioritizes Web PWA. Technical choices and ownership require separate versioned contracts.

## User stories
1. As a maintainer, I can distinguish binding invariants from replaceable ADR choices.
2. As a reader, my offline core works and remote processing never occurs without valid scoped permission.
3. As a contributor, I can distinguish Original/Intelligent modes and follow typed pipeline contracts.
4. As SIGA, I can identify affected owners, risk gates and exact-head evidence without bypassing human approval.

## Acceptance criteria
- CA01: All eight approved G1–G8 decisions are represented accurately.
- CA02: Constitution version is 2.0.0, marked proposed pending approval/merge.
- CA03: Remote inference permission, revocation, egress and client credential restrictions are explicit.
- CA04: Original and Intelligent representation contracts and provenance are specified.
- CA05: Renderer remains independent of GPT-6 and validates allowlisted OpenUI programs.
- CA06: Sanitization/allowlist mandatory; sandbox not universally mandatory; removal of existing isolation reviewed.
- CA07: Web-first strategy and Android capability matrix requirements are explicit.
- CA08: Risk-based gates and exact-commit PASS evidence are mandatory.
- CA09: Domain owners, review boundaries and SIGA concurrency/merge constraints are explicit.
- CA10: Constitution, ADR proposals, AGENTS.md and Spec Kit artifacts are mutually consistent.
- CA11: Breaking SemVer migration and differences from 1.0.0 are recorded.
- CA12: Documentation-only diff; no merge; applicable CI reported for new exact head.

## Out of scope
Runtime code changes, remote GPT-6 integration, new server endpoints, removing current sandbox, Android feature implementation, PR merge or constitutional ratification.
