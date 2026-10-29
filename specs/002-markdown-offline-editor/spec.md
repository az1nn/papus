# SPEC-MD-001 — Offline Markdown Editor

Status: Approved planning; M0 documentation authorized; functional implementation NOT authorized.
Constitution: Papus v2.0.0.
Decision record: G1=B, G2=Other, G3=A, G4=Other, G5=B, G6=C, G7=C, G8=C.
Preimplementation review: R1=Other (Web PWA only), R2=A, R3=D, R4=C, R5=A.
Scope: Papus Universal Reader, reusable frontend-only Markdown editor library, Web PWA only. Android/Capacitor adapter and native editor delivery excluded from this SPEC; existing Android reader behavior must not regress.

## Outcome
Offline Markdown Source and Preview with a single canonical source. Source edits text and structure; Preview corrects only unambiguously mapped text via validated localized patches. No backend, Git/SIGA runtime integration, remote inference, cloud storage, authentication, autosave or implicit writes.

## Functional requirements
- FR01: Open local .md files; preserve untouched UTF-8 ranges, BOM, LF/CRLF including mixed terminators, and Unicode where supported.
- FR02: Source supports structural edits, selection and undo/redo.
- FR03: Preview reflects Source and edits only safely mapped text spans.
- FR04: Preview patches validate expected revision, UTF-16 boundaries and AST mapping; reject ambiguous or structural ranges without mutation.
- FR05: Manual Save and Save As via File System Access API where supported, import via file input and export/download fallback elsewhere; no autosave.
- FR06: Optional on-demand diff against last confirmed saved version.
- FR07: Local GFM tables, tasks and fenced code.
- FR08: Offline Mermaid, KaTeX-compatible math, highlighting and YAML frontmatter.
- FR09: Resizable desktop split; mobile tabs or vertical split; keyboard, touch and IME support down to 320px.
- FR10: Warn on dirty state and report permission, decoding, write and rendering failures without false success.
- FR11: Detect external changes before overwrite where platform permits; warn or block on conflict, never overwrite silently.
- FR12: Preserve unsupported Markdown syntax; Preview editing disabled when mapping is unsafe.
- FR13: Untrusted Preview rendered with defense in depth: sanitization, URL allowlist, isolated sandboxed iframe, restrictive CSP, local assets, validated message bridge and negative security tests.
- FR14: Functional delivery in ONE PR for M1–M5, with per-milestone commits, verification checkpoints, exact-head CI and explicit human merge approval.

## Integrity and persistence contract (R2/R3)
- Canonical Source is Unicode text with UTF-16 offsets and metadata for original bytes, UTF-8/BOM, line endings, revision, saved baseline and dirty state.
- UTF-8 is the supported editable encoding. Reject invalid UTF-8 without silent replacement. Unsupported encodings require an explicit conversion decision; never silently overwrite originals.
- Preserve unedited spans and mixed line endings; no whole-document AST reserialization or silent newline normalization.
- Opening and rendering never write. Direct Save is 'saved' only after successful write completion; browser download is 'download requested', not proof of persistence.
- Save As does not silently overwrite the original. User consent is required for any write. No background recovery guarantee.

## Security boundaries (R4)
- Source and file capabilities remain in the trusted app; the untrusted document and derived Preview have no direct file/storage capabilities.
- Sanitize HTML/SVG/diagram output; disallow executable markup, dangerous URL schemes and document-initiated remote resource requests.
- Preview uses sandboxed iframe with restrictive CSP; never combine permissive same-origin and script privileges for untrusted content. The bridge validates message origin/source, schema, revision and allowed operations.
- All rendering assets ship locally. Offline operation is tested with network disabled after PWA install.

## Acceptance criteria
- CA01: Open, edit and export Markdown offline, preserving supported untouched ranges.
- CA02: Source updates Preview without content loss.
- CA03: Preview edits create localized source patches only.
- CA04: Ambiguous/cross-node selections reject without mutation.
- CA05: No write before explicit Save/Save As; errors reported.
- CA06: Save As preserves original.
- CA07: Optional diff compares against confirmed saved baseline.
- CA08: GFM, Mermaid, math, highlighting and frontmatter work offline.
- CA09: Desktop/mobile layout transitions preserve content and focus where feasible.
- CA10: Malicious HTML, SVG, URLs and diagrams cannot execute arbitrary code.
- CA11: No Git, SIGA, backend, authentication or remote runtime dependency.
- CA12: Undo/redo, malformed files, denied writes and external modifications tested.
- CA-D01: No silent encoding or newline normalization.
- CA-D02: Distinguish confirmed Save from download requested.
- CA-D03: Preview isolation, sanitization and CSP prevent document-origin code execution and exfiltration.
- CA-D04: Patch revision and structural guards reject unsafe edits without mutation.
- CA-D05: CA01–CA12 and supplemental gates verified on exact PR HEAD before merge consideration.

## Governance
M0 is documentation only. M1–M5 require a SEPARATE explicit implementation authorization. The approved delivery strategy is one functional PR (R5=A), not a merge authorization. The original SPEC documentation was integrated through PR #3; references to an unmerged documentation-only draft are historical, not current state.
