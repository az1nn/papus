import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { frameHtml, parsePreview, validatePreviewMessage, type TextPatch } from '@reader/markdown-editor';

interface Props { text: string; revision: number; onPatch: (patch: TextPatch) => void; onReject: (reason: string) => void }
/** Untrusted document has no access to parent DOM, storage or file handles. */
export default function PreviewFrame({ text, revision, onPatch, onReject }: Props) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const token = useRef(crypto.randomUUID().replace(/-/g, ''));
  const [error, setError] = useState('');
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
        warnings: [], error: reason instanceof Error ? reason.message : 'Erro ao analisar Markdown.' };
    }
  }, [text]);
  const doc = useMemo(() => frameHtml(rendered.html, token.current, revision), [rendered.html, revision]);

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
