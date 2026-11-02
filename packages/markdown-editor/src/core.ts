/** SPEC-MD-001: canonical UTF-8 Markdown. No filesystem writes occur in this module. */
export type LineEndings = { lf: number; crlf: number; cr: number };
export type TextPatch = { start: number; end: number; text: string; expectedRevision: number; expectedText?: string };
export type PatchResult = { ok: true; revision: number } | { ok: false; reason: string };
export type Snapshot = Readonly<{
  text: string; name: string; bom: boolean; originalBytes: Uint8Array;
  lineEndings: LineEndings; revision: number; baseline: string; dirty: boolean;
}>;

function countEndings(text: string): LineEndings {
  const crlf = (text.match(/\r\n/g) ?? []).length;
  return { crlf, lf: (text.match(/\n/g) ?? []).length - crlf, cr: (text.match(/\r(?!\n)/g) ?? []).length };
}

export function decodeMarkdown(bytes: Uint8Array): { text: string; bom: boolean } {
  const bom = bytes.length >= 3 && bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191;
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bom ? bytes.subarray(3) : bytes);
  if (text.includes('\uFEFF')) throw new Error('BOM inesperado no conteúdo do documento.');
  return { text, bom };
}

export function encodeMarkdown(text: string, bom: boolean): Uint8Array {
  const value = new TextEncoder().encode(text);
  if (!bom) return value;
  const output = new Uint8Array(value.length + 3);
  output.set([239, 187, 191]); output.set(value, 3);
  return output;
}

/** UTF-16 offsets must never split a surrogate pair or a CRLF terminator. */
function validBoundary(text: string, offset: number): boolean {
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > text.length) return false;
  if (offset === 0 || offset === text.length) return true;
  const previous = text.charCodeAt(offset - 1);
  const next = text.charCodeAt(offset);
  if (previous === 13 && next === 10) return false;
  if (previous >= 0xD800 && previous <= 0xDBFF && next >= 0xDC00 && next <= 0xDFFF) return false;
  return true;
}

export function validPatchRange(text: string, start: number, end: number): boolean {
  return start <= end && validBoundary(text, start) && validBoundary(text, end);
}

export class MarkdownDocument {
  private textValue: string;
  private savedText: string;
  private rev = 0;
  private history: string[];
  private cursor = 0;
  private readonly firstBytes: Uint8Array;
  readonly bom: boolean;
  name: string;

  constructor(name: string, bytes: Uint8Array) {
    const data = decodeMarkdown(bytes);
    this.textValue = data.text;
    this.savedText = data.text;
    this.history = [data.text];
    this.firstBytes = bytes.slice();
    this.name = name;
    this.bom = data.bom;
  }

  static empty(name = 'sem-titulo.md'): MarkdownDocument {
    return new MarkdownDocument(name, new Uint8Array());
  }

  get text(): string { return this.textValue; }
  get revision(): number { return this.rev; }
  get dirty(): boolean { return this.textValue !== this.savedText; }
  get baseline(): string { return this.savedText; }
  get lineEndings(): LineEndings { return countEndings(this.textValue); }
  get originalBytes(): Uint8Array { return this.firstBytes.slice(); }
  get canUndo(): boolean { return this.cursor > 0; }
  get canRedo(): boolean { return this.cursor < this.history.length - 1; }

  get snapshot(): Snapshot {
    return {
      text: this.textValue, name: this.name, bom: this.bom,
      originalBytes: this.firstBytes.slice(), lineEndings: this.lineEndings,
      revision: this.rev, baseline: this.savedText, dirty: this.dirty
    };
  }

  apply(patch: TextPatch): PatchResult {
    if (patch.expectedRevision !== this.rev) return { ok: false, reason: 'Revisão desatualizada.' };
    if (!validPatchRange(this.textValue, patch.start, patch.end)) return { ok: false, reason: 'Intervalo UTF-16 inválido.' };
    if (patch.expectedText !== undefined && this.textValue.slice(patch.start, patch.end) !== patch.expectedText)
      return { ok: false, reason: 'Texto original divergiu.' };
    const result = this.textValue.slice(0, patch.start) + patch.text + this.textValue.slice(patch.end);
    if (result === this.textValue) return { ok: true, revision: this.rev };
    this.history = this.history.slice(0, this.cursor + 1);
    this.history.push(result);
    if (this.history.length > 100) this.history.shift();
    this.cursor = this.history.length - 1;
    this.textValue = result;
    this.rev++;
    return { ok: true, revision: this.rev };
  }

  replace(text: string): PatchResult {
    return this.apply({ start: 0, end: this.textValue.length, text, expectedRevision: this.rev });
  }

  undo(): boolean {
    if (!this.canUndo) return false;
    this.textValue = this.history[--this.cursor];
    this.rev++;
    return true;
  }

  redo(): boolean {
    if (!this.canRedo) return false;
    this.textValue = this.history[++this.cursor];
    this.rev++;
    return true;
  }

  toBytes(): Uint8Array { return encodeMarkdown(this.textValue, this.bom); }

  /** Only call when a direct user-authorized file write has completed successfully. */
  confirmSaved(): void { this.savedText = this.textValue; }

  /** A confirmed Save As may update the displayed filename. */
  rename(name: string): void { this.name = name; }
}
