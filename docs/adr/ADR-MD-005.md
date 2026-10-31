# ADR-MD-005 — One functional PR with milestone checkpoints

Status: Accepted for planning; implementation pending separate authorization.
Decisions: R5=A.
Context: User selected one functional PR for M1–M5 rather than separate PRs or isolated core-first delivery.
Decision: After separate authorization, use one functional PR for M1–M5, with coherent commits and independently verified M1/M2/M3/M4/M5 checkpoints. Maintain exact-head CI, owner review, security gates and final CA01–CA12 plus CA-D01..D05 evidence. Do not merge partially or automatically. M0 documentation uses a separate draft PR and never authorizes runtime changes.
Consequences: Larger diff and integration risk; mitigate via incremental review, strict checkpoints, change log and final regression suite.
Verification: CI-01..CI-10 and human approval before merge.
