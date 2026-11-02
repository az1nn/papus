import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  frameHtml, parsePreview, validatePreviewMessage,
  type RenderResult, type TextPatch, type TextSpan
} from '@reader/markdown-editor';

interface Props {
  text: string;
  revision: number;
  onPatch: (patch: TextPatch) => void;
  onReject: (reason: string) => void;
}
interface PreviewResult extends RenderResult { error: string }
interface RenderDelta {
  start: number;
  end: number;
  expectedText: string;
  inserted: string;
  fromRevision: number;
  toRevision: number;
}
interface Prepared {
  text: string;
  revision: number;
  rendered: PreviewResult;
  documentHtml: string;
  fast: boolean;
  delta?: RenderDelta;
}
const TAGS_TO_DENY = ['script', 'iframe', 'object', 'embed', 'form', 'svg', 'style'];
const ATTRS_TO_DENY = ['src', 'srcset', 'onerror', 'onclick', 'onload', 'style'];
function fullPreview(text: string, revision: number, token: string): Prepared {
  try {
    const result = parsePreview(text);
    const html = DOMPurify.sanitize(result.html, {
      FORBID_TAGS: TAGS_TO_DENY, FORBID_ATTR: ATTRS_TO_DENY, ALLOW_DATA_ATTR: true
    });
    const rendered = { ...result, html, error: '' };
    return { text, revision, rendered, documentHtml: frameHtml(html, token, revision), fast: false };
  } catch (failure) {
    const rendered: PreviewResult = {
      html: '<p>Preview indisponível. O Source não foi alterado.</p>', spans: [],
      warnings: [], diagrams: [],
      error: failure instanceof Error ? failure.message : 'Erro ao analisar Markdown.'
    };
    return {
      text, revision, rendered,
      documentHtml: frameHtml(rendered.html, token, revision), fast: false
    };
  }
}
/** Only simple Unicode text replacements within one AST-approved plain span are accelerated.
 * Structural edits, code/math/diagrams, links, and unsupported selections always reparse.
 */
function safeIncremental(previous: Prepared, text: string, revision: number): Prepared | null {
  if (previous.revision + 1 !== revision || previous.text.length < 128 * 1024 ||
      previous.rendered.diagrams.length || previous.rendered.error || previous.rendered.warnings.length) return null;
  if (previous.text === text) return null;
  let start = 0;
  while (start < previous.text.length && start < text.length && previous.text[start] === text[start]) start++;
  let oldEnd = previous.text.length, newEnd = text.length;
  while (oldEnd > start && newEnd > start && previous.text[oldEnd - 1] === text[newEnd - 1]) {
    oldEnd--; newEnd--;
  }
  const inserted = text.slice(start, newEnd);
  if (inserted.length > 4096 || !/^[\p{L}\p{N}\p{M}\p{Zs}]*$/u.test(inserted)) return null;
  // Removing a structural delimiter or changing the whole paragraph must trigger a full parse.
  const matchIndex = previous.rendered.spans.findIndex(span =>
    span.start <= start && oldEnd <= span.end &&
    previous.text.slice(span.start, span.end) === span.text);
  if (matchIndex < 0) return null;
  const target = previous.rendered.spans[matchIndex];
  const patched = target.text.slice(0, start - target.start) + inserted +
    target.text.slice(oldEnd - target.start);
  if (!patched || /[\r\n#*_<>\[\]{}!~|\\]/.test(patched)) return null;
  const shift = inserted.length - (oldEnd - start);
  const spans: TextSpan[] = previous.rendered.spans.map((span, index) => {
    if (index === matchIndex) return { ...span, text: patched, end: span.end + shift };
    if (span.start >= oldEnd) return { ...span, start: span.start + shift, end: span.end + shift };
    return span;
  });
  return {
    text, revision, rendered: { ...previous.rendered, spans },
    documentHtml: previous.documentHtml, fast: true,
    delta: { start, end: oldEnd, expectedText: previous.text.slice(start, oldEnd),
      inserted, fromRevision: previous.revision, toRevision: revision }
  };
}

/** Opaque-origin iframe: the parent never exposes Source, storage, or file capabilities. */
export default function PreviewFrame({ text, revision, onPatch, onReject }: Props) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const token = useRef(crypto.randomUUID().replace(/-/g, ''));
  const accepted = useRef<Prepared | null>(null);
  const pending = useRef<Prepared | null>(null);
  const latest = useRef({ text, revision });
  latest.current = { text, revision };
  const [failedRevision, setFailedRevision] = useState<number | null>(null);
  const [richHtml, setRichHtml] = useState<{ revision: number; html: string } | null>(null);
  const [error, setError] = useState('');
  const callbacks = useRef({ onPatch, onReject });
  callbacks.current = { onPatch, onReject };

  const prepared = useMemo(() => {
    const old = accepted.current;
    const fast = old && failedRevision !== revision ? safeIncremental(old, text, revision) : null;
    return fast ?? fullPreview(text, revision, token.current);
  }, [text, revision, failedRevision]);

  useEffect(() => {
    if (!prepared.fast) {
      accepted.current = prepared;
      pending.current = null;
      return;
    }
    const frame = iframe.current;
    const delta = prepared.delta;
    if (!frame?.contentWindow || !delta ||
        frame.dataset.renderRevision !== String(delta.fromRevision)) {
      setFailedRevision(revision);
      return;
    }
    pending.current = prepared;
    frame.contentWindow.postMessage({ kind: 'papus.md.preview.render-delta.v1',
      token: token.current, ...delta }, '*');
    const timeout = window.setTimeout(() => {
      if (pending.current === prepared) {
        pending.current = null;
        setFailedRevision(revision);
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [prepared, revision]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!iframe.current || event.source !== iframe.current.contentWindow || event.origin !== 'null') return;
      const data = event.data;
      if (data?.kind === 'papus.md.preview.render-ack.v1') {
        const candidate = pending.current;
        if (!candidate || data.token !== token.current ||
            data.revision !== candidate.revision) return;
        pending.current = null;
        if (data.ok === true) {
          accepted.current = candidate;
          iframe.current.dataset.renderRevision = String(candidate.revision);
        } else {
          setFailedRevision(candidate.revision);
        }
        return;
      }
      if (data?.kind !== 'papus.md.preview.patch.v1' || pending.current) return;
      const current = accepted.current;
      if (!current || current.revision !== latest.current.revision) {
        callbacks.current.onReject('Preview desatualizado.');
        return;
      }
      const result = validatePreviewMessage(data, token.current,
        current.revision, current.rendered.spans, current.text);
      if (!result.ok) callbacks.current.onReject(result.reason);
      else callbacks.current.onPatch(result.patch);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);

  // Mermaid rendering stays a separately lazy, locally sanitized operation.
  useEffect(() => {
    if (prepared.fast || !prepared.rendered.diagrams.length) return;
    let live = true;
    async function draw() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict',
          htmlLabels: false, theme: 'neutral', maxTextSize: 20_000 });
        let html = prepared.rendered.html;
        for (const [index, diagram] of prepared.rendered.diagrams.entries()) {
          if (!live) return;
          const slot = new RegExp('<div class="md-mermaid-slot" data-diagram="' +
            index + '">[\\s\\S]*?<\\/div>');
          if (index >= 5) {
            html = html.replace(slot, '<pre>Limite de 5 diagramas por documento nesta visualização.</pre>');
            continue;
          }
          try {
            await mermaid.parse(diagram);
            const result = await mermaid.render('papus-md-' + token.current +
              '-' + prepared.revision + '-' + index, diagram);
            const svg = DOMPurify.sanitize(result.svg, {
              USE_PROFILES: { svg: true, svgFilters: true },
              FORBID_TAGS: ['script', 'foreignObject', 'a', 'image', 'style'],
              FORBID_ATTR: ['onerror', 'onload', 'onclick', 'href', 'xlink:href']
            });
            const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            html = html.replace(slot, '<img class="md-mermaid-image" alt="Diagrama Mermaid" src="' + uri + '" />');
          } catch {
            html = html.replace(slot, '<pre>Diagrama Mermaid inválido ou bloqueado. Edite-o no Source.</pre>');
          }
        }
        if (live) setRichHtml({ revision: prepared.revision, html });
      } catch {
        if (live) setError('Renderização Mermaid local indisponível; Source preservado.');
      }
    }
    void draw();
    return () => { live = false; };
  }, [prepared]);

  const frameDoc = prepared.fast ? prepared.documentHtml :
    richHtml?.revision === prepared.revision
      ? frameHtml(richHtml.html, token.current, prepared.revision)
      : prepared.documentHtml;

  return <>
    <iframe ref={iframe} title="Pré-visualização Markdown isolada" className="md-preview-frame"
      sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={frameDoc}
      onLoad={() => {
        if (iframe.current) iframe.current.dataset.renderRevision = String(prepared.revision);
      }} />
    {(error || prepared.rendered.error || prepared.rendered.warnings.length > 0) &&
      <div className="md-warnings" role="status">
        {[error, prepared.rendered.error, ...prepared.rendered.warnings].filter(Boolean).join(' · ')}
      </div>}
  </>;
}
