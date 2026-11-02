import { describe, expect, it } from 'vitest';
import { frameHtml, parsePreview, validatePreviewMessage } from '../packages/markdown-editor/src/preview';

describe('SPEC-MD-001 M2 sandboxed Preview', () => {
  it('maps unambiguous text nodes with UTF-16 offsets', () => {
    const src = '# Cabeçalho\n\nOlá mundo 🦊\n\n**negrito** e texto';
    const render = parsePreview(src);
    expect(render.spans.some(s => s.text === 'Cabeçalho' && src.slice(s.start, s.end) === s.text)).toBe(true);
    expect(render.spans.some(s => s.text === 'Olá mundo 🦊')).toBe(true);
    expect(render.spans.some(s => s.text.includes('negrito'))).toBe(false);
  });
  it('rejects forged, stale, cross-node and structural patches', () => {
    const src = '# título\n\nParágrafo simples\n\n**negrito**';
    const spans = parsePreview(src).spans;
    const span = spans.find(s => s.text === 'Parágrafo simples')!;
    const msg = { kind: 'papus.md.preview.patch.v1', token: 'randomtoken', expectedRevision: 2,
      start: span.start, end: span.end, expectedText: span.text, newText: 'Texto corrigido' };
    expect(validatePreviewMessage(msg, 'randomtoken', 2, spans, src).ok).toBe(true);
    expect(validatePreviewMessage({ ...msg, token: 'forged' }, 'randomtoken', 2, spans, src).ok).toBe(false);
    expect(validatePreviewMessage({ ...msg, expectedRevision: 1 }, 'randomtoken', 2, spans, src).ok).toBe(false);
    expect(validatePreviewMessage({ ...msg, end: span.end + 1 }, 'randomtoken', 2, spans, src).ok).toBe(false);
    expect(validatePreviewMessage({ ...msg, newText: '<img src=x onerror=alert(1)>' }, 'randomtoken', 2, spans, src).ok).toBe(false);
    expect(validatePreviewMessage({ ...msg, newText: '# hacked' }, 'randomtoken', 2, spans, src).ok).toBe(false);
  });
  it('neutralizes raw HTML and blocks external image / URL requests', () => {
    const result = parsePreview('<script>alert(1)</script>\n\n![x](https://attacker.invalid/x.png)\n\n[link](https://attacker.invalid)');
    expect(result.html).not.toContain('<script>');
    expect(result.html).not.toContain('<img');
    expect(result.html).not.toContain('href="https');
    expect(result.warnings.length).toBeGreaterThan(0);
    const html = frameHtml(result.html, 'testtoken', 0);
    expect(html).toContain("default-src 'none'");
    expect(html).toContain("connect-src 'none'");
    expect(html).not.toContain('allow-same-origin');
  });
});
