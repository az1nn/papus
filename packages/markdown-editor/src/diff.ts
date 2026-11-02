/** On-demand line diff; no mutation and no implicit file write. */
export type DiffLine = { kind: 'same' | 'added' | 'removed'; text: string };
export type DiffResult =
  | { ok: true; lines: DiffLine[]; additions: number; removals: number }
  | { ok: false; reason: string };

function lines(value: string): string[] {
  if (!value) return [];
  return value.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g)?.filter(Boolean) ?? [];
}
export function compareSaved(baseline: string, working: string, maxLines = 800): DiffResult {
  const a = lines(baseline), b = lines(working);
  if (a.length > maxLines || b.length > maxLines)
    return { ok: false, reason: 'Diff muito grande para comparação em memória. Reduza o trecho ou salve uma cópia.' };
  const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 :
        Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result: DiffLine[] = [];
  let i = 0, j = 0, additions = 0, removals = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      result.push({ kind: 'same', text: a[i++] }); j++;
    } else if (j < b.length && (i === a.length || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({ kind: 'added', text: b[j++] }); additions++;
    } else {
      result.push({ kind: 'removed', text: a[i++] }); removals++;
    }
  }
  return { ok: true, lines: result, additions, removals };
}
