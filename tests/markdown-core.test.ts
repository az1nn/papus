import { describe, expect, it } from 'vitest';
import { MarkdownDocument, decodeMarkdown, encodeMarkdown, validPatchRange } from '../packages/markdown-editor/src/core';
import { bytesEqual, saveDirect, sessionFromBytes, type FileHandleLike } from '../packages/markdown-editor/src/file';

describe('SPEC-MD-001 M1 canonical core', () => {
  it('round-trips BOM, mixed CRLF/LF and Unicode without normalization', () => {
    const original = encodeMarkdown('# Olá\r\nlinha\n🦊\r\n', true);
    const doc = new MarkdownDocument('exemplo.md', original);
    expect(doc.bom).toBe(true);
    expect(doc.lineEndings).toEqual({ crlf: 2, lf: 1, cr: 0 });
    expect(bytesEqual(doc.toBytes(), original)).toBe(true);
    expect(doc.replace('# Olá\r\nlinha\n🦊\r\nmais').ok).toBe(true);
    expect(new TextDecoder().decode(doc.toBytes())).toContain('mais');
  });
  it('rejects invalid UTF-8 rather than silently replacing bytes', () => {
    expect(() => decodeMarkdown(new Uint8Array([0xC3, 0x28]))).toThrow();
  });
  it('validates surrogate and CRLF boundaries and stale revisions', () => {
    const doc = new MarkdownDocument('x.md', new TextEncoder().encode('a🦊\r\nb'));
    expect(validPatchRange(doc.text, 2, 2)).toBe(false);
    expect(validPatchRange(doc.text, 4, 4)).toBe(false);
    expect(doc.apply({ start: 0, end: 1, text: 'A', expectedRevision: 0 }).ok).toBe(true);
    const stale = doc.apply({ start: 0, end: 1, text: 'B', expectedRevision: 0 });
    expect(stale.ok).toBe(false);
    expect(doc.text).toBe('A🦊\r\nb');
  });
  it('supports undo/redo without claiming persistence', () => {
    const doc = MarkdownDocument.empty();
    doc.replace('hello');
    expect(doc.dirty).toBe(true);
    expect(doc.undo()).toBe(true);
    expect(doc.dirty).toBe(false);
    expect(doc.redo()).toBe(true);
    expect(doc.dirty).toBe(true);
  });
  it('rejects external changes and denied writes without clearing dirty', async () => {
    const base = new TextEncoder().encode('original');
    const session = sessionFromBytes('x.md', base);
    session.document.replace('changed');
    let stored = new TextEncoder().encode('external');
    const handle: FileHandleLike = {
      name: 'x.md',
      getFile: async () => new File([new Uint8Array(stored)], 'x.md'),
      createWritable: async () => ({
        write: async () => { throw new Error('denied'); },
        close: async () => {}
      })
    };
    session.handle = handle;
    await expect(saveDirect(session)).rejects.toThrow(/Conflito/);
    expect(session.document.dirty).toBe(true);
    stored = base;
    await expect(saveDirect(session)).rejects.toThrow('denied');
    expect(session.document.dirty).toBe(true);
  });
  it('confirms saved only on successful complete write', async () => {
    const initial = new TextEncoder().encode('old');
    const session = sessionFromBytes('x.md', initial);
    session.document.replace('new');
    let stored = initial.slice();
    session.handle = {
      name: 'x.md',
      getFile: async () => new File([stored], 'x.md'),
      createWritable: async () => ({
        write: async data => { stored = data.slice(); },
        close: async () => {}
      })
    };
    await expect(saveDirect(session)).resolves.toBe('saved');
    expect(session.document.dirty).toBe(false);
    expect(new TextDecoder().decode(stored)).toBe('new');
  });
});
