# Papus — agent instructions

Read `.specify/memory/constitution.md` before modifying the repository. Constitution v2.0.0 was **ratified on 2026-10-28** after explicit maintainer approval and merged into `master` via [PR #2](https://github.com/az1nn/papus/pull/2). It is the active governance policy. Ratification does **not** imply that proposed runtime features are implemented or that unaccepted ADRs are automatically accepted.

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
