# Papus — agent instructions

Read `.specify/memory/constitution.md` before modifying the repository. The v2.0.0 text in draft PR #2 is a **proposed amendment**, not a ratified master policy. Do not claim the proposal is live until human-approved integration.

## Workflow and precedence
1. Reconcile branch, PRs, owners, concurrent claims and CI against real GitHub state.
2. Use Spec Kit `spec.md`, `plan.md`, `tasks.md`, Constitution Check and relevant ADRs for bounded work.
3. Apply the domain contracts in `docs/architecture/domain-ownership.md`; request affected-owner review for cross-domain changes.
4. Preserve frontend-only core and offline baseline. Remote inference is allowed only with prior scoped consent and secure public-client authentication; never embed private secrets.
5. Keep parsing, semantic model, generation, validation and rendering separate; treat imported content as untrusted.
6. Select risk-proportionate CI from `docs/architecture/quality-gates.md`; report exact-head evidence, NOT VERIFIED gaps and handoff.
7. No force push, unapproved merge, or invented completion.

Spec Kit skills: `.github/skills/speckit-*/SKILL.md`. Helpers/templates: `.specify/`.

## SIGA
On `Siga`, read `.github/skills/siga/SKILL.md` and execute RECONCILE → CLASSIFY (RESUME | WATCH | ADVANCE) → EXECUTE → VERIFY → HANDOFF. VERIFY-FIRST. Evidence order: REAL STATE > HANDOFF > MEMORY > CHAT. Respect ownership, concurrent claims, existing PRs and human approvals. Keep durable handoffs in versioned repository artifacts.
