<!--
SYNC IMPACT REPORT
Version: unratified → 1.0.0
Scope: initial adoption of GitHub Spec Kit in the existing Papus repository
Changed principles: created I–VIII
Downstream artifacts: future spec.md, plan.md, tasks.md and checklists MUST pass these gates
Deferred: no claims of passing CI, Android build, model integration, or browser tests without exact evidence
-->

# Papus — Universal Reader AI Constitution

**Version:** 1.0.0
**Ratified:** 2026-10-25
**Last Amended:** 2026-10-25
**Status:** Ratified baseline for future specifications; existing behavior remains subject to verification.

## Core Principles

### I. Frontend-Only Is a Hard Architectural Boundary

Papus MUST remain a client-side application delivered as a static Web PWA and Android application through Capacitor, sharing the React/TypeScript source tree. The Vite development server and CI runners are development infrastructure, not an application backend. Implementations MUST NOT introduce application servers, dedicated backend APIs, proxy services, document upload endpoints, server-side conversion, server databases, or a backend solely for inference. Any proposal that cannot run safely within this boundary MUST be scoped as a separately approved constitutional amendment and ADR, not quietly introduced as an implementation detail.

**Gate:** Static build deploys without a runtime application server; no application `/api/*` endpoints, embedded server, or hidden document upload path.

### II. Local-First Privacy and Offline Operation

Document ingestion, extraction, browsing, search, persistence, and baseline Intelligent UI rendering MUST work on the client without sending the document or its text to external services. Documents MUST stay on the user's device unless a future, separately specified and explicitly consented export is approved. Use IndexedDB for the browser-side library with quota awareness, deterministic migrations, clear failure states and rollback for destructive mutations. NEVER package private API tokens, service secrets, or `OPENAI_API_KEY` in JavaScript bundles, native assets, IndexedDB, or build-time public environment variables.

**Gate:** With the network disabled after installation, the supported core workflows remain functional. Test that import and rendering do not issue network requests containing document content.

### III. Explicit Format Contracts and Honest Fidelity

The reader MUST accept HTML/HTM, PDF, DOC/DOCX, and PPT/PPTX through local-only parsers. The UX MUST distinguish original-layout rendering, semantic conversion, text extraction, unsupported content and failed extraction. It MUST NOT represent text-only PPT/PPTX as a faithful slide renderer, text-only DOC as faithful Word layout, or scanned PDF as searchable without an actual OCR feature. HTML MUST be sanitized before display. Unsupported, protected, damaged or oversized files MUST yield actionable error states without crashes or silent data loss.

**Gate:** Tests cover each format, at least one malformed case, declared fidelity limits, and independent file processing.

### IV. Intelligent UI Is a Renderer; GPT-6 Is a Separate Inference Boundary

The internal `@reader/intelligent-ui` package MUST use the real OpenUI / OpenUI Lang rendering model through typed, allowlisted components. Deterministic local generation, imported OpenUI Lang and LLM-generated outputs MUST be explicitly distinguished in code and user interface. No view, search result, heuristic extraction or mock output may be presented as GPT-6 inference. If inference cannot be authenticated securely in a frontend-only environment, it MUST remain unavailable rather than expose a long-lived secret. Manual prompt export and validated program import are valid offline workflows.

**Gate:** Renderer is usable without GPT-6; unsupported OpenUI actions, remote images, Query/Mutation, scripts and arbitrary bindings are rejected by policy tests.

### V. Secure Parsing and Defensive Rendering

All imported documents and OpenUI programs are untrusted input. HTML MUST be sanitized, isolated in a sandboxed iframe with restrictive content security policy, and MUST NOT execute document-provided scripts. OpenUI Lang MUST pass a typed component catalog and input validation before rendering; arbitrary JavaScript execution, untrusted URLs and implicit external fetches are forbidden. Dependencies and asset loaders MUST be reviewed for client-side exposure, excessive resource consumption and unsafe parsing behavior.

**Gate:** Security tests exercise script injection, unsafe URLs, disallowed components, malformed documents, and attempted unexpected external network access.

### VI. Web–Android Parity, Accessibility and Bounded Performance

The PWA and Android distribution MUST share business logic, parsers and UI contracts instead of diverging into independently maintained product forks. User-facing changes MUST account for touch interaction, narrow screens, keyboard navigation, visible focus states, screen reader semantics, loading progress, cancellation and document-size guardrails. Processing SHOULD be bounded or moved away from the main UI thread when needed. Offline-cache behavior MUST be tested on a production build, not inferred from the Vite development server.

**Gate:** Representative mobile-viewport, PWA offline and Android build/sync checks; any platform-specific exception documented in the feature plan.

### VII. Testable Delivery, Evidence and Reproducible Builds

Each feature specification MUST define observable acceptance criteria and explicit out-of-scope items before implementation. The plan MUST reference existing modules, identify compatibility risk and state test strategy. All changes MUST preserve existing test suites; run unit tests, TypeScript checking, production build and Playwright smoke tests where applicable. Android-related changes MUST be validated by the Android CI workflow. An outcome is **PASS** only with recorded evidence for the relevant branch and exact commit SHA. Never infer green CI from earlier commits, a local mock, or a missing workflow result.

**Gate:** Pull requests report commands, exit status, known coverage gaps, CI check links and exact tested SHA; failing or missing required checks block approval.

### VIII. Spec-Driven, Incremental and Verify-First Evolution

Operate in the order **RECONCILE → SPECIFY → CLARIFY (when needed) → PLAN → TASKS → ANALYZE → IMPLEMENT → VERIFY → HANDOFF**. Before a change, inspect real repository state, existing branches, PRs, specs, and CI; reconcile inconsistencies rather than assuming prior chat context is authoritative. Prefer one reviewable, bounded feature over broad speculative rewrites. Preserve source assets, history, accepted contracts and parallel work. Do not force-push, merge, or declare completion without gates and explicit intent.

**Gate:** Every implementation PR links its `spec.md`, `plan.md`, `tasks.md`, relevant ADRs and verification evidence; unrelated changes are excluded.

## Architecture and Change Control

The baseline modules are `src/parsers.ts`, `src/legacy.ts`, `src/storage.ts`, `src/App.tsx`, `packages/intelligent-ui`, and the PWA/Capacitor configuration. These are observed architectural anchors, not guarantees of complete implementation. A planned change MUST specify whether it affects (1) parsing, (2) local persistence, (3) rendering, (4) inference boundary, (5) deployment/platform, or (6) security.

No new runtime backend, remote inference integration, remote document storage, or fidelity claim may be introduced through an ordinary feature task. Such changes require prior constitutional review and a documented architecture decision.

## Quality Gates and Definition of Done

A feature is done only when acceptance criteria are mapped to real tests or reproducible manual evidence; applicable `npm run test`, `npm run build`, `npm run test:e2e` and Android CI results are evaluated; privacy/security regression checks are evaluated; the spec/plan/tasks reflect the delivered scope; and the PR reports known limitations. An unrun test is **NOT VERIFIED**, never **PASS**.

## Governance

This constitution supersedes conflicting implementation shortcuts, instructions generated by agents, specs, plans and tasks. Existing application behavior and source history are preserved unless a bounded change is explicitly approved. Amendments MUST state motivation, migration impact, affected artifacts, required regression gates and an explicit version change; they MUST be reviewed through a dedicated PR. Semantic versioning applies to the constitution: MAJOR for breaking principle changes, MINOR for new normative obligations, PATCH for clarifications only.

All feature specs and implementation plans MUST include a **Constitution Check**. If a proposal conflicts with a MUST rule, execution stops at planning until the conflict is resolved by an approved amendment. Evidence precedence for operational status: real repository and CI state > reviewed handoff > past conversation. No agent may self-certify missing evidence.

**Reference:** GitHub Spec Kit, https://github.com/github/spec-kit — initial constitution on 2026-10-25.
