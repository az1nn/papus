# ADR-001 — Universal Reader sem backend

**Status:** Aprovado (revisão arquitetural solicitada em 2026-10-24)

## Decisão

Construir React/Vite + Capacitor e extrair documentos no navegador, com persistência local e OpenUI Lang para Intelligent UI. A biblioteca interna `@reader/intelligent-ui` encapsula `@openuidev/react-lang`, `@openuidev/react-ui` e componentes documentais.

## Consequências

1. Publicação web estática; APK via Capacitor sem serviços próprios.
2. Sem conexão, o sistema realiza extração, busca literal e interfaces derivadas de metadados e fragmentos.
3. OpenUI é engine de UI, não modelo LLM; GPT-6 online só pode ser acionado por integração com autenticação apropriada. Não entregar chaves privadas em bundle cliente.
4. DOC/PPT legados aceitam leitura textual parcial via OLE2; conversão fiel exige outra tecnologia, como um Office engine em WASM, não incluído no MVP.
5. Interfaces OpenUI geradas externamente podem ser coladas para renderizar no app e compartilham os componentes permitidos pelo catálogo.

## Gates para distribuição

- `G01` npm install/build/test em ambiente com acesso ao registry.
- `G02` smoke E2E de importação e leitura em Chrome Android, desktop e APK.
- `G03` offline PWA após primeiro carregamento em HTTPS.
- `G04` corpus de arquivos reais (DOC, DOCX, PPT, PPTX, PDF e HTML, com e sem imagens), classificação de fidelidade e falhas.
- `G05` fuzzing e limites de arquivo, segurança de HTML e OpenUI Lang.
- `G06` auditoria de licenças open source, SBOM e CSP.
