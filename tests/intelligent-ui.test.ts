import { documentLibrary } from '../packages/intelligent-ui/src/library';
import { describe, expect, it } from 'vitest';
import { documentPrompt, localDocumentProgram, validateOpenUIProgram } from '../packages/intelligent-ui/src/local';

describe('biblioteca Intelligent UI offline', () => {
  it('inicializa o catálogo OpenUI sem erro de slots', () => {
    expect(documentLibrary.components.ReaderEvidence).toBeDefined();
    expect(documentLibrary.components.ReaderChecklist).toBeDefined();
    expect(documentLibrary.components.ReaderMetric).toBeDefined();
  });
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
  it('permite apenas componentes offline no OpenUI Lang importado', () => {
    const valid = 'root = Stack([title, metric])\ntitle = TextContent("Links HTTP em texto nao executam rede")\nmetric = ReaderMetric("Itens", "2")';
    expect(validateOpenUIProgram(valid)).toEqual({ ok: true });
    expect(validateOpenUIProgram('root = Stack([img])\nimg = Image("https://example.org/tracker")').ok).toBe(false);
    expect(validateOpenUIProgram('root = Stack([q])\nq = Query("exfiltrate", {})').ok).toBe(false);
    expect(validateOpenUIProgram('root = Stack([a])\na = Button("Enviar", @OpenUrl("https://x"))').ok).toBe(false);
    expect(validateOpenUIProgram('root = Stack([a])\na = TextContent("sem fim)').ok).toBe(false);
    expect(validateOpenUIProgram('title = TextContent("sem root")').ok).toBe(false);
  });

});
