# ADR-MD-002 — Offline manual persistence

Status: Proposed
Context: User explicitly rejects autosave and SIGA/Git coupling.
Decision: Offline editor with manual Save/Save As and optional diff. Use local file APIs when available and explicit export fallback. Never claim persistence before successful write; warn about dirty state.
Consequences: No background recovery guarantee. Platform-specific file permissions and external-modification warnings need explicit UX.
Verification: CA01, CA05, CA06, CA07, CA11.
