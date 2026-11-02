import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import { validPatchRange, type TextPatch } from './core';

interface MdNode {
  type: string; value?: string; depth?: number; url?: string; lang?: string;
  ordered?: boolean; checked?: boolean | null; children?: MdNode[];
  position?: { start?: { offset?: number }; end?: { offset?: number } };
}
export interface TextSpan { start: number; end: number; text: string }
export interface RenderResult { html: string; spans: TextSpan[]; warnings: string[] }
const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkFrontmatter, ['yaml']);

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] as string);
}
function safeAnchor(href?: string): string | null {
  return href && /^#[A-Za-z0-9_-]+$/.test(href) ? href : null;
}
export function parsePreview(source: string): RenderResult {
  const spans: TextSpan[] = [];
  const warnings: string[] = [];
  const ast = parser.parse(source) as unknown as MdNode;
  function children(node: MdNode): string {
    return (node.children ?? []).map(child => render(child, node)).join('');
  }
  function render(node: MdNode, parent?: MdNode): string {
    const value = node.value ?? '';
    switch (node.type) {
      case 'root': return children(node);
      case 'text': {
        const start = node.position?.start?.offset;
        const end = node.position?.end?.offset;
        const allowed = parent && ['paragraph', 'heading', 'tableCell'].includes(parent.type) &&
          parent.children?.length === 1 && typeof start === 'number' && typeof end === 'number' &&
          validPatchRange(source, start, end) && source.slice(start, end) === value;
        if (allowed && value.length) {
          spans.push({ start: start as number, end: end as number, text: value });
          return '<span class="md-correctable" data-start="' + start + '" data-end="' + end +
            '" title="Clique para corrigir texto">' + escapeHtml(value) + '</span>';
        }
        return escapeHtml(value);
      }
      case 'paragraph': return '<p>' + children(node) + '</p>';
      case 'heading': {
        const level = Math.min(6, Math.max(1, node.depth ?? 1));
        return '<h' + level + '>' + children(node) + '</h' + level + '>';
      }
      case 'emphasis': return '<em>' + children(node) + '</em>';
      case 'strong': return '<strong>' + children(node) + '</strong>';
      case 'delete': return '<del>' + children(node) + '</del>';
      case 'inlineCode': return '<code>' + escapeHtml(value) + '</code>';
      case 'code': return '<pre><code data-language="' + escapeHtml(node.lang ?? '') + '">' + escapeHtml(value) + '</code></pre>';
      case 'blockquote': return '<blockquote>' + children(node) + '</blockquote>';
      case 'list': return node.ordered ? '<ol>' + children(node) + '</ol>' : '<ul>' + children(node) + '</ul>';
      case 'listItem': return '<li>' + (typeof node.checked === 'boolean' ?
        '<input type="checkbox" disabled ' + (node.checked ? 'checked' : '') + ' /> ' : '') + children(node) + '</li>';
      case 'link': {
        const href = safeAnchor(node.url);
        if (!href) {
          if (node.url) warnings.push('Link externo exibido sem navegação automática.');
          return '<span class="md-untrusted-link">' + children(node) + '</span>';
        }
        return '<a href="' + escapeHtml(href) + '">' + children(node) + '</a>';
      }
      case 'image':
        warnings.push('Imagem externa bloqueada para proteger dados locais.');
        return '<span class="md-blocked-image">[imagem: ' + escapeHtml(value) + ']</span>';
      case 'table': {
        const rows = node.children ?? [];
        const head = rows[0] ? '<thead>' + tableRow(rows[0], true) + '</thead>' : '';
        const body = rows.slice(1).map(row => tableRow(row, false)).join('');
        return '<table>' + head + '<tbody>' + body + '</tbody></table>';
      }
      case 'tableRow': return tableRow(node, false);
      case 'tableCell': return '<td>' + children(node) + '</td>';
      case 'thematicBreak': return '<hr />';
      case 'break': return '<br />';
      case 'yaml': return '<details><summary>YAML frontmatter (somente Source)</summary><pre>' + escapeHtml(value) + '</pre></details>';
      case 'math': return '<div class="md-math" data-math="block">' + escapeHtml(value) + '</div>';
      case 'inlineMath': return '<span class="md-math" data-math="inline">' + escapeHtml(value) + '</span>';
      case 'html':
        warnings.push('HTML incorporado foi neutralizado.');
        return '<pre class="md-escaped-html">' + escapeHtml(value) + '</pre>';
      case 'definition': return '';
      default:
        warnings.push('Nó Markdown não suportado: ' + node.type);
        return node.children ? children(node) : escapeHtml(value);
    }
  }
  function tableRow(node: MdNode, header: boolean): string {
    const tag = header ? 'th' : 'td';
    return '<tr>' + (node.children ?? []).map(cell => '<' + tag + '>' + children(cell) + '</' + tag + '>').join('') + '</tr>';
  }
  return { html: render(ast), spans, warnings: Array.from(new Set(warnings)) };
}

export interface PreviewPatchMessage {
  kind: 'papus.md.preview.patch.v1'; token: string; expectedRevision: number;
  start: number; end: number; expectedText: string; newText: string;
}
export function validatePreviewMessage(
  value: unknown, token: string, revision: number, spans: readonly TextSpan[], source: string
): { ok: true; patch: TextPatch } | { ok: false; reason: string } {
  if (!value || typeof value !== 'object') return { ok: false, reason: 'Mensagem inválida.' };
  const m = value as Partial<PreviewPatchMessage>;
  if (m.kind !== 'papus.md.preview.patch.v1' || m.token !== token)
    return { ok: false, reason: 'Canal de Preview inválido.' };
  if (m.expectedRevision !== revision) return { ok: false, reason: 'Preview desatualizado.' };
  if (!Number.isSafeInteger(m.start) || !Number.isSafeInteger(m.end) ||
      typeof m.start !== 'number' || typeof m.end !== 'number' || !validPatchRange(source, m.start, m.end))
    return { ok: false, reason: 'Intervalo não autorizado.' };
  const allowed = spans.some(span => span.start === m.start && span.end === m.end && span.text === m.expectedText);
  if (!allowed || source.slice(m.start, m.end) !== m.expectedText)
    return { ok: false, reason: 'Correção estrutural ou ambígua recusada.' };
  if (typeof m.newText !== 'string' || m.newText.length > 100_000 ||
      /[\r\n\0<>[\]{}*#_!\\~|]/.test(m.newText) ||
      m.newText.includes(String.fromCharCode(96)) || /^[-+>]/.test(m.newText))
    return { ok: false, reason: 'O Preview aceita apenas texto simples. Edite estruturas no Source.' };
  return { ok: true, patch: { start: m.start, end: m.end, expectedRevision: revision, expectedText: m.expectedText, text: m.newText } };
}

function previewBridge() {
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const span = event.target.closest('.md-correctable') as HTMLElement | null;
    if (!span) return;
    const original = span.textContent ?? '';
    const edit = document.createElement('textarea');
    edit.value = original; edit.rows = 2; edit.setAttribute('aria-label', 'Corrigir texto no Preview');
    const accept = document.createElement('button'); accept.textContent = 'Aplicar correção';
    const cancel = document.createElement('button'); cancel.textContent = 'Cancelar';
    const editor = document.createElement('div'); editor.className = 'md-inline-editor';
    editor.append(edit, accept, cancel); span.replaceWith(editor); edit.focus();
    cancel.addEventListener('click', () => editor.replaceWith(span));
    accept.addEventListener('click', () => {
      window.parent.postMessage({
        kind: 'papus.md.preview.patch.v1', token: document.documentElement.dataset.token,
        expectedRevision: Number(document.documentElement.dataset.revision),
        start: Number(span.dataset.start), end: Number(span.dataset.end),
        expectedText: original, newText: edit.value
      }, '*');
      accept.disabled = true; accept.textContent = 'Enviado';
    });
  });
}

/** iframe must use sandbox="allow-scripts", NEVER allow-same-origin. */
export function frameHtml(content: string, token: string, revision: number): string {
  const safeToken = token.replace(/[^A-Za-z0-9]/g, '');
  const script = '(' + previewBridge.toString() + ')()';
  return '<!doctype html><html data-token="' + safeToken + '" data-revision="' + revision + '"><head>' +
    '<meta charset="utf-8" /><meta http-equiv="Content-Security-Policy" content="' +
    "default-src 'none'; connect-src 'none'; img-src data:; font-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-" +
    safeToken + "'; form-action 'none'; base-uri 'none'; object-src 'none'" + '" />' +
    '<style>html{color:#203047;background:#fff;font:15px/1.65 system-ui,sans-serif}body{padding:22px;max-width:960px;margin:auto}h1,h2,h3{line-height:1.3}pre{white-space:pre-wrap;background:#f1f5f8;padding:12px;border-radius:8px}code{background:#eef3f7;padding:1px 3px}blockquote{border-left:3px solid #9db8c9;padding-left:13px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #d0d9e0;padding:7px}.md-correctable{cursor:text;border-bottom:1px dashed #4b8f88}.md-untrusted-link,.md-blocked-image{color:#6f7283}.md-inline-editor{display:grid;gap:6px}.md-inline-editor textarea{width:100%;min-height:55px}.md-inline-editor button{padding:6px;border:1px solid #678;background:#eef}.md-math{white-space:pre-wrap}</style>' +
    '</head><body>' + content + '<script nonce="' + safeToken + '">' + script + '</script></body></html>';
}
