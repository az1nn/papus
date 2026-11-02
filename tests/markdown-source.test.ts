import { describe, expect, it } from 'vitest';
import { MarkdownDocument, decodeMarkdown, encodeMarkdown } from '../packages/markdown-editor/src/core';
import { applySourceInput, normalizedView } from '../packages/markdown-editor/src/source';
import { saveAs, sessionFromBytes, type FileHandleLike } from '../packages/markdown-editor/src/file';

describe('SPEC-MD-001 canonical Source adapter', () => {
  it('preserves untouched mixed LF/CRLF and BOM across textarea normalization', () => {
    const source = '\uFEFFa\r\nb\nc\r\n🦊';
    const bytes = new TextEncoder().encode(source);
    const doc = new MarkdownDocument('file.md', bytes);
    expect(normalizedView(doc.text)).toBe('a\nb\nc\n🦊');
    const result = applySourceInput(doc, 'a\nB\nc\n🦊');
    expect(result.ok).toBe(true);
    expect(doc.text).toBe('a\r\nB\nc\r\n🦊');
    expect(doc.bom).toBe(true);
    expect(new TextDecoder('utf-8', { ignoreBOM: true }).decode(doc.toBytes())).toBe('\uFEFFa\r\nB\nc\r\n🦊');
  });
  it('does not silently replace legal embedded BOM or unpaired UTF-16', () => {
    const bytes = encodeMarkdown('a\uFEFFb', false);
    expect(decodeMarkdown(bytes).text).toBe('a\uFEFFb');
    const doc = MarkdownDocument.empty();
    const rejected = doc.replace(String.fromCharCode(0xD800));
    expect(rejected.ok).toBe(false);
    expect(doc.text).toBe('');
  });
  it('inserts newlines using adjacent canonical terminator style', () => {
    const doc = new MarkdownDocument('x.md', new TextEncoder().encode('a\r\nb\r\n'));
    expect(applySourceInput(doc, 'a\nnew\nb\n').ok).toBe(true);
    expect(doc.text).toBe('a\r\nnew\r\nb\r\n');
  });
  it('prevents Save As from silently writing the currently opened file', async () => {
    const bytes = new TextEncoder().encode('x');
    const old: FileHandleLike = {
      name: 'old.md', getFile: async () => new File([bytes], 'old.md'),
      createWritable: async () => { throw new Error('unexpected write'); },
      isSameEntry: async () => true
    };
    const alternate: FileHandleLike = {
      ...old, name: 'copy.md', isSameEntry: async () => true
    };
    const session = sessionFromBytes('old.md', bytes, old);
    session.document.replace('changed');
    await expect(saveAs(session, { showSaveFilePicker: async () => alternate } as unknown as Window))
      .rejects.toThrow('não pode sobrescrever');
    expect(session.document.dirty).toBe(true);
  });
});
