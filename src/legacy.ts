import * as CFB from 'cfb';

type BinaryFile = { name: string; content?: Uint8Array | null };

/** Lê trechos textuais de arquivos OLE2 Word 97–2003 / PowerPoint 97–2003 localmente.
 *  Não preserva layout, tabelas ou imagens; nem todos os arquivos legados são recuperáveis.
 */
function readStream(cfb: ReturnType<typeof CFB.read>, name: string): Uint8Array | undefined {
  const direct = CFB.find(cfb, name) as BinaryFile | null;
  if (direct?.content) return new Uint8Array(direct.content);
  const match = (cfb.FileIndex as BinaryFile[]).find((entry) => entry.name === name);
  return match?.content ? new Uint8Array(match.content) : undefined;
}
const decoder = new TextDecoder('windows-1252');
function normalize(value: string) {
  return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim();
}
function cp1252(bytes: Uint8Array) { return normalize(decoder.decode(bytes)); }

// PowerPoint binary record tree: recVerAndInstance(2), recType(2), recLen(4).
export function readPptRecords(data: Uint8Array) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const parts: string[] = [];
  let inspected = 0;
  function visit(start: number, end: number, level: number) {
    if (level > 30) return;
    let pos = start;
    while (pos + 8 <= end && inspected++ < 250000) {
      const recVer = view.getUint16(pos, true) & 15;
      const type = view.getUint16(pos + 2, true);
      const size = view.getUint32(pos + 4, true);
      const from = pos + 8;
      const to = from + size;
      if (to > end || to < from) break;
      if (type === 0x0FA0 && size % 2 === 0) { // TextCharsAtom UTF-16LE
        const value = normalize(new TextDecoder('utf-16le').decode(data.subarray(from, to)));
        if (value.length > 1) parts.push(value);
      } else if (type === 0x0FA8) { // TextBytesAtom ANSI
        const value = cp1252(data.subarray(from, to));
        if (value.length > 1) parts.push(value);
      } else if (recVer === 15) visit(from, to, level + 1);
      pos = to;
    }
  }
  visit(0, data.length, 0);
  return parts.join('\n');
}

// Word 97+ piece table (PLCFPCD), stored in 0Table/1Table behind CLX.
function readWordPieces(word: Uint8Array, table: Uint8Array): string {
  const w = new DataView(word.buffer, word.byteOffset, word.byteLength);
  const t = new DataView(table.buffer, table.byteOffset, table.byteLength);
  if (word.length < 512 || table.length < 4) return '';
  // FIB fcClx/lcbClx: fibRgFcLcb at end of csw/fibRgW and cslw/fibRgLw
  let pos = 0x20;
  if (pos + 2 > word.length) return '';
  const csw = w.getUint16(pos, true); pos += 2 + csw * 2;
  if (pos + 2 > word.length) return '';
  const cslw = w.getUint16(pos, true); pos += 2 + cslw * 4;
  if (pos + 2 > word.length) return '';
  const count = w.getUint16(pos, true); pos += 2;
  if (count <= 33 || pos + 34 * 8 > word.length) return '';
  const fc = w.getUint32(pos + 33 * 8, true);
  const len = w.getUint32(pos + 33 * 8 + 4, true);
  if (!len || len > 12 * 1024 * 1024 || fc + len > table.length) return '';
  const stop = fc + len;
  let offset = fc;
  while (offset + 5 <= stop) {
    const marker = table[offset++];
    if (marker === 0x01) { if (offset + 2 > stop) break; const skip = t.getUint16(offset, true); offset += 2 + skip; continue; }
    if (marker !== 0x02) break;
    const size = t.getUint32(offset, true); offset += 4;
    if (size < 16 || offset + size > stop || (size - 4) % 12) break;
    const n = (size - 4) / 12;
    if (n > 200000) break;
    const pcdAt = offset + 4 * (n + 1);
    const fragments: string[] = [];
    for (let i = 0; i < n; i++) {
      const start = t.getUint32(offset + i * 4, true);
      const end = t.getUint32(offset + (i + 1) * 4, true);
      const chars = end - start;
      if (chars <= 0 || chars > 1000000) continue;
      const encoded = t.getUint32(pcdAt + i * 8 + 2, true);
      const compressed = Boolean(encoded & 0x40000000);
      const fileOffset = (encoded & 0x3FFFFFFF) / (compressed ? 2 : 1);
      const byteSize = chars * (compressed ? 1 : 2);
      if (!Number.isInteger(fileOffset) || fileOffset + byteSize > word.length) continue;
      const buf = word.subarray(fileOffset, fileOffset + byteSize);
      const value = compressed ? cp1252(buf) : normalize(new TextDecoder('utf-16le').decode(buf));
      if (value) fragments.push(value);
    }
    return fragments.join('\n');
  }
  return '';
}

/** Fallback limitado para documentos binários quando o piece table está ausente. */
function inspectTextFragments(bytes: Uint8Array): string {
  const candidates: string[] = [];
  const decoded16 = new TextDecoder('utf-16le').decode(bytes.subarray(0, Math.min(bytes.length, 4 * 1024 * 1024)));
  for (const match of decoded16.matchAll(/[\p{L}\p{N}][\p{L}\p{N} ,.;:!?()\-\/]{12,}/gu)) {
    if (candidates.length >= 500) break;
    const value = normalize(match[0]); if (value.length >= 18) candidates.push(value);
  }
  return candidates.join('\n');
}

export async function extractLegacyText(file: File): Promise<{ text: string; warning: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const cfb = CFB.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' });
  if (ext === 'doc') {
    const word = readStream(cfb, 'WordDocument');
    if (!word) throw new Error('Este DOC não contém fluxo WordDocument legível.');
    const flags = word.length > 12 ? new DataView(word.buffer, word.byteOffset, word.byteLength).getUint16(10, true) : 0;
    const table = readStream(cfb, (flags & 0x0200) ? '1Table' : '0Table') || readStream(cfb, '1Table') || readStream(cfb, '0Table');
    const extracted = table ? readWordPieces(word, table) : '';
    const text = extracted || inspectTextFragments(word);
    if (!text) throw new Error('Não foi possível extrair texto deste DOC sem conversão externa.');
    return { text, warning: extracted ? 'DOC legado: texto recuperado localmente; layout e imagens não disponíveis.' : 'DOC legado: extração parcial e experimental. Confira com o original.' };
  }
  if (ext === 'ppt') {
    const binary = readStream(cfb, 'PowerPoint Document');
    if (!binary) throw new Error('Este PPT não contém fluxo de apresentação legível.');
    const text = readPptRecords(binary);
    if (!text) throw new Error('PPT legado sem texto extraível por este leitor local.');
    return { text, warning: 'PPT legado: texto recuperado localmente; slides e recursos visuais não preservados.' };
  }
  throw new Error('Formato legado inválido.');
}
