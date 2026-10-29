# ADR-MD-002 — Offline manual persistence

Status: Accepted for planning; implementation pending separate authorization.
Decisions: G3=A, G5=B, R1=Web PWA only, R2=A, R3=D.
Context: Offline editing must never imply autosave or falsely claim persistence.
Decision: Use File System Access API when available for explicit Save/Save As; use file input and download/export fallback otherwise. A completed direct write may be reported as saved; a browser download is only 'download requested'. Track dirty state and warn on navigation. Save As never silently overwrites the original. Detect external modifications where APIs permit; on conflicts require user resolution. Reject invalid UTF-8 and require explicit conversion for unsupported encodings.
Consequences: Browser compatibility fallback and permission handling; no guaranteed recovery after unsaved tab closure.
Verification: CA01, CA05–CA07, CA11–CA12, CA-D01, CA-D02.
