import { describe, expect, it } from 'vitest';
import { MarkdownDocument } from '../packages/markdown-editor/src/core';
import { applySourceInput } from '../packages/markdown-editor/src/source';
import { saveDirect, saveAs, sessionFromBytes, type FileHandleLike } from '../packages/markdown-editor/src/file';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}
describe('SPEC-MD-001 async persistence and Unicode integrity', () => {
  it('retains dirty state when edits happen during a direct write', async () => {
    const initial = new TextEncoder().encode('original');
    const session = sessionFromBytes('doc.md', initial);
    session.document.replace('first edit');
    const gate = deferred<void>();
    let stored = initial.slice();
    session.handle = {
      name: 'doc.md',
      getFile: async () => new File([initial], 'doc.md'),
      createWritable: async () => ({
        write: async data => { stored = data.slice(); await gate.promise; },
        close: async () => {}
      })
    };
    const running = saveDirect(session);
    await Promise.resolve();
    // Concurrent writes must be refused, and later edits may not be marked saved.
    await expect(saveDirect(session)).rejects.toThrow('em andamento');
    session.document.replace('newer edit');
    gate.resolve();
    await expect(running).resolves.toBe('saved');
    expect(new TextDecoder().decode(stored)).toBe('first edit');
    expect(session.document.baseline).toBe('first edit');
    expect(session.document.dirty).toBe(true);
    expect(session.saving).toBe(false);
  });
  it('Save As captures content before waiting for the picker', async () => {
    const session = sessionFromBytes('doc.md', new TextEncoder().encode('original'));
    session.document.replace('saved snapshot');
    let saved = new Uint8Array();
    const gate = deferred<FileHandleLike>();
    const handle: FileHandleLike = {
      name: 'copy.md',
      getFile: async () => new File([], 'copy.md'),
      createWritable: async () => ({
        write: async data => { saved = data.slice(); },
        close: async () => {}
      })
    };
    const running = saveAs(session, { showSaveFilePicker: async () => gate.promise } as unknown as Window);
    session.document.replace('later edit');
    gate.resolve(handle);
    await expect(running).resolves.toBe('saved');
    expect(new TextDecoder().decode(saved)).toBe('saved snapshot');
    expect(session.document.baseline).toBe('saved snapshot');
    expect(session.document.dirty).toBe(true);
  });
  it('releases save lock after errors', async () => {
    const session = sessionFromBytes('x.md', new TextEncoder().encode('old'));
    session.document.replace('new');
    session.handle = {
      name: 'x.md', getFile: async () => new File([new TextEncoder().encode('old')], 'x.md'),
      createWritable: async () => { throw new Error('permission denied'); }
    };
    await expect(saveDirect(session)).rejects.toThrow('permission denied');
    expect(session.saving).toBe(false);
    expect(session.document.dirty).toBe(true);
  });
  it('edits emoji with the same high surrogate without corrupting UTF-16', () => {
    const doc = new MarkdownDocument('emoji.md', new TextEncoder().encode('a🦊b'));
    expect(applySourceInput(doc, 'a🦁b').ok).toBe(true);
    expect(doc.text).toBe('a🦁b');
    expect(doc.undo()).toBe(true);
    expect(doc.text).toBe('a🦊b');
  });
});
