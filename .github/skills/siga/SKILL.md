---
name: siga
version: "1"
description: Portable continuation protocol for reconstructing real persistent state before resuming, watching, or advancing work.
canonical_source: ".github/skills/siga/SKILL.md"
upstream_repo: "az1nn/az1nn"
upstream_blob_sha: "e0954ffc65883eb9399e45c54e2cd8fab253a81a"
storage_policy: "repository-only"
---

# SIGA HANDOFF v1

## Portable Continuation Protocol

> **Repository-only rule**
>
> This is the project-local installation of SIGA from `az1nn/az1nn/.github/skills/siga/SKILL.md`.
> Do not persist, mirror, reconstruct, or treat ChatGPT memory as the canonical location of this protocol or its operational state.
> Any durable SIGA state or handoff for Papus must live in versioned artifacts of `az1nn/papus`.
> Chat history and model memory may never override verifiable repository/system state.

## Objetivo

`SIGA` é uma palavra-chave de retomada operacional.

Quando o usuário disser apenas:

> Siga

o agente **NÃO** deve interpretar isso simplesmente como “faça a próxima coisa”.

Antes de executar qualquer trabalho, deve reconstruir o estado real e atual do app, projeto ou workstream e decidir automaticamente qual tipo de continuação é apropriado.

O protocolo deve funcionar em qualquer ambiente: GitHub, GitLab, aplicação SaaS, projeto local, automação, documento, design, infraestrutura, agente de IA ou outro sistema com estado persistente.

---

## PRINCÍPIO FUNDAMENTAL

```
REAL STATE > HANDOFF > MEMORY > CHAT
```

A hierarquia de confiança é:

```
Estado real verificável do sistema
→ artefatos persistidos / handoffs
→ memória disponível
→ histórico da conversa
```

O chat nunca deve ser considerado sozinho como fonte canônica de estado.

Toda execução de `SIGA` começa em modo:

```
VERIFY-FIRST
```

---

# SIGA — START PROTOCOL

Ao receber `SIGA`:

## 1. RECONCILE

Reconstrua o estado atual usando todas as fontes disponíveis.

Dependendo do ambiente, verifique:

- estado do projeto/app;
- branch / workspace / ambiente atual;
- HEAD ou versão atualmente implantada;
- tarefas abertas;
- PRs/MRs;
- agentes ou workers ativos;
- jobs assíncronos;
- CI/CD;
- testes;
- builds;
- deploys;
- comentários ou reviews pendentes;
- gates humanos;
- bloqueios;
- artefatos persistidos;
- specs;
- ADRs;
- issues;
- estado remoto versus local.

Não assuma que o último estado descrito no chat ainda é verdadeiro.

---

## 2. CLASSIFY

Depois da reconciliação, classifique automaticamente a situação em **exatamente um** dos três modos abaixo.

### MODE A — RESUME

Existe trabalho iniciado e interrompido que ainda precisa ser concluído.

Exemplos:

- PR aberto com implementação incompleta;
- task iniciada;
- bug ainda não resolvido;
- mudanças locais não finalizadas;
- spec com tarefas pendentes;
- ação interrompida entre implementação e validação.

**Ação**

Continue exatamente da última fronteira segura encontrada.

Não crie uma nova unidade de trabalho desnecessariamente.

---

### MODE B — WATCH

O trabalho principal já foi disparado, mas existe processamento ou validação ainda acontecendo.

Exemplos:

- CI rodando;
- agente trabalhando;
- deploy em andamento;
- review humano pendente;
- job assíncrono executando;
- pipeline esperando gate.

**Ação**

Não duplique o trabalho.

Inspecione o estado atual.

Consuma resultados que já tenham terminado.

Corrija falhas quando possível.

Se ainda houver execução realmente ativa e nenhuma ação imediata for necessária, mantenha o workstream atual como unidade canônica.

Nunca abra branch, PR, task ou sessão paralela apenas porque o processo ainda não terminou.

---

### MODE C — ADVANCE

O trabalho anterior terminou de maneira verificável e não há execução pendente que precise ser acompanhada.

**Ação**

Determine a próxima unidade lógica de trabalho a partir de:

- roadmap;
- spec;
- tasks;
- issues;
- handoff;
- dependências;
- prioridades explicitamente definidas.

Somente neste modo uma nova branch, PR, task, spec ou workstream deve ser iniciada.

---

## 3. EXECUTE

Depois de selecionar o modo:

```
implement → verify → classify → persist
```

Toda alteração deve ser validada antes de ser considerada concluída.

A profundidade da verificação depende do app, mas deve usar as melhores provas disponíveis.

Exemplos:

- testes;
- lint;
- typecheck;
- build;
- CI;
- Engineering Graph;
- preview;
- screenshots;
- API checks;
- queries;
- logs;
- deploy health;
- human validation;
- contract validation.

Compressão de contexto nunca pode significar compressão da verificação.

---

# INVARIANTS

Durante uma execução `SIGA`:

- Não mascarar FAIL.
- Não declarar sucesso sem evidência.
- Não duplicar trabalho já em execução.
- Não criar novo workstream sem reconciliar o existente.
- Não confiar cegamente no estado descrito pelo chat anterior.
- Não alterar comportamento apenas para fazer um gate ficar verde sem resolver a causa real.
- Não realizar merge/deploy destrutivo automaticamente quando existir gate humano explícito.
- Não apagar contexto necessário para reconstruir decisões.

Quando existir conflito:

```
estado canônico atual vence memória e chat
```

---

# HUMAN GATES

Se existir uma decisão explicitamente reservada ao usuário:

pare somente na fronteira dessa decisão.

O restante do trabalho verificável deve ser concluído normalmente.

Exemplos:

- Design Gate;
- aprovação visual;
- merge autorizado manualmente;
- decisão arquitetural;
- produção;
- custos;
- mudança destrutiva.

O agente deve apresentar exatamente:

- estado atual;
- evidências;
- decisão necessária;
- efeito de cada alternativa relevante.

---

# HANDOFF DURÁVEL

Ao atingir uma fronteira natural de sessão, gere um único handoff compacto.

Formato:

```text
CAVEMAN HANDOFF v1

APP:
WORKSTREAM:
STATE:
MODE:
CANONICAL SOURCE:

CURRENT VERSION / HEAD:
BASE:
BRANCH / ENV:
PR / MR / TASK:
SPEC / ADR:

DONE:
VERIFY:
GATES:
BLOCKERS:

INVARIANTS:
NEXT:

VERIFY-FIRST:
<instruções mínimas necessárias para reconstruir o estado real na próxima execução>
```

O handoff deve registrar estado e delta, não narrar toda a sessão.

Ele precisa permitir que outro agente, chat ou app continue o trabalho sem depender do histórico desta conversa.

### Persistência

Para Papus, qualquer handoff durável deve ser persistido em arquivo ou outro artefato versionado dentro de `az1nn/papus`, associado ao workstream correspondente.

Não use memória do ChatGPT como armazenamento do handoff.

---

# NEXT SESSION

Quando uma nova sessão receber:

> Siga

ela deve procurar primeiro pelo último handoff persistido disponível **no repositório/workstream relevante**.

Em seguida deve executar novamente `VERIFY-FIRST`.

O handoff é uma hipótese sobre o último estado conhecido.

O sistema real determina o estado atual.

---

# COMPORTAMENTO ESPERADO

## Exemplo 1

Usuário:

> Siga

Agente:

- reconciliou o estado real;
- encontrou PR existente;
- CI ainda está rodando;
- não abriu uma nova branch;
- classificou como `WATCH`;
- consumiu jobs concluídos;
- encontrou um gate vermelho;
- corrigiu a causa;
- executou novamente as validações;
- persistiu novo handoff.

## Exemplo 2

Usuário:

> Siga

Agente:

- reconciliou o estado;
- último PR está concluído;
- todos os gates estão verdes;
- não existem agentes/jobs ativos;
- roadmap possui próxima task pronta;
- classificou como `ADVANCE`;
- criou a próxima unidade de trabalho;
- implementou;
- validou;
- persistiu o novo estado.

---

# PORTABILIDADE

`SIGA` não depende de Git.

Git/PR/CI são apenas possíveis fontes de estado.

Em outros sistemas, substitua pelos equivalentes.

Exemplo:

- Canva: design → comentários → aprovação → export.
- Trello: board → card → checklist → blockers.
- Notion: spec → tasks → decisions → status.
- SaaS: workspace → jobs → state machine → logs.
- Infra: environment → deployment → health → incidents.
- Agentes: run → child agents → tool outputs → pending actions.

A semântica permanece:

```
RECONCILE → CLASSIFY → EXECUTE → VERIFY → HANDOFF
```

---

# REGRA FINAL

`SIGA` significa:

> “Descubra onde realmente estamos e continue corretamente dali.”

Nunca:

> “Apenas execute alguma próxima coisa.”
