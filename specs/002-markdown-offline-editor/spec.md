# SPEC-MD-001 — Offline Markdown Editor

Status: Proposed / documentation-only
Decision record: G1=B, G2=Other, G3=A, G4=Other, G5=B, G6=C, G7=C, G8=C
Scope: Papus Universal Reader; independent frontend-only editor library.
Base: master at 9bb79c9839c778c3d3db63754af6bf6fbe6cc8aa.

## Problem and outcome
Provide an offline, reusable Markdown editor with synchronized Source and Preview. The Markdown source is the sole canonical representation. Source may edit structure and text; Preview may correct only safely mapped textual spans. No Git, SIGA, remote API, backend or authentication dependency.

## Functional requirements
- FR01: Import local .md files, preserving bytes for untouched spans.
- FR02: Source editor supports full Markdown changes, undo/redo and selection.
- FR03: Preview reflects Source changes and supports only safe inline text corrections.
- FR04: Preview edits use validated localized source patches; reject ambiguous ranges.
- FR05: Manual Save and Save As; no autosave, implicit commit or background upload.
- FR06: Optional diff on demand, never mandatory for normal Save.
- FR07: Offline GFM rendering including tables, tasks and fenced code.
- FR08: Offline Mermaid, KaTeX-compatible math, syntax highlighting and YAML frontmatter support.
- FR09: Configurable responsive layout: resizable desktop split, mobile tabs or vertical split.
- FR10: Warn on unsaved changes; expose read/write failures without claiming success.
- FR11: Detect external file changes when platform APIs permit, before overwrite; no distributed locking.
- FR12: Unsupported Markdown syntax remains intact; Preview editing disabled where safe mapping cannot be proven.

## Invariants and boundaries
- Source string is authoritative; AST and rendered Preview are derived projections.
- No whole-document reserialization after Preview edits.
- No mutation of Markdown structural delimiters, link targets, table delimiters, YAML, code, Mermaid or math from Preview.
- Offline assets only; sanitize untrusted HTML/SVG, links and Mermaid output.
- File persistence uses user-initiated platform capabilities; fallback to download/export when direct write is unavailable.
- No remote synchronization, Git adapter, SIGA coordination or runtime feature in this documentation phase.
- G1–G8 are editor grilling decisions, separate from Constitution v2.0.0 grilling decisions on PR #2.

## Nonfunctional requirements
- Preserve untouched bytes including newline style (LF/CRLF), BOM and encoding where supported; define explicit unsupported-encoding behavior.
- Accessible keyboard focus, screen-reader semantics, touch selection and 320px viewport support.
- Local-only processing and no runtime network requirement for supported extensions.
- Performance thresholds to be measured and fixed in implementation planning, not claimed in advance.

## Acceptance criteria
- CA01: Open, edit and export Markdown offline with byte-identical untouched ranges.
- CA02: Source changes render in Preview without losing content.
- CA03: Preview text edits produce only localized patches in Source.
- CA04: Ambiguous/cross-node selections are rejected without mutation.
- CA05: No file write until explicit Save or Save As; failed writes are reported.
- CA06: Save As does not overwrite original.
- CA07: Diff is optional and reflects last saved version.
- CA08: GFM, Mermaid, math, highlighting and frontmatter operate offline.
- CA09: Desktop and mobile layout transitions preserve content and focus where possible.
- CA10: Malicious HTML, URLs and diagrams cannot execute arbitrary code.
- CA11: Editor operates without Git, SIGA, backend, authentication or remote services.
- CA12: Undo/redo, malformed files, write errors and external modification scenarios are tested.

## Exclusions
No implementation, dependencies, CI edits, commits to application runtime, merge, remote inference, cloud persistence, collaborative editing or constitutional ratification under this SPEC approval.
