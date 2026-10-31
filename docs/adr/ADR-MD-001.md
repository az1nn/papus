# ADR-MD-001 — Canonical Markdown and text-only Preview

Status: Accepted for planning; implementation pending separate authorization.
Decisions: G1=B, G2=Other, R3=D, R4=C.
Context: Markdown syntax and untouched spans must not be lost through WYSIWYG reserialization.
Decision: Canonical Source is a Unicode string with UTF-16 offsets, revision and original UTF-8/BOM/newline metadata. AST and Preview are derived. Preview edits only unambiguously mapped textual spans through localized, revision-checked patches. Structural delimiters, URLs, YAML, code, Mermaid and math are Source-only. Reject stale or ambiguous mappings without mutation. Preserve mixed LF/CRLF and untouched supported ranges; invalid UTF-8 is not silently repaired.
Consequences: Strong fidelity and predictable diffs; source-map, patch and Unicode boundary tests required.
Verification: CA01–CA04, CA-D01, CA-D04 and golden fixtures.
