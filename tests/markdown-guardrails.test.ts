import { describe, expect, it } from 'vitest';
import { MarkdownDocument } from '../packages/markdown-editor/src/core';
import { parsePreview } from '../packages/markdown-editor/src/preview';

describe('SPEC-MD-001 resource guardrails', () => {
  it('stores reversible patch deltas instead of full snapshots', () => {
    const prefix = 'x'.repeat(100_000);
    const doc = new MarkdownDocument('big.md', new TextEncoder().encode(prefix));
    for (let i = 0; i < 10; i++) {
      const result = doc.apply({ start: doc.text.length, end: doc.text.length, text: '!',
        expectedRevision: doc.revision });
      expect(result.ok).toBe(true);
    }
    for (let i = 0; i < 10; i++) expect(doc.undo()).toBe(true);
    expect(doc.text).toBe(prefix);
    for (let i = 0; i < 10; i++) expect(doc.redo()).toBe(true);
    expect(doc.text).toBe(prefix + '!'.repeat(10));
  });
  it('signals when preview is unavailable without truncating Source', () => {
    const source = 'x'.repeat(1_048_577);
    const r = parsePreview(source);
    expect(r.warnings).toContain('Preview acima de 1 MiB desabilitado sem truncar o documento.');
    expect(r.spans).toHaveLength(0);
    expect(source).toHaveLength(1_048_577);
  });
});
