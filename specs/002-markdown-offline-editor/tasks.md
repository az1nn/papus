# SPEC-MD-001 — Roadmap tasks

Status: M0 merged in PR #5; M1–M5 implementation explicitly authorized 2026-11-01 in ONE draft PR #6. No merge authorized.
Decision record: G1=B G2=Other G3=A G4=Other G5=B G6=C G7=C G8=C; R1=Other (PWA only), R2=A, R3=D, R4=C, R5=A.

## M0 — Documentary gate (separate draft PR)
- [x] M0.1 Reconcile master and Constitution v2.0.0; record decisions R1–R5 and preserve G1–G8.
- [x] M0.2 Update SPEC, plan and tasks; resolve C01–C05 as documented design decisions.
- [x] M0.3 Update ADR-MD-001..003 and add ADR-MD-004..005.
- [x] M0.4 Verify M0 documentation CI at exact PR head and collect evidence. Initial checks at `871b8f04599d9b2236daa29f8c224a6dc9a3d667`: [Spec Kit](https://github.com/az1nn/papus/actions/runs/40874183200) PASS; [frontend](https://github.com/az1nn/papus/actions/runs/40874183108) PASS. Revalidate exact HEAD after this evidence-only commit; final evidence belongs in PR discussion.
- [x] M0.5 Separate human authorization for functional M1–M5 received 2026-11-01; only draft PR #6, no merge approval.

## M1 — Canonical core, Source, explicit file operations
- [ ] M1.1 Define typed canonical document and offset/patch contracts.
- [ ] M1.2 Integrate Source adapter and undo/redo.
- [ ] M1.3 Implement explicit local Open, Save, Save As and fallback export.
- [ ] M1.4 Validate LF/CRLF, BOM, Unicode and write-failure behavior.

## M2 — Preview parsing, source maps, localized text patches
- [ ] M2.1 Implement isolated Preview and AST parsing with source position mapping.
- [ ] M2.2 Implement Preview text-only edit guards, validated bridge and localized patches.
- [ ] M2.3 Add round-trip and unsupported-selection regression fixtures.

## M3 — GFM, Mermaid, math, syntax highlighting, YAML
- [ ] M3.1 Add GFM and local Mermaid, math, YAML and highlighting renderers.
- [ ] M3.2 Add sanitization, CSP and malicious-document tests (security scaffolding begins in M2).

## M4 — Responsive layouts, keyboard and touch
- [ ] M4.1 Implement desktop resizable split and mobile tabs/vertical split.
- [ ] M4.2 Validate touch, IME, keyboard accessibility and 320px layout.

## M5 — Optional diff, errors and integration documentation
- [ ] M5.1 Implement optional diff without implicit persistence.
- [ ] M5.2 Verify CA01–CA12 and CA-D01..D05 with exact-head test evidence.

## Evidence discipline for PR #6
- M1 initial checkpoint `93a41246777fa050d39a9213cb6f530b24ec2f42`: frontend-gates PASS at its exact SHA.
- M2 checkpoint `59b378b2ef50a2e8990e25dad0664eaf582cbbd5`: frontend-gates PASS at its exact SHA.
- M3 initial checkpoint `d0116e8f10f2ea2100866005a8cda215569c8642`: frontend-gates FAIL (rich-rendering tests). Restored renderer in `6066c42b589e165e85d8acbac0a3ff20cc8d1edf`; exact-head revalidation required.
- M4 checkpoint `f7ed2b5e9ca04ee45db7983ee9154b3ff882a056`: inherited M3 test failure; not considered PASS.
- M5: code and documentation submitted to same draft PR; tests and owner/security review required.
- M1–M5 checkboxes intentionally remain unchecked until the relevant acceptance criteria are verifiably met. No merge authorization granted.

## Handoff
The initial documentation was merged in PR #3; this M0 PR updates planning only. R5=A means one FUTURE functional PR for M1–M5, not a merge or implementation authorization. M0.4 requires live CI evidence; M0.5 was separately authorized on 2026-11-01. No functional task may be checked until evidence exists. Final merge still requires separate explicit approval.
