import { describe, expect, it } from 'vitest';
import { findMatches, SUPPORTED_EXTENSIONS } from '../src/utils';

describe('formato e pesquisa', () => {
  it('suporta formatos pedidos', () => {
    for (const ext of ['html', 'pdf', 'doc', 'docx', 'ppt', 'pptx']) expect(SUPPORTED_EXTENSIONS).toContain(ext);
  });
  it('busca é case-insensitive', () => {
    const matches = findMatches('Log A. log B. LOG C.', 'log');
    expect(matches).toHaveLength(3);
  });
  it('limita ocorrências para proteger UI', () => {
    expect(findMatches('a '.repeat(1000), 'a')).toHaveLength(50);
  });
});
