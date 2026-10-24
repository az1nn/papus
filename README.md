# Universal Reader — frontend-only (v0.2)

Aplicação local-first em React/TypeScript, PWA e Android (Capacitor), com biblioteca interna de Intelligent UI baseada **diretamente no OpenUI open source** (MIT). **Sem API própria, servidor de aplicação, chaves embutidas ou upload de documentos.**

## Executar

```sh
npm install
npm run dev
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
npm run android:add
npm run android:sync
npm run android:open
```

O `npm run dev` inicia exclusivamente o servidor **de desenvolvimento Vite**; a distribuição PWA compilada são arquivos estáticos.

### Módulos

- `packages/intelligent-ui` — pacote local `@reader/intelligent-ui`, OpenUI Lang, runtime React, componentes documentais (`ReaderEvidence`, `ReaderChecklist`, `ReaderMetric`) e geração determinística offline.
- `src/parsers.ts` — PDF (PDF.js), HTML sanitizado (DOMPurify), DOCX (Mammoth), PPTX (JSZip).
- `src/legacy.ts` — extração textual limitada DOC/PPT OLE2, via `cfb`, sem serviço externo.
- `src/App.tsx` — biblioteca IndexedDB, busca, leitor e painel OpenUI.
- `src/storage.ts` — fila serial para mutações da biblioteca, com rollback básico e mensagens de erro.
- `vite.config.ts` — PWA com service worker, ícones e manifest.

### Intelligent UI

O renderer é o componente **real** `Renderer` de `@openuidev/react-lang`, alimentado com `documentLibrary`, uma extensão da biblioteca `openuiLibrary` de `@openuidev/react-ui`. A visualização local cria um programa OpenUI Lang a partir do texto extraído; **não é uma geração por GPT-6**. O usuário pode copiar um prompt com a especificação do catálogo, usar um modelo em outro ambiente e colar o OpenUI Lang de volta no aplicativo. Esse fluxo não faz chamadas remotas a partir do leitor. Programas OpenUI Lang importados usam lista restrita de componentes offline: ações, imagens remotas, Query, Mutation e bindings são rejeitados.

**Importante:** OpenUI não é o código interno do ChatGPT; é uma implementação independente, de código aberto, com licença MIT. Fontes:
- https://github.com/thesysdev/openui
- https://github.com/thesysdev/open-intelligent-ui
- https://www.openui.com/docs/openui-lang/renderer

### Fidelidade e limites por formato

| Formato | Exibição local | Limitação |
|---|---|---|
| HTML/HTM | Conteúdo sanitizado | Bloqueia scripts, estilos e recursos remotos |
| PDF | Canvas e busca textual | PDFs digitalizados precisam de OCR futuro |
| DOCX | HTML semântico | Layout original não preservado |
| PPTX | Texto por slide | Imagens, animações e layout não preservados |
| DOC | Texto OLE2 local | Algoritmo de piece table ou recuperação parcial; sem diagramação |
| PPT | Texto OLE2 local | Suporta átomos de texto; não reproduz slides |

DOC e PPT complexos (protegidos, incomuns, corrompidos) podem falhar. Não há conversão para PDF nem instalação de LibreOffice no navegador. Para reprodução fiel, seria necessário um motor Office em WASM, sujeito a tamanho e compatibilidade.

### Segurança e privacidade

- Nunca armazene uma `OPENAI_API_KEY` no bundle, Android, IndexedDB ou variáveis Vite.
- Não há endpoint `/api/*`, rota de conversão nem Express.
- O uso do modelo GPT-6 em tempo real **não está habilitado** nesta versão frontend-only. Exige um provedor que ofereça autenticação segura adequada a clientes públicos, ou integração remota apropriada. OpenUI é o renderer, não o modelo.
- HTML importado é sanitizado e renderizado num iframe com sandbox e CSP local.
- Dados e arquivos são guardados em IndexedDB, sujeito a quotas do dispositivo.
- OpenUI Lang fornecido externamente é validado por um catálogo tipado; seus componentes personalizados não avaliam JavaScript fornecido no documento.

### Critérios de aceitação

- CA01: zero backend próprio, zero endpoints `/api/*`.
- CA02: leitura offline PDF, HTML, DOCX e PPTX, com limites de renderização declarados.
- CA03: suporte experimental a extração DOC/PPT via OLE2 local; falha explícita para incompatíveis.
- CA04: renderer real OpenUI em biblioteca separada, tipada e extensível.
- CA05: interação local via checklists; busca literal não se apresenta como análise de LLM.
- CA06: importação manual de OpenUI Lang e prompt exportável para GPT-6.
- CA07: PWA + Android compartilham código frontend.
- CA08: documentos persistem em IndexedDB no dispositivo.
- CA09: não existem credenciais, uploads ou chamadas de IA embutidas.

## CI, artefatos e validação

Os workflows GitHub Actions foram adicionados em `.github/workflows/`:

- `frontend-gates.yml`: executa testes, TypeScript, build Vite, smoke no Chromium (importação, persistência, segurança OpenUI, PWA offline) e verificação da ausência de backend. Disponibiliza o artifact `universal-reader-pwa` com o build estático.
- `android-debug.yml`: ao publicar na `master` ou executar manualmente, gera o projeto Capacitor e compila APK de debug (artifact `universal-reader-android-debug`); não é um APK assinado para loja.
- Android usa app ID `com.az1nn.papus`. O projeto Android é gerado no CI e não está versionado no repositório.

### Evidências e gates

O CI anterior à adição dos testes Playwright confirmou **9 testes de unidade PASS**, TypeScript e build Vite PASS, e verificação frontend-only PASS. A aprovação final depende dos testes atuais (incluindo navegador offline) e do build Android concluídos com sucesso no Actions.

Para hospedar o PWA, use HTTPS no domínio raiz ou configure o `base` Vite e caminhos do manifest para subdiretórios. DOC/PPT legados têm fidelidade parcial; OCR e diagramação Office fiel continuam fora do escopo. Não há inferência GPT-6 embutida nem chave de API distribuída.

