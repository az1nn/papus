# CAVEMAN HANDOFF v1 — Papus SPEC-MD-001

APP: Papus Universal Reader Web PWA
WORKSTREAM: Offline Markdown Source/Preview, implementation M1–M5
STATE: Functional candidate in draft PR #6, exact-head automated CI passed at the last measured checkpoint; human review and merge gate pending
MODE: WATCH (domain owner review and approval), after VERIFY-FIRST
CANONICAL SOURCE: az1nn/papus, SPEC-MD-001 and ADR-MD-001..005

BASE: master 85865d4a1c946de636805aa23fb510b968054220 (when branch opened)
BRANCH: feat/spec-md-001-m1-m5-editor
PR: https://github.com/az1nn/papus/pull/6
SPEC: specs/002-markdown-offline-editor/{spec,plan,tasks}.md
VERIFIED CODE SHA: ba2bcff474726b44bf8bd6ab1dd7ac1e67439a30
NOTE: This handoff is a documentary change. Recheck exact PR HEAD after this handoff commit before claiming final CI success.

DONE:
- M0 #5 merged. M0.5 explicit separate authorization 2026-11-01 for M1–M5 in one PR, not for merge.
- M1 canonical UTF-8/BOM LF/CRLF preservation, Source adapter, snapshot-safe writes, concurrent-write lock, undo/redo.
- M2 sandboxed Preview, source maps and revision-validated corrections. Subsequent optimization: authenticated incremental render of safe text spans, full render for structural edits.
- M3 GFM, local Mermaid, KaTeX/MathML, syntax highlight, YAML with defensive rendering and negative tests.
- M4 desktop pane split, mobile tabs, IME handling, 320px browser tests.
- M5 read-only on-demand diff, three-browser E2E, expanded import/security/file mock tests, initial JS budget and 1 MiB performance benchmark.
- No native Android editor or application backend.

VERIFY:
- At ba2bcff4: frontend 41371747360 SUCCESS; Android 41371747372 SUCCESS; Spec Kit 41371747288 SUCCESS; actionlint 41371747301 SUCCESS; browser matrix 41371747424 SUCCESS.
- Browser performance (1,000,000 chars, reference Ubuntu Chromium): Source p95 45.6 ms (<100), Preview p95 344.5 ms (<500).
- Markdown route initial JS 252.0 KiB gzip (<300).
- No merge, master not modified.

GATES:
- SECURITY_OWNER review of iframe CSP/bridge, incremental render channel, Mermaid SVG handling, dependency/license status.
- DATA_OWNER review of File System Access permission/overwrite races beyond mocks.
- PLATFORM_OWNER review of real Android-browser PWA accessibility, touch and IME; Android debug build passed, not native editor parity.
- QUALITY_OWNER final CA01–CA12/CA-D01..D05 evidence mapping and exact-head repeat CI.
- Separate human merge authorization. Owner roles are not assigned to individuals and none may be inferred.

BLOCKERS: Unassigned owner approvals and merge authorization; security/license review and targeted device/API checks NOT VERIFIED.

INVARIANTS: REAL STATE > HANDOFF > MEMORY > CHAT; no automatic merge, backend, remote inference, autosave, unapproved Android editor, force push, or false PASS.

NEXT: Compare current PR head to this verified SHA; inspect active jobs/reviews, close any technical failures, obtain owner signoff, seek explicit merge approval only after gates are green.

VERIFY-FIRST: Check live GitHub state and all exact-head checks. Do not treat this handoff as proof of checks on a later commit.
