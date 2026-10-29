# ADR-MD-003 — Modular adapters and safe offline rendering

Status: Accepted for planning; implementation pending separate authorization.
Decisions: G4=Other, G6=C, G7=C, G8=C, R1=Web PWA only.
Context: Reusable frontend-only library for technical Markdown, with no Git/SIGA/backend dependency.
Decision: Framework-independent core plus Source, Preview, File, Diff, Layout, Renderer and Security adapters. Deliver only to Web PWA; Android/Capacitor native editor adapter excluded from SPEC-MD-001. Candidate libraries CodeMirror 6, unified/remark, Mermaid, KaTeX and local highlighting require dependency/license/security/bundle review. Render all supported features offline and protect existing Universal Reader integrations.
Consequences: More contracts, bundle management and browser-specific fallback testing.
Verification: CA08–CA12, CA-D03 and browser/offline tests.
