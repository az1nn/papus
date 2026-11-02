import { MarkdownDocument, validPatchRange, type PatchResult } from './core';

/** HTML textarea normalizes CRLF/CR to LF. Keep that projection out of canonical storage. */
export function normalizedView(value: string): string {
  return value.replace(/\r\n?|\n/g, '\n');
}
function canonicalOffset(value: string, normalizedOffset: number): number {
  let seen = 0;
  for (let i = 0; i < value.length;) {
    if (seen === normalizedOffset) return i;
    if (value[i] === '\r' && value[i + 1] === '\n') i += 2;
    else i++;
    seen++;
  }
  if (seen === normalizedOffset) return value.length;
  throw new Error('Offset de texto do navegador inválido.');
}
function surroundingLineEnding(value: string, start: number): string {
  const before = value.slice(0, start);
  const lastLF = before.lastIndexOf('\n'), lastCR = before.lastIndexOf('\r');
  if (lastLF >= lastCR && lastLF >= 0) return lastLF > 0 && before[lastLF - 1] === '\r' ? '\r\n' : '\n';
  if (lastCR >= 0) return '\r';
  const crlf = (value.match(/\r\n/g) ?? []).length;
  const lf = (value.match(/(?<!\r)\n/g) ?? []).length;
  const cr = (value.match(/\r(?!\n)/g) ?? []).length;
  return crlf > lf && crlf >= cr ? '\r\n' : cr > lf ? '\r' : '\n';
}

/** Translate the smallest changed UTF-16 slice back into canonical offsets. */
export function applySourceInput(document: MarkdownDocument, nextVisible: string): PatchResult {
  const current = normalizedView(document.text);
  if (current === nextVisible) return { ok: true, revision: document.revision };
  let prefix = 0;
  while (prefix < current.length && prefix < nextVisible.length && current[prefix] === nextVisible[prefix]) prefix++;
  let oldEnd = current.length, nextEnd = nextVisible.length;
  while (oldEnd > prefix && nextEnd > prefix && current[oldEnd - 1] === nextVisible[nextEnd - 1]) {
    oldEnd--; nextEnd--;
  }
  // A common UTF-16 prefix may end halfway through a surrogate pair.
  // Expand to a complete code point instead of silently rejecting legitimate emoji edits.
  while (prefix > 0 && (!validPatchRange(current, prefix, prefix) ||
          !validPatchRange(nextVisible, prefix, prefix))) prefix--;
  // Likewise, a common suffix can begin at the low surrogate of a code point.
  while (oldEnd < current.length && nextEnd < nextVisible.length &&
      (!validPatchRange(current, oldEnd, oldEnd) ||
       !validPatchRange(nextVisible, nextEnd, nextEnd))) { oldEnd++; nextEnd++; }
  const start = canonicalOffset(document.text, prefix);
  const end = canonicalOffset(document.text, oldEnd);
  const lineEnding = surroundingLineEnding(document.text, start);
  const inserted = normalizedView(nextVisible.slice(prefix, nextEnd)).replace(/\n/g, lineEnding);
  return document.apply({
    start, end, text: inserted, expectedRevision: document.revision,
    expectedText: document.text.slice(start, end)
  });
}
