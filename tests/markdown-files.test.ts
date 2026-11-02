import { describe, expect, it } from 'vitest';
import { saveAs, sessionFromBytes, type FileHandleLike } from '../packages/markdown-editor/src/file';

describe('SPEC-MD-001 M5 picker behavior', () => {
  it('Save As switches handle only after successful write and preserves original', async () => {
    const src = new TextEncoder().encode('original');
    const session = sessionFromBytes('orig.md', src);
    session.document.replace('updated');
    let saved = new Uint8Array();
    const handle: FileHandleLike = {
      name: 'copy.md',
      getFile: async () => new File([saved], 'copy.md'),
      createWritable: async () => ({
        write: async bytes => { saved = bytes.slice(); },
        close: async () => {}
      })
    };
    const mockWindow = { showSaveFilePicker: async () => handle };
    await expect(saveAs(session, mockWindow as unknown as Window)).resolves.toBe('saved');
    expect(session.document.name).toBe('copy.md');
    expect(session.document.dirty).toBe(false);
    expect(new TextDecoder().decode(src)).toBe('original');
    expect(new TextDecoder().decode(saved)).toBe('updated');
  });
  it('Save As failure keeps original handle/baseline and dirty state', async () => {
    const src = new TextEncoder().encode('original');
    const old: FileHandleLike = {
      name: 'orig.md', getFile: async () => new File([src], 'orig.md'),
      createWritable: async () => { throw new Error('should not be called'); }
    };
    const session = sessionFromBytes('orig.md', src, old);
    session.document.replace('changed');
    const failed: FileHandleLike = {
      name: 'copy.md', getFile: async () => new File([], 'copy.md'),
      createWritable: async () => ({
        write: async () => {}, close: async () => { throw new Error('disk full'); }
      })
    };
    const mockWindow = { showSaveFilePicker: async () => failed };
    await expect(saveAs(session, mockWindow as unknown as Window)).rejects.toThrow('disk full');
    expect(session.handle).toBe(old);
    expect(session.document.dirty).toBe(true);
    expect(session.document.name).toBe('orig.md');
  });
});
