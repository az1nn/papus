# Papus — Universal Reader AI Constitution

**Version:** 2.0.0
**Ratified:** 2026-10-25 (original baseline)
**Last Amended:** 2026-10-26
**Status:** Proposed breaking amendment in draft PR #2; not ratified until human review and integration.

## Constitutional decisions

Approved grilling: G1=B; G2=C; G3=C; G4=C; G5=A; G6=C; G7=B; G8=D. This MAJOR amendment replaces incompatible v1.0.0 requirements; the changes are documentation and governance only, not claims that the application implements them.

## I. Frontend-only boundary and architecture decisions

Papus MUST retain a client-side application without a required proprietary application backend for core document ingestion, reading, rendering, and local persistence. Static hosting, development tooling and CI are not runtime backends. An application server, document-upload API, covert proxy, or server database MUST NOT be introduced by an ordinary task. Specific frameworks, libraries, and deployment mechanisms belong in versioned ADRs. External inference is permitted only under Principle II, not as an exception to the no-hidden-backend rule.

**Gate:** Inspect production artifacts, network behavior, and architecture changes for unexpected runtime server dependencies.

## II. Privacy, offline baseline and hybrid processing

The supported baseline reader, local search, and deterministic Intelligent UI MUST work without a network connection after required assets are installed. The system MAY automatically choose local or remote inference according to user-configured permissions, provider availability, complexity and disclosed cost constraints. Automation MUST NOT imply permission to transmit documents. Remote disclosure requires prior, informed, revocable authorization scoped to provider, content category and purpose; absent valid permission, the operation MUST remain local or report unavailable. The user MUST be able to identify remote processing and its destination. No private long-lived credential may be embedded in public client artifacts. Remote integration without a secure public-client authentication mechanism MUST remain disabled. Storage, migration and deletion MUST preserve user control and prevent silent loss.

**Gate:** Offline core passes; unauthorized document egress is rejected; permission revocation and authentication failure are tested.

## III. Dual representation and truthful fidelity

Supported formats include HTML/HTM, PDF, DOC/DOCX and PPT/PPTX under explicit format contracts. The product MUST distinguish an Original representation (best feasible layout fidelity) from an Intelligent representation (semantic reading, structured interaction and accessibility). The Intelligent representation MUST retain traceable references to source content where extraction allows; untraceable transformations MUST be disclosed. Unsupported features, OCR absence, malformed/protected files and fidelity limits MUST be reported accurately. Neither view may claim fidelity that has not been demonstrated.

**Gate:** Format-by-format test fixtures verify extraction, provenance, failures and disclosed fidelity limitations.

## IV. Layered Intelligent UI and inference independence

The system MUST separate parser, semantic model, local or remote generator, typed OpenUI program validation, and renderer through explicit contracts. The renderer MUST function without GPT-6 and MUST NOT label deterministic or imported output as model inference. Generated programs are untrusted data, never executable authority. Components, actions and bindings MUST pass typed allowlist validation before display.

**Gate:** Contract tests prove renderer independence, provenance labels and rejection of disallowed programs.

## V. Sanitization and allowlist security

Imported HTML and other untrusted content MUST be sanitized appropriately before rendering. OpenUI programs MUST be schema-validated against explicit component and action allowlists. Arbitrary document-provided JavaScript, unsafe URLs, unauthorized external fetches and implicit privileged actions are prohibited. Sandboxed frames, workers, capability brokers and advanced isolation MAY be introduced through risk-based ADRs but are not universal constitutional prerequisites. Removing existing isolation requires an explicit security review, not a silent implementation shortcut. Parsers MUST handle malformed and resource-intensive input defensively.

**Gate:** Negative tests cover injection, URLs, invalid schemas, malicious documents, unintended network access and resource guardrails.

## VI. Web-first delivery and progressive Android support

Web PWA is the priority platform. Android capabilities MAY follow incrementally; a maintained support matrix MUST mark available, limited and unsupported features. Shared business logic and format contracts SHOULD be reused to avoid unreviewed forks. Every advertised platform capability MUST meet its own accessibility, usability and verification criteria, including touch, keyboard, focus and assistive semantics as applicable. Performance limits and cancellation behavior MUST be specified per capability.

**Gate:** Production PWA tests are required for affected Web behavior; Android checks are required when Android capability or shared platform-sensitive code changes.

## VII. Risk-proportionate verification and evidence

Every feature MUST have observable acceptance criteria, out-of-scope boundaries and a test plan. A documented risk-to-gate matrix MUST define baseline checks and additional tests for parsing, rendering, security, storage, inference, PWA and Android changes. No test is PASS without reproducible evidence tied to the exact tested commit SHA. Missing required evidence blocks approval; unrun tests are NOT VERIFIED, not PASS.

**Gate:** PR reports risk classification, applicable checks, command outcomes, CI links, exact SHA and residual gaps.

## VIII. Contract-based ownership and SIGA governance

Each domain MUST have versioned boundaries, an accountable owner role, acceptance criteria, review authority and escalation rules. SIGA MUST follow RECONCILE → CLASSIFY (RESUME | WATCH | ADVANCE) → EXECUTE → VERIFY → HANDOFF, with VERIFY-FIRST and REAL STATE > HANDOFF > MEMORY > CHAT. Owners control their domain contracts; cross-domain changes require affected-owner review, and unresolved conflicts block integration. Ownership does not grant unrestricted merge rights or override human approval requirements. SIGA MUST preserve concurrent claims, existing PRs, assets and evidence; it MUST NOT force-push, self-certify missing gates, or merge without explicit authorization.

**Gate:** Every implementation PR identifies affected domain owners, contract changes, concurrent work, approvals and handoff evidence.

## Architecture and governance

The constitution governs invariants; ADRs govern replaceable technical decisions; specs govern behavior and acceptance; plans/tasks govern implementation. The domain contract and ownership registry is versioned in `docs/architecture/domain-ownership.md`. ADRs in `docs/adr/` are proposed until independently accepted. A Constitution Check is mandatory in every spec and plan; conflicts with a MUST stop implementation until approved resolution.

Amendments MUST document rationale, migration impact, affected artifacts, test requirements and SemVer. MAJOR changes break prior normative rules, MINOR adds compatible obligations, PATCH clarifies without changing obligations. Dedicated PR and human approval are required for constitutional amendments. No draft PR, passing CI, or autonomous agent action ratifies an amendment. This v2.0.0 text is proposed in PR #2 and becomes authoritative only after approved integration.

## Change impact and non-claims

This amendment replaces v1.0.0's unconditional no-remote-document rule, mandatory HTML sandbox, immediate platform parity, and uniform gate interpretation. It does not implement remote inference, alter the runtime, certify security, or claim Android parity. See `specs/001-constitution-v2/` and `docs/adr/` for rationale and verification.
