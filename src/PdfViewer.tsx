import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PdfViewer({ bytes, filename }: { bytes: Uint8Array; filename: string }) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  useEffect(() => { setPage(1); setZoom(1); }, [bytes]);
  useEffect(() => {
    let disposed = false;
    let task: ReturnType<pdfjs.PDFPageProxy['render']> | undefined;
    let pdf: pdfjs.PDFDocumentProxy | undefined;
    (async () => {
      try {
        pdf = await pdfjs.getDocument({ data: bytes.slice() }).promise;
        if (disposed) { await pdf.destroy(); return; }
        setCount(pdf.numPages);
        const current = await pdf.getPage(Math.min(page, pdf.numPages));
        if (disposed || !canvas.current) return;
        const viewport = current.getViewport({ scale: zoom * Math.min(1.5, 850 / current.getViewport({ scale: 1 }).width) });
        const context = canvas.current.getContext('2d');
        if (!context) return;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.current.width = viewport.width * pixelRatio;
        canvas.current.height = viewport.height * pixelRatio;
        canvas.current.style.width = `${viewport.width}px`;
        canvas.current.style.height = `${viewport.height}px`;
        task = current.render({ canvas: canvas.current, canvasContext: context, viewport, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] });
        await task.promise;
      } catch (e) {
        if (!disposed && !(e instanceof Error && e.name === 'RenderingCancelledException')) setError('Não foi possível desenhar esta página.');
      }
    })();
    return () => { disposed = true; if (task) task.cancel(); if (pdf) void pdf.destroy(); };
  }, [bytes, page, zoom]);
  return <div className="pdf-viewer">
    <div className="pdf-toolbar">
      <span title={filename} className="muted ellipsis">Visualizador PDF</span>
      <div className="inline-actions">
        <button aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={17}/></button>
        <span className="page-counter">{page} / {count || '…'}</span>
        <button aria-label="Próxima página" disabled={page >= count} onClick={() => setPage((p) => p + 1)}><ChevronRight size={17}/></button>
        <span className="divider-vertical"/>
        <button aria-label="Reduzir zoom" disabled={zoom <= .55} onClick={() => setZoom((v) => Math.max(.5, v - .2))}><ZoomOut size={17}/></button>
        <button aria-label="Aumentar zoom" disabled={zoom >= 2.4} onClick={() => setZoom((v) => Math.min(2.5, v + .2))}><ZoomIn size={17}/></button>
      </div>
    </div>
    {error && <p className="error">{error}</p>}
    <div className="pdf-canvas-wrap"><canvas ref={canvas} aria-label={`Página ${page} do PDF`} /></div>
  </div>;
}
