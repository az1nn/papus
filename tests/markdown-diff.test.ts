import { describe, expect, it } from 'vitest';
import { compareSaved } from '../packages/markdown-editor/src/diff';

describe('SPEC-MD-001 M5 explicit diff', () => {
  it('identifies additions/removals preserving original EOL', () => {
    const result = compareSaved('um\r\ndois\n', 'um\r\ntrês\n');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.additions).toBe(1);
    expect(result.removals).toBe(1);
    expect(result.lines.find(x => x.kind === 'same')?.text).toBe('um\r\n');
  });
  it('does not approximate pathological large files silently', () => {
    expect(compareSaved('a\n'.repeat(801), 'a\n'.repeat(801)).ok).toBe(false);
  });
  it('returns no changes for identical content', () => {
    const r = compareSaved('🦊\n', '🦊\n');
    expect(r.ok).toBe(true);
    if (r.ok) expect([r.additions, r.removals]).toEqual([0, 0]);
  });
});
