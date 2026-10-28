# ADR-MD-003 — Modular adapters and safe offline rendering

Status: Proposed
Context: Reusable frontend-only library must support GFM and technical documentation across desktop/mobile.
Decision: Framework-independent core with separate Source, Preview, File, Diff, Layout and Renderer adapters. Candidate tools: CodeMirror 6, unified/remark, Mermaid, KaTeX and local syntax highlighting. Sanitize untrusted HTML/SVG/URLs and avoid remote runtime dependencies.
Consequences: More interfaces and bundle management; independently testable security and rendering boundaries.
Verification: CA08–CA12 and security/offline/browser matrix.
