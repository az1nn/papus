# ADR-MD-004 — Untrusted Preview isolation and defense in depth

Status: Accepted for planning; implementation pending separate authorization.
Decisions: R4=C.
Context: Local Markdown, HTML, SVG, Mermaid and links are untrusted and may attempt script execution or remote exfiltration even in an offline-first PWA.
Decision: Sanitize rendered HTML/SVG/diagram output; enforce URL/resource policy and restrictive CSP; ship renderer assets locally; render untrusted Preview in isolated sandboxed iframe. Do not grant same-origin and script privileges together for untrusted content. Keep Source and file APIs outside Preview. If interactive Preview needs scripts, use a narrowly scoped typed postMessage bridge validating sender/source, message schema, expected revision, permitted text ranges and operation; deny other capabilities. Security controls start with M2 Preview, not deferred to M3.
Consequences: More complex selection and focus synchronization, but additional containment. CSP, iframe policy and Mermaid renderer must be exercised in browser E2E.
Verification: CA03, CA04, CA10, CA-D03, CA-D04, CI-03, CI-05.
