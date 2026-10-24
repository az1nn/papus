import { SUPPORTED_EXTENSIONS } from './utils';
import { extractLegacyText } from './legacy';
export { SUPPORTED_EXTENSIONS, findMatches } from './utils';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as pdfjs from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import JSZip from 'jszip';
import DOMPurify from 'dompurify';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type SupportedKind = 'pdf' | 'docx' | 'pptx' | 'html' | 'legacy';
export type ParsedDocument = {
  id: string;
  name: string;
  kind: SupportedKind;
  originalKind: string;
  text: string;
  html?: string;
  slides?: { index: number; text: string }[];
  pdfBytes?: Uint8Array;
  pages?: number;
  warnings: string[];
};

const getExtension = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';
const cleanText = (text: string) => text.replace(/\u0000/g, '').replace(/[\t ]+/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
const getDocText = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';

export function cleanHTML(source: string): string {
  const safe = DOMPurify.sanitize(source, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'form', 'img', 'video', 'audio', 'link', 'meta'],
    FORBID_ATTR: ['style', 'srcset']
  });
  const doc = new DOMParser().parseFromString(safe, 'text/html');
  doc.querySelectorAll('a').forEach((a) => {
    try { if (!/^https?:$/.test(new URL(a.href, location.href).protocol)) a.removeAttribute('href'); } catch { a.removeAttribute('href'); }
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('target', '_blank');
  });
  return doc.body.innerHTML;
}

export function extractSlides(xmlByName: { name: string; xml: string }[]): { index: number; text: string }[] {
  return xmlByName.map(({ name, xml }) => {
    const parsed = new DOMParser().parseFromString(xml, 'application/xml');
    if (parsed.querySelector('parsererror')) throw new Error(`XML inválido: ${name}`);
    const nodes = Array.from(parsed.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't'));
    const text = nodes.map((node) => node.textContent ?? '').join(' ');
    const index = Number(name.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
    return { index, text: cleanText(text) };
  }).sort((a, b) => a.index - b.index);
}


export async function loadDocument(file: File, id: string): Promise<ParsedDocument> {
  const originalKind = getExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.includes(originalKind)) throw new Error('Formato não suportado.');
  if (file.size > 25 * 1024 * 1024) throw new Error('Limite por arquivo: 25 MB nesta versão.');
  let kind: SupportedKind;
  const input: File | Blob = file;
  const warnings: string[] = [];

  if (originalKind === 'doc' || originalKind === 'ppt') {
    const result = await extractLegacyText(file);
    return { id, name: file.name, kind: 'legacy', originalKind, text: result.text, warnings: [result.warning] };
  }
  if (originalKind === 'htm') kind = 'html';
  else kind = originalKind as SupportedKind;

  if (kind === 'html') {
    const raw = await input.text();
    const html = cleanHTML(raw);
    return { id, name: file.name, kind, originalKind, html, text: cleanText(getDocText(html)), warnings: [...warnings, 'Visualização sanitizada: scripts, estilos e recursos incorporados são bloqueados.'] };
  }
  if (kind === 'docx') {
    const data = await mammoth.convertToHtml({ arrayBuffer: await input.arrayBuffer() });
    const html = cleanHTML(data.value);
    return { id, name: file.name, kind, originalKind, html, text: cleanText(getDocText(html)), warnings: [...warnings, 'Modo semântico: a diagramação do Word pode variar.', ...data.messages.slice(0, 3).map((m) => m.message)] };
  }
  if (kind === 'pptx') {
    const zip = await JSZip.loadAsync(await input.arrayBuffer());
    const slideNames = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
    if (slideNames.length > 500) throw new Error('A apresentação ultrapassa o limite de 500 slides.');
    const parts = await Promise.all(slideNames.map(async (name) => ({ name, xml: await zip.files[name].async('string') })));
    const slides = extractSlides(parts);
    return { id, name: file.name, kind, originalKind, text: slides.map((s) => `Slide ${s.index}\n${s.text}`).join('\n\n'), slides, warnings: [...warnings, 'Modo semântico: imagens, animações e posicionamento não são reproduzidos offline.'] };
  }
  const bytes = new Uint8Array(await input.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const segments: string[] = [];
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    segments.push(`Página ${index}\n${content.items.map((item) => 'str' in item ? item.str : '').join(' ')}`);
  }
  await pdf.destroy();
  return { id, name: file.name, kind: 'pdf', originalKind, pdfBytes: bytes, text: cleanText(segments.join('\n\n')), pages: segments.length, warnings };
}

