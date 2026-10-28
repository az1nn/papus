# ADR-MD-001 — Canonical Markdown and text-only Preview

Status: Proposed
Context: The editor must preserve arbitrary Markdown and avoid lossy WYSIWYG conversion.
Decision: The original Markdown source is authoritative. AST and Preview are derived. Only source-mapped text spans are editable in Preview; structural syntax is Source-only. Preview writes validated localized patches; ambiguous ranges are rejected.
Consequences: High-fidelity diffs and predictable editing, at the cost of a source-map/patch engine and restricted visual editing.
Verification: CA02, CA03, CA04 and byte-preservation golden tests.
