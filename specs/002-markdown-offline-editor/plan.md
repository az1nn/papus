# SPEC-MD-001 — Technical plan and roadmap

Status: M0 documentation authorized; implementation NOT authorized.
Decisions: R1=Web PWA only; R2=File System Access API + fallback; R3=hybrid UTF-8 preservation; R4=defense in depth; R5=one functional PR for M1–M5. Preserve G1–G8.

## Architecture
- Framework-independent canonical Markdown core: UTF-16 text offsets, original encoding/BOM and line-ending metadata, revision-checked patches, dirty state and undo/redo contract.
- Source adapter: CodeMirror 6 candidate; structure editing only in Source.
- Preview adapter: AST/source maps and localized text-only patches; isolated sandboxed iframe with validated message bridge.
- Security adapter: sanitize untrusted HTML/SVG/diagram output, URL policy, restrictive CSP, no remote document-initiated fetches.
- Renderer adapters: locally bundled GFM, Mermaid, KaTeX-compatible math, highlighting, YAML.
- File adapter: File System Access API for direct user-initiated writes where supported; file-input import and download fallback. Explicit Save, Save As, export status and conflict checks.
- Optional Diff adapter; responsive shell desktop split/mobile tabs or vertical split.
- Web PWA only; no native Android/Capacitor editor adapter. Shared Universal Reader behavior must remain intact.

Dependencies (CodeMirror, unified/remark, Mermaid, KaTeX and others) remain candidates pending license, security, CSP and bundle evaluation.

## M0 — Preimplementation documentary gate
- Ratify R1–R5 and preserve G1–G8; reconcile canonical repo and Constitution v2.0.0.
- Update SPEC, plan, tasks, ADR-MD-001..003 and add ADR-MD-004..005.
- Resolve C01: move implementation authorization before M1; C02: PWA-only scope; C03: typed Preview bridge; C04: single-PR checkpoint policy; C05: performance budgets and browser matrix.
- Submit M0 documentation in a separate draft PR, with exact-head Spec Kit validation; no merge.
- Obtain explicit separate approval before any M1–M5 implementation.

## Milestones and checkpoints
| Milestone | Scope | Exit evidence |
| --- | --- | --- |
| M1 | Canonical core, Source, undo/redo, manual Open/Save/Save As/export | Offline round-trip, BOM/UTF-8/mixed newline fixtures, denied-write behavior |
| M2 | Isolated Preview, AST/source maps, localized text-only patches | Structural preservation, bridge validation, ambiguity rejection |
| M3 | Local GFM, Mermaid, math, highlighting, YAML, security hardening | Offline fixtures, CSP/XSS/SVG/URL/diagram negative tests |
| M4 | Responsive layout, keyboard, touch, IME | 320px, orientation, focus, selection and accessibility tests |
| M5 | Optional diff, error handling, integration and final homologation | CA01–CA12, CA-D01..D05 and regression suite at exact HEAD |

R4 security scaffolding is required at the first Preview increment in M2, not postponed until M3.

## R5 delivery policy
- ONE functional PR for M1–M5 after separate authorization. Each milestone is a reviewable commit/checkpoint within the same branch; no partial merge or automatic merge.
- Require per-milestone test evidence and final exact-head verification. CI on an earlier SHA does not validate later commits.
- No implementation, dependencies, workflow modifications or runtime changes in the M0 documentation PR.

## CI gates
- CI-01: TypeScript, available lint, unit tests and build.
- CI-02: Golden fixtures for BOM, mixed LF/CRLF, Unicode, UTF-8 failures, source maps and patches.
- CI-03: Security negatives: XSS, SVG, Mermaid, URLs, CSP and iframe bridge.
- CI-04: Browser E2E in Chromium, Firefox and WebKit; feature fallback tests and documented exceptions.
- CI-05: Installed PWA offline with no document-origin remote requests.
- CI-06: Save/Save As/export, permissions, interrupted writes and external modification conflicts.
- CI-07: Existing Universal Reader regression.
- CI-08: Exact-head SHA for all required checks.
- CI-09: Acceptance evidence CA01–CA12 and CA-D01..D05.
- CI-10: ADR review, owner review and explicit human merge approval.
Existing constitutional gates remain applicable, including shared Android regressions when shared files are touched. 'NOT VERIFIED' is not PASS.

## C03 — Preview bridge design constraints
The sandboxed Preview must not access canonical Source, IndexedDB or file APIs directly. Define a typed request/response protocol with versioned schema, expected source revision, range and text-only intent; reject stale, forged, cross-node or ambiguous patches. Evaluate whether the iframe can operate without scripts; if scripts are needed, enforce isolation without same-origin privileges and a narrowly scoped message protocol.

## C05 — Performance and compatibility planning budgets
Initial proposed (not measured or approved as achieved): 1 MiB Markdown document for interactive editing; Source keystroke response p95 <= 100 ms on reference desktop; Preview refresh p95 <= 500 ms for 1 MiB document after idle; app JS initial gzip budget <= 300 KiB excluding lazy-loaded diagram/math engines. Benchmark on a defined reference machine in M1 and refine with evidence before M3. Larger documents may degrade gracefully with warning, never silently truncate.
Browser matrix: current stable Chromium, Firefox and WebKit desktop, plus Chromium Android browser as mobile PWA; File System Access write support is feature-detected, not assumed. Validate fallback and keyboard/touch/IME. No native Android build is required specifically for this editor.

## Risk register
| ID | Risk | Mitigation | Priority |
| --- | --- | --- | --- |
| RK01 | XSS / document exfiltration | sandbox, CSP, sanitization, URL restrictions, negative tests | P0 |
| RK02 | Write failure / data loss | explicit Save states, dirty flag, error tests | P0 |
| RK03 | Structural corruption from Preview | source maps, revision guards, reject ambiguity | P0 |
| RK04 | Browser API incompatibility | feature detection and download fallback | P0 |
| RK05 | Encoding corruption | strict UTF-8, BOM and newline fixtures | P0 |
| RK06 | Large single PR | milestone commits, evidence checkpoints, owner review | P0 |
| RK07 | PWA bundle growth | lazy loading and measured budgets | P1 |
| RK08 | Universal Reader regression | integration tests and shared gates | P0 |
