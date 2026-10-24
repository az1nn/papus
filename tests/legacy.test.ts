import { describe, expect, it } from 'vitest';
import { readPptRecords } from '../src/legacy';

describe('PowerPoint binário local', () => {
  it('decodifica um TextCharsAtom UTF-16LE', () => {
    const encoded = new TextEncoder().encode(''); // garante suporte ao encoder do ambiente
    expect(encoded).toHaveLength(0);
    const value = 'Slide teste';
    const record = new Uint8Array(8 + value.length * 2);
    const view = new DataView(record.buffer);
    view.setUint16(2, 0x0FA0, true);
    view.setUint32(4, value.length * 2, true);
    for (let i = 0; i < value.length; i++) view.setUint16(8 + i * 2, value.charCodeAt(i), true);
    expect(readPptRecords(record)).toContain('Slide teste');
  });
  it('não retorna conteúdo para bytes aleatórios', () => {
    expect(readPptRecords(new Uint8Array(10))).toBe('');
  });
});
