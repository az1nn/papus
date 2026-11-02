import { useEffect, useRef, useState } from 'react';
import { applySourceInput, compareSaved, fromLocalFile, normalizedView, openWithPicker, requestDownload, saveAs, saveDirect, sessionFromBytes, type FileSession } from '@reader/markdown-editor';
import PreviewFrame from './PreviewFrame';
import './markdown.css';

function message(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') return 'Operação cancelada.';
  return error instanceof Error ? error.message : 'Operação não concluída.';
}
export default function MarkdownWorkbench() {
  const [session, setSession] = useState<FileSession>(() => sessionFromBytes('sem-titulo.md', new Uint8Array()));
  const [version, setVersion] = useState(0);
  const [previewState, setPreviewState] = useState(() => {
    const doc = session.document;
    return { document: doc, text: doc.text, revision: doc.revision };
  });
  const [notice, setNotice] = useState('Documento local. Nenhum salvamento automático.');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'source' | 'preview' | 'split'>('split');
  const [split, setSplit] = useState(50);
  const [compositionDraft, setCompositionDraft] = useState<string | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const composing = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const doc = session.document;
  // Parsing untrusted/large Markdown must not block each Source keystroke.
  // A stale Preview remains read-only for patch purposes: document.apply rejects its revision.
  useEffect(() => {
    const handle = window.setTimeout(() => setPreviewState({
      document: doc, text: doc.text, revision: doc.revision
    }), 180);
    return () => window.clearTimeout(handle);
  }, [doc, version]);
  const effectivePreview = previewState.document === doc
    ? previewState : { document: doc, text: '', revision: doc.revision };
  const previewPending = effectivePreview.revision !== doc.revision;
  const diff = diffOpen ? compareSaved(doc.baseline, doc.text) : null;
  const refresh = () => setVersion(n => n + 1);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (doc.dirty) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [doc, version]);

  async function openFile(file: File) {
    if (doc.dirty && !window.confirm('Há alterações não salvas. Descartar e abrir outro arquivo?')) return;
    setBusy(true);
    setCompositionDraft(null);
    try {
      const incoming = await fromLocalFile(file);
      setSession(incoming);
      setDiffOpen(false);
      setNotice('Arquivo importado em memória. Nenhuma gravação realizada.');
    } catch (error) { setNotice(message(error)); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  async function openDisk() {
    if (doc.dirty && !window.confirm('Descartar alterações locais?')) return;
    setBusy(true);
    try {
      const incoming = await openWithPicker();
      if (incoming) { setSession(incoming); setDiffOpen(false); setNotice('Arquivo local aberto sem gravar.'); }
      else input.current?.click();
    } catch (error) { setNotice(message(error)); }
    finally { setBusy(false); }
  }
  async function save(mode: 'save' | 'saveAs') {
    setBusy(true);
    try {
      const status = mode === 'saveAs' ? await saveAs(session) : session.handle ? await saveDirect(session) : requestDownload(session);
      setNotice(status === 'saved' ? (session.document.dirty ? 'Versão anterior salva. Alterações posteriores ainda não foram salvas.' : 'Salvo: gravação local confirmada.') : 'Download solicitado. Não é confirmação de arquivo salvo.');
      refresh();
    } catch (error) { setNotice('Não salvo: ' + message(error)); }
    finally { setBusy(false); }
  }
  function write(text: string) {
    const result = applySourceInput(doc, text);
    if (!result.ok) setNotice(result.reason);
    refresh();
  }
  function history(direction: 'undo' | 'redo') {
    if (direction === 'undo') doc.undo(); else doc.redo();
    refresh();
  }
  return <div className="md-shell">
    <header className="md-toolbar">
      <a href="/" className="md-brand">← Universal Reader</a>
      <strong>Markdown offline</strong>
      <span className="md-filename" title={doc.name}>{doc.name}{doc.dirty ? ' • não salvo' : ''}</span>
      <div className="md-actions">
        <input ref={input} type="file" accept=".md,.markdown,text/markdown" hidden onChange={event => { const file = event.currentTarget.files?.[0]; if (file) void openFile(file); }} />
        <button disabled={busy} onClick={() => {
          if (doc.dirty && !window.confirm('Descartar alterações locais?')) return;
          setSession(sessionFromBytes('sem-titulo.md', new Uint8Array()));
          setDiffOpen(false); setCompositionDraft(null);
          setNotice('Novo documento em memória. Nada foi salvo.');
        }}>Novo</button>
        <button disabled={busy} onClick={() => void openDisk()}>Abrir</button>
        <button disabled={busy} onClick={() => history('undo')} aria-label="Desfazer" title="Ctrl+Z">Desfazer</button>
        <button disabled={busy} onClick={() => history('redo')} aria-label="Refazer" title="Ctrl+Y">Refazer</button>
        <button disabled={busy} onClick={() => void save('save')}>Salvar</button>
        <button disabled={busy} onClick={() => void save('saveAs')}>Salvar como</button>
        <button disabled={busy} aria-pressed={diffOpen} onClick={() => setDiffOpen(x => !x)}>Diff opcional</button>
      </div>
    </header>
    <div className="md-status" role="status">{notice} · {doc.lineEndings.crlf} CRLF / {doc.lineEndings.lf} LF · revisão {doc.revision}</div>
    <div className="md-view-controls">
      <div className="md-mobile-tabs" role="group" aria-label="Modo de visualização">
        <button aria-pressed={view === 'source'} onClick={() => setView('source')}>Source</button>
        <button aria-pressed={view === 'preview'} onClick={() => setView('preview')}>Preview</button>
        <button aria-pressed={view === 'split'} onClick={() => setView('split')}>Dividido</button>
      </div>
      <label className="md-resize">Proporção Source
        <input type="range" min="25" max="75" step="5" value={split}
          aria-label="Proporção dos painéis" onChange={event => setSplit(Number(event.currentTarget.value))} />
        {split}%
      </label>
    </div>
    <main className={'md-workspace md-view-' + view} style={{ '--md-split': split + '%' } as React.CSSProperties}>
      <section className="md-source">
        <label htmlFor="markdown-source">Source — Markdown canônico</label>
        <textarea id="markdown-source" spellCheck={false} value={compositionDraft ?? normalizedView(doc.text)}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={e => { composing.current = false; setCompositionDraft(null); write(e.currentTarget.value); }}
          onChange={e => { if (composing.current) setCompositionDraft(e.currentTarget.value); else write(e.currentTarget.value); }}
          onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'z') { e.preventDefault(); history(e.shiftKey ? 'redo' : 'undo'); }
            if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'y') { e.preventDefault(); history('redo'); } }} />
      </section>
      <section className="md-preview-host" aria-label="Preview Markdown">
        <strong>Preview seguro {previewPending ? '· atualizando…' : ''}</strong>
        <PreviewFrame text={effectivePreview.text} revision={effectivePreview.revision}
          onReject={reason => setNotice(reason)}
          onPatch={patch => { const result = doc.apply(patch); if (!result.ok) setNotice(result.reason); else setNotice('Correção textual aplicada ao Source, ainda não salva.'); refresh(); }} />
      </section>
    </main>
    {diffOpen && <section className="md-diff" aria-label="Diff do último salvamento confirmado">
      <strong>Diff contra a última gravação confirmada</strong>
      {diff?.ok ? <>
        <p>{diff.additions} linha(s) adicionada(s), {diff.removals} removida(s). Somente visualização.</p>
        <pre>{diff.lines.map((line, i) => <span key={i} className={'md-diff-' + line.kind}>
          {line.kind === 'added' ? '+ ' : line.kind === 'removed' ? '- ' : '  '}{line.text}
        </span>)}</pre>
      </> : <p>{diff?.reason}</p>}
    </section>}
    <footer className="md-foot">PWA Web · Sem backend, autosave, Git ou envio remoto · UTF-8 {doc.bom ? 'com BOM' : 'sem BOM'}</footer>
  </div>;
}
