# Spec Kit adoption — Papus

This repository includes a reviewed snapshot of the official [GitHub Spec Kit](https://github.com/github/spec-kit) templates, Bash helpers and GitHub Copilot skills in `.specify/` and `.github/skills/`, alongside the Papus constitution. The v2.0.0 amendment in draft PR #2 is **proposed**, not ratified; the constitution on `master` remains authoritative until explicit human approval and integration. These files were adopted for an existing application on 2026-10-25; the application source was not regenerated.

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

- No required proprietary application backend, hidden document-upload API, or embedded private LLM credentials. Remote inference is permitted only after specific revocable consent and secure public-client authentication.
- Local-first import/read/search with declared DOC/PPT and PDF OCR limitations.
- Typed OpenUI renderer; GPT-6 inference remains separately gated.
- Apply risk-based checks from `docs/architecture/quality-gates.md`: run applicable tests, builds, E2E and Android validation for affected surfaces; preserve existing mandatory CI and bind results to the exact SHA.
- Keep spec → plan → tasks → evidence and CI SHA linkage in PRs.

The copied scaffold is based on upstream project files (MIT license). Upgrades should be synchronized using the official CLI, with peer review and without claiming local CLI installation from the presence of files.
