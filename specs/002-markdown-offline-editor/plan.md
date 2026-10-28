# SPEC-MD-001 — Technical plan and roadmap

Status: Proposed; implementation not authorized.

## Architecture
- Framework-independent Markdown Document Core: canonical source, AST ranges, patch validation, dirty state.
- Source adapter: CodeMirror 6 candidate, with controlled edits and history.
- Preview adapter: unified/remark-parse + remark-gfm; source-range mapped text editing only.
- Renderer adapters: local Mermaid, KaTeX, syntax highlighter and frontmatter display.
- File adapter: browser File API / File System Access API where supported; explicit download/export fallback.
- Diff adapter: optional comparison of working source against last saved source.
- Shell adapter: desktop split resize, mobile tabs and vertical split.

Libraries are candidates subject to license, bundle size, browser support and security review. The core must not import Git/SIGA services.

## Milestones
| Milestone | Scope | Exit evidence |
| --- | --- | --- |
| M1 | Canonical core, Source and explicit file operations | Offline file round-trip, no implicit writes |
| M2 | Preview parsing, source maps, localized text patches | Structural preservation and ambiguity rejection |
| M3 | GFM, Mermaid, math, highlighting, YAML | Offline fixtures, malicious-content security tests |
| M4 | Responsive layouts, keyboard and touch | 320px, orientation, focus and selection tests |
| M5 | Optional diff, errors and integration documentation | CA01–CA12 evidence and regression suite |

## Test matrix
- Golden files: CRLF/LF, BOM, Unicode, links, tables, tasks, HTML comments, frontmatter, code fences, Mermaid and math.
- Mutation tests: edit plain text and formatted spans; assert unchanged source slices are byte-identical.
- Negative tests: cross-node selection, malformed syntax, unsupported encoding, dangerous URL, script/HTML/SVG injection.
- Persistence tests: user-initiated Save, Save As, denied permissions, interrupted writes and external modifications.
- Browser tests: offline PWA, touch/IME, keyboard, layout changes, large documents and error handling.
- Verification must be exact-head; CI passing on older commits does not validate a newer head.

## Delivery policy
Only this documentation, ADRs and roadmap may be committed in the current PR. No application code, workflow changes, package changes, constitutional files or merge.
