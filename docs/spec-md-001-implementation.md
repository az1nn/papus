# SPEC-MD-001 — Implementation contracts and verification
This document describes the draft PR #6 implementation, not a claim of product homologation.

## Web-only integration
Web PWA: open /markdown or the "Editor .md" navigation item. No native Android editor adapter. Existing reader routes remain unchanged.
Reusable workspace package: packages/markdown-editor. The core has no React, network, backend or persistence side effects.

## Canonical Source
MarkdownDocument keeps a Unicode string, revision, saved baseline and UTF-8/BOM metadata.
File import uses strict TextDecoder fatal mode; no invalid-byte replacement. Changes are localized UTF-16 offset patches, with surrogate and CRLF boundary guards. Undo/redo does not mark content persisted.
Direct Save requires an existing File System Access handle and checks external bytes before overwrite. Successful stream close is required before reporting "saved". Save As uses explicit browser picker; unsupported browsers use download/export but report "download requested" and retain dirty state.
No autosave, background recovery guarantee or implicit writes.

## Preview trust boundary
Parsed Markdown is rendered as a whitelist of HTML elements. Document HTML is escaped. URLs never auto-load remote resources. The Preview body is sanitized with DOMPurify before insertion into a sandboxed iframe with allow-scripts but never allow-same-origin. CSP denies network requests and privileged resources. The script capability is confined to plain-text correction messages.
The parent accepts only messages from the exact iframe window, opaque origin "null", matching channel token, document revision, exact AST text span and expected substring. Structural, multiline and ambiguous patches are rejected without mutating canonical Source.
GFM is parsed locally. KaTeX produces MathML. Highlight.js supports a fixed language allowlist. Mermaid is lazy-loaded, limited in size/count, configured with strict security, sanitized and converted into a data:image/svg+xml asset inside the sandbox. YAML is parsed locally and Source remains canonical.
Security review of Mermaid versions, SVG sanitization and iframe injection remains a mandatory gate.

## UI contract
Desktop split ratio slider (25–75%). Mobile source/preview/split modes, keyboard labels, 320px layout and composition buffering. Diff is read-only/on-demand against the last *confirmed* saved baseline, with a bounded line-count guard.

## Tests and evidence required before merge
| Gate | Scope | Current classification |
| --- | --- | --- |
| CI-01 | Vitest, typecheck, build | Re-run exact PR HEAD |
| CI-02 | UTF-8/BOM/LF/CRLF, Unicode, patch, source maps | Tests added; results per SHA |
| CI-03 | XSS/URL/SVG/Mermaid/bridge negative cases | Unit/e2e added; full security review NOT VERIFIED |
| CI-04 | Chromium / Firefox / WebKit browser matrix and API fallback | Chromium in current pipeline; others NOT VERIFIED |
| CI-05 | Installed PWA offline | Existing Chromium smoke; editor-specific offline NOT VERIFIED |
| CI-06 | Save/Save As/download/permissions/conflicts | Unit tested; cross-browser picker permissions NOT VERIFIED |
| CI-07 | Universal Reader regression | Existing regression suite |
| CI-08 | Exact HEAD | Required; earlier green is not final proof |
| CI-09 | CA01–CA12, CA-D01..D05 | Pending final evidence |
| CI-10 | Domain ownership & explicit merge authorization | PENDING; no merge authorized |

Security, performance and feature claims must not exceed observed test results. A green frontend build does not satisfy all CI-01..CI-10.
