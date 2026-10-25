# Papus — agent instructions

Read `.specify/memory/constitution.md` before modifying this repository. The constitution is binding for specs, plans and implementation.

## Operating workflow
1. Reconcile actual GitHub state (branch, PR, tests, CI); never assume past chat claims prove success.
2. For new work, write `specs/<feature>/spec.md`, `plan.md` and `tasks.md` via the installed Spec Kit skills.
3. Run Constitution Check at planning and again at verification.
4. Keep the runtime frontend-only and local-first; do not add a dedicated backend or embed private credentials.
5. Treat OpenUI rendering and model inference as distinct capabilities.
6. Preserve existing code and tests; record exact-head evidence and give an explicit handoff.

The GitHub Copilot skills are in `.github/skills/speckit-*/SKILL.md`. Execute them in the Copilot agent chat, not as shell commands. Bash helpers and templates reside in `.specify/`.
