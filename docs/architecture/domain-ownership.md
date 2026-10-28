# Domain ownership and review contract (proposed)

Owner identifiers below are **roles**, not assigned GitHub users. Assign accountable maintainers explicitly before authorizing domain-sensitive implementation.

| Domain | Owner role | Contract | Review trigger |
|---|---|---|---|
| Parsing and provenance | PARSER_OWNER | Format input, semantic extraction, source anchors | Format parser or fidelity change |
| Storage and privacy | DATA_OWNER | Local persistence, migration, disclosure consent | Storage, egress or retention change |
| Intelligent UI | UI_OWNER | Typed OpenUI schema, validation and renderer | Components, actions or program contracts |
| Inference routing | INFERENCE_OWNER | Local/remote choice, secure auth, permission checks | Provider or remote data processing |
| Security | SECURITY_OWNER | Sanitization, allowlists, threat tests | Trust boundary or policy relaxation |
| Web/Android | PLATFORM_OWNER | PWA baseline, capability support matrix | Platform capability or shared runtime |
| CI and delivery | QUALITY_OWNER | Risk matrix, exact-head evidence | Gate/workflow change |
| Governance/SIGA | GOVERNANCE_OWNER | Spec Kit, claims, handoffs and authority | Cross-domain, ADR or constitution change |

## Operational rules
1. SIGA reconciles real branch, PR, claim and check state before accepting work.
2. A domain owner reviews changes to its contract; affected owners review cross-domain changes.
3. Unassigned owner, unresolved domain conflict or missing mandatory evidence blocks integration, not necessarily drafting.
4. Parallel tasks require disjoint ownership or explicit coordinated claims; no task stealing or force-push.
5. Human approval is mandatory for constitutional amendments and any merge requiring human gates. Owner role alone never grants merge authority.
6. The owner roster, decisions and approvals must be durable repository artifacts; never infer a person's approval from chat or CI.
