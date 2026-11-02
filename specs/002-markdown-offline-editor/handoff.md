# CAVEMAN HANDOFF v1 — Papus SPEC-MD-001
APP: Papus Universal Reader PWA
WORKSTREAM: Offline Markdown editor functional M1–M5
STATE: Draft PR implementation with checkpoints; CI verification in progress
MODE: RESUME / WATCH depending on current PR checks
CANONICAL SOURCE: az1nn/papus (GitHub) + SPEC-MD-001 and ADR-MD-001..005

BASE: master 85865d4a1c946de636805aa23fb510b968054220 (at initial reconciliation)
BRANCH: feat/spec-md-001-m1-m5-editor
PR: https://github.com/az1nn/papus/pull/6
SPEC: specs/002-markdown-offline-editor/{spec,plan,tasks}.md

DONE / EVIDENCE:
- M0 documentary PR #5 merged; Constitution v2.0.0 active.
- Human authorization 2026-11-01: M1–M5 implementation in one PR, milestone checkpoints, no automatic merge.
- M1 source/core/files initial SHA 93a4124 — frontend-gates PASS.
- M2 sandboxed Preview/text-only bridge initial SHA 59b378b — frontend-gates PASS.
- M3 first rich renderer SHA d0116e8 — FAIL; earlier renderer unintentionally reinstated in tree; corrected at 6066c42. Do not classify corrected state PASS without its own run.
- M4 responsive & IME checkpoint f7ed2b5 — initial run inherited M3 test failure.
- M5 explicit on-demand diff, browser tests and integration documentation in progress.

GATES / BLOCKERS:
- M3/M4/M5 exact-head CI and browser security tests must complete.
- Firefox/WebKit, mobile browser/IME and reference-machine performance budgets NOT VERIFIED until reproducible evidence.
- Domain owner roles (SECURITY/PLATFORM/DATA/QUALITY) are not assigned to people; review remains pending.
- No unapproved merge, force push, backend, remote inference or automatic saving.

INVARIANTS:
- Web PWA only editor. Existing Android reader must not regress.
- Canonical Source; UTF-8/BOM and mixed line endings; direct write only by user action.
- Isolated iframe with opaque origin, restrictive CSP, sanitized rendering, revision-checked plain-text corrections.
- R1–R5, G1–G8 and Constitution 2.0.0 preserved.

NEXT:
1. Check PR #6 head versus GitHub live state before editing.
2. Retrieve CI job logs, repair actual failures and revalidate exact head.
3. Run cross-browser/mobile security and acceptance evidence where available.
4. Keep draft, request domain-owner and human merge approvals only after all gates pass.

VERIFY-FIRST: REAL STATE > HANDOFF > MEMORY > CHAT. Do not mark tasks or gates PASS based on this handoff alone.
