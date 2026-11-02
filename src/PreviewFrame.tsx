import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { frameHtml, parsePreview, validatePreviewMessage, type TextPatch } from '@reader/markdown-editor';

interface Props { text: string; revision: number; onPatch: (patch: TextPatch) => void; onReject: (reason: string) => void }
/** Untrusted document has no access to parent DOM, storage or file handles. */
export default function PreviewFrame({ text, revision, onPatch, onReject }: Props) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const token = useRef(crypto.randomUUID().replace(/-/g, ''));
  const [error, setError] = useState('');
  const [richHtml, setRichHtml] = useState<{ revision: number; html: string } | null>(null);
  const rendered = useMemo(() => {
    try {
      const result = parsePreview(text);
      const clean = DOMPurify.sanitize(result.html, {
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'svg', 'style'],
        FORBID_ATTR: ['src', 'srcset', 'onerror', 'onclick', 'onload', 'style'],
        ALLOW_DATA_ATTR: true
      });
      return { ...result, html: clean, error: '' };
    } catch (reason) {
      return { html: '<p>Preview indisponível. O Source não foi alterado.</p>', spans: [],
        warnings: [], diagrams: [], error: reason instanceof Error ? reason.message : 'Erro ao analisar Markdown.' };
    }
  }, [text]);
  useEffect(() => {
    let live = true;
    setRichHtml({ revision, html: rendered.html });
    if (rendered.diagrams.length === 0) return () => { live = false; };
    async function renderDiagrams() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', htmlLabels: false,
          theme: 'neutral', maxTextSize: 20_000 });
        let html = rendered.html;
        for (const [index, diagram] of rendered.diagrams.entries()) {
          if (!live) return;
          const slot = new RegExp('<div class="md-mermaid-slot" data-diagram="' + index + '">[\\s\\S]*?<\\/div>');
          if (index >= 5) {
            html = html.replace(slot, '<pre>Limite de 5 diagramas por documento nesta visualização.</pre>');
            continue;
          }
          try {
            await mermaid.parse(diagram);
            const result = await mermaid.render('papus-md-' + token.current + '-' + revision + '-' + index, diagram);
            const svg = DOMPurify.sanitize(result.svg, {
              USE_PROFILES: { svg: true, svgFilters: true },
              FORBID_TAGS: ['script', 'foreignObject', 'a', 'image', 'style'],
              FORBID_ATTR: ['onerror', 'onload', 'onclick', 'href', 'xlink:href']
            });
            const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            html = html.replace(slot, '<img class="md-mermaid-image" alt="Diagrama Mermaid" src="' + url + '" />');
          } catch {
            html = html.replace(slot, '<pre>Diagrama Mermaid inválido ou bloqueado. Edite-o no Source.</pre>');
          }
        }
        if (live) setRichHtml({ revision, html });
      } catch {
        if (live) setError('Renderização Mermaid local indisponível; Source preservado.');
      }
    }
    void renderDiagrams();
    return () => { live = false; };
  }, [revision, rendered.html, rendered.diagrams]);

  const activeHtml = richHtml?.revision === revision ? richHtml.html : rendered.html;
  const doc = useMemo(() => frameHtml(activeHtml, token.current, revision), [activeHtml, revision]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (!iframe.current || event.source !== iframe.current.contentWindow || event.origin !== 'null') return;
      const result = validatePreviewMessage(event.data, token.current, revision, rendered.spans, text);
      if (!result.ok) { onReject(result.reason); return; }
      onPatch(result.patch);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [revision, rendered.spans, text, onPatch, onReject]);

  useEffect(() => { setError(rendered.error); }, [rendered.error]);
  return <>
    <iframe ref={iframe} title="Pré-visualização Markdown isolada" className="md-preview-frame"
      sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={doc} />
    {(error || rendered.warnings.length > 0) && <div className="md-warnings" role="status">
      {[error, ...rendered.warnings].filter(Boolean).join(' · ')}
    </div>}
  </>;
}
