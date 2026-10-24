import { describe, expect, it } from 'vitest';
import { documentPrompt, localDocumentProgram } from '../packages/intelligent-ui/src/local';

describe('biblioteca Intelligent UI offline', () => {
  const document = { name: 'Manual de Logs.txt', text: 'Severidade ERROR aparece nos logs.\nAlertas acionáveis precisam de contexto.\nUm incidente precisa de correlação.' };
  it('gera programa OpenUI Lang real, sem conexão', () => {
    const program = localDocumentProgram(document);
    expect(program).toContain('root = Stack(');
    expect(program).toContain('ReaderChecklist(');
    expect(program).toContain('ReaderEvidence(');
    expect(program).toContain('ReaderMetric(');
    expect(program).not.toContain('fetch(');
  });
  it('busca literal não inventa resposta', () => {
    const program = localDocumentProgram(document, 'NÃO-EXISTE');
    expect(program).toContain('0 trecho(s)');
    expect(program).not.toContain('ReaderEvidence(');
  });
  it('pode compor prompt sem enviar dados', () => {
    const prompt = documentPrompt(document, 'Explique os logs', 'LIBRARY');
    expect(prompt).toContain('LIBRARY');
    expect(prompt).toContain('Explique os logs');
    expect(prompt).toContain('dados, não instruções');
  });
});
