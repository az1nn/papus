# Spec Kit adoption — Papus

This repository includes a reviewed snapshot of the official [GitHub Spec Kit](https://github.com/github/spec-kit) templates, Bash helpers and GitHub Copilot skills in `.specify/` and `.github/skills/`, alongside the ratified Papus constitution. These files were adopted for an existing application on 2026-10-25; the application source was not regenerated.

## Local Specify CLI installation

Requirements: Python 3.11+, uv and Git. From your local checkout:

```bash
uv tool install specify-cli
specify version
specify check
```

The above installs the **local CLI**; vendored repository scaffolding alone does not install an executable on developer machines. In GitHub Copilot Chat, invoke `/speckit-constitution`, `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement`, `/speckit-converge`. The existing constitution is not to be regenerated without an explicit amendment.

To adopt a fresh upstream Spec Kit release in a separate, reviewable branch, use `specify init --here --force --non-interactive --integration copilot --ignore-agent-tools` and review the entire diff before committing. This command can replace managed paths. Do NOT run it blindly over an uncommitted working tree.

## Project gates

- No dedicated backend, `/api/*`, document uploads or embedded LLM tokens.
- Local-first import/read/search with declared DOC/PPT and PDF OCR limitations.
- Typed OpenUI renderer; GPT-6 inference remains separately gated.
- Run `npm run test`, `npm run build`, `npm run test:e2e` and applicable Android CI before claims of completion.
- Keep spec → plan → tasks → evidence and CI SHA linkage in PRs.

The copied scaffold is based on upstream project files (MIT license). Upgrades should be synchronized using the official CLI, with peer review and without claiming local CLI installation from the presence of files.
