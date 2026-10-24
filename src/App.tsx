import { useEffect, useRef, useState } from 'react';
import { readLibrary, readFile, saveFile, removeStoredFile, type DocMeta } from './storage';
import { ArrowDownToLine, BookOpenText, Check, ChevronRight, CloudOff, Copy, FilePlus2, FileSearch, FileText, FolderOpen, HardDrive, LoaderCircle, MessageCircle, Search, Send, ShieldCheck, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { DocumentUI, documentLibrary, documentPrompt } from '@reader/intelligent-ui';
import { findMatches, loadDocument, SUPPORTED_EXTENSIONS, type ParsedDocument } from './parsers';
import { validateOpenUIProgram } from '@reader/intelligent-ui';

type Panel = 'library' | 'reader' | 'assistant';
const LIMIT = 25 * 1024 * 1024;
const INITIAL_QUESTIONS = ['Visão geral', 'Critérios de aceitação', 'Logs', 'Alertas'];
function extension(name: string) { return (name.split('.').pop() || '').toUpperCase(); }
function humanBytes(bytes: number) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }

const demoHTML = `<!DOCTYPE html><html><body><h1>Guia de observabilidade</h1><p>Observabilidade permite entender o comportamento de sistemas a partir de sinais externos e internos.</p><h2>Os três sinais principais</h2><ul><li><strong>Logs:</strong> eventos detalhados com contexto e severidade.</li><li><strong>Métricas:</strong> séries temporais quantitativas, como taxa de erros e latência.</li><li><strong>Traces:</strong> caminhos distribuídos de uma requisição por serviços.</li></ul><h2>Operação</h2><p>Comece com objetivos de nível de serviço, correlação por requestId e alertas acionáveis. Evite alertar por cada erro isolado.</p><h2>Critérios de aceitação</h2><ol><li>Filtrar logs por serviço, ambiente e severidade.</li><li>Correlacionar logs e traces pelo ID de requisição.</li><li>Executar revisão de incidentes com evidências e linha do tempo.</li></ol></body></html>`;

export default function App() {
  const picker = useRef<HTMLInputElement>(null);
  const dropCounter = useRef(0);
  const requested = useRef(0);
  const [library, setLibrary] = useState<DocMeta[]>([]);
  const [current, setCurrent] = useState<ParsedDocument | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [uiQuery, setUiQuery] = useState('');
  const [customProgram, setCustomProgram] = useState('');
  const [programDraft, setProgramDraft] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState<Panel>('reader');
  const [dragging, setDragging] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [loadingLibrary, setLoadingLibrary] = useState(true);

  useEffect(() => {
    let live = true;
    readLibrary().then((data) => { if (live) setLibrary(data); }).catch(() => { if (live) setError('Biblioteca local indisponível neste navegador.'); }).finally(() => { if (live) setLoadingLibrary(false); });
    const up = () => setOnline(true); const down = () => setOnline(false);
    window.addEventListener('online', up); window.addEventListener('offline', down);
    return () => { live = false; window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  async function openMeta(meta: DocMeta, fileOverride?: File) {
    const token = ++requested.current;
    setActiveId(meta.id); setPanel('reader'); setBusy(true); setError(''); setCurrent(null); setCustomProgram(''); setUiQuery(''); setSearch('');
    try {
      const file = fileOverride ?? await readFile(meta.id);
      if (!file) throw new Error('Arquivo não encontrado no armazenamento local.');
      const parsed = await loadDocument(file, meta.id);
      if (token === requested.current) setCurrent(parsed);
    } catch (e) { if (token === requested.current) setError(e instanceof Error ? e.message : 'Falha ao abrir documento.'); }
    finally { if (token === requested.current) setBusy(false); }
  }

  async function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    for (const file of incoming) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !SUPPORTED_EXTENSIONS.includes(ext)) { setError(`Formato não suportado: ${file.name}`); continue; }
      if (file.size > LIMIT) { setError(`${file.name} ultrapassa 25 MB.`); continue; }
      const meta: DocMeta = { id: crypto.randomUUID(), name: file.name, bytes: file.size, kind: ext, added: Date.now() };
      try {
        const updated = await saveFile(meta, file);
        setLibrary(updated);
        await openMeta(meta, file);
      } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar documento.'); }
    }
    if (picker.current) picker.current.value = '';
  }

  async function removeFile(id: string) {
    try {
      const updated = await removeStoredFile(id);
      setLibrary(updated);
      if (activeId === id) { requested.current += 1; setCurrent(null); setActiveId(null); setCustomProgram(''); setError(''); setBusy(false); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao excluir documento local.'); }
  }

  async function downloadFile() {
    if (!activeId) return;
    const file = await readFile(activeId);
    if (!file) { setError('Original não disponível.'); return; }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function analyzeLocally(q: string) {
    if (!current) return;
    setUiQuery(q === 'Visão geral' ? '' : q);
    setCustomProgram('');
    setPanel('assistant');
    setError('');
  }

  async function copyPrompt() {
    if (!current) return;
    const prompt = documentPrompt(
      { name: current.name, text: current.text, pages: current.pages, slides: current.slides?.length },
      question,
      documentLibrary.prompt({ preamble: 'Use apenas os componentes especificados.' })
    );
    try { await navigator.clipboard.writeText(prompt); }
    catch { setError('Não foi possível copiar automaticamente. Utilize um navegador com HTTPS.'); }
  }

  function applyProgram() {
    if (!current) return;
    const validation = validateOpenUIProgram(programDraft);
    if (!validation.ok) { setError(validation.reason); return; }
    setCustomProgram(programDraft.trim());
    setShowEditor(false);
    setPanel('assistant');
    setError('');
  }

  const matches = current ? findMatches(current.text, search) : [];
  const showReader = <main className="reader">
    {current ? <>
      <div className="reader-heading">
        <div className="reader-title"><div className="doc-emblem">{extension(current.name).slice(0, 4)}</div><div><h2 title={current.name}>{current.name}</h2><div className="reader-subtitle"><span>{current.pages ? `${current.pages} páginas` : current.slides ? `${current.slides.length} slides` : 'Documento'}</span><span className="dot">·</span><span>{current.text.length.toLocaleString('pt-BR')} caracteres extraídos</span></div></div></div>
        <button className="icon-button" title="Baixar original" onClick={() => void downloadFile()}><ArrowDownToLine size={19}/></button>
      </div>
      <div className="reader-search"><Search size={17}/><input aria-label="Pesquisar no documento" placeholder="Buscar no conteúdo..." value={search} onChange={(e) => setSearch(e.target.value)}/>{search && <button aria-label="Limpar busca" onClick={() => setSearch('')}><X size={16}/></button>}</div>
      {search.trim() && <div className="search-result-panel"><strong>{matches.length}{matches.length === 50 ? '+' : ''} ocorrência(s)</strong><div className="search-excerpts">{matches.map((m) => <div key={m.offset}>{m.excerpt}</div>)}{!matches.length && <span>Nenhuma ocorrência encontrada no texto extraído.</span>}</div></div>}
      {!!current.warnings.length && <div className="notice">{current.warnings.join(' ')}</div>}
      <div className="document-surface" key={current.id}>
        {current.kind === 'pdf' && current.pdfBytes && <PdfViewer bytes={current.pdfBytes} filename={current.name}/>}
        {(current.kind === 'html' || current.kind === 'docx') && <iframe className="document-frame" sandbox="" title={`Visualização de ${current.name}`} srcDoc={`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:"><style>body{font:16px/1.72 system-ui,sans-serif;padding:24px 32px;max-width:840px;margin:auto;color:#202a3a}h1,h2,h3{line-height:1.25}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:9px}blockquote{border-left:3px solid #ddd;margin-left:0;padding-left:18px}a{color:#18746b}</style></head><body>${current.html}</body></html>`}/>}
        {current.kind === 'legacy' && <article className="legacy-reader"><h3>Texto recuperado do arquivo legado</h3><pre>{current.text}</pre></article>}
        {current.kind === 'pptx' && <div className="slides">{current.slides?.map((slide) => <article key={slide.index} className="slide"><div className="slide-badge">SLIDE {slide.index}</div><p>{slide.text || 'Sem texto extraível neste slide.'}</p></article>)}</div>}
      </div>
    </> : <div className="empty-reader">
      <div className="empty-art"><FileText size={48} strokeWidth={1.25}/><div className="small-spark"><Sparkles size={22}/></div></div>
      <h2>Seus documentos, mais inteligentes.</h2>
      <p>Abra um arquivo para começar a leitura, pesquisar conteúdos e explorar os dados com OpenUI local.</p>
      <button className="primary" onClick={() => picker.current?.click()}><FilePlus2 size={18}/> Importar documento</button>
      <button className="secondary text-button" onClick={() => void addFiles([new File([demoHTML], 'Guia de Observabilidade.html', { type: 'text/html' })])}>Explorar documento de exemplo <ChevronRight size={17}/></button>
      <div className="formats">PDF <span/> DOC <span/> DOCX <span/> PPT <span/> PPTX <span/> HTML</div>
    </div>}
  </main>;

  return <div className="app" onDragEnter={(e) => { e.preventDefault(); dropCounter.current++; setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { e.preventDefault(); dropCounter.current = Math.max(0, dropCounter.current - 1); if (!dropCounter.current) setDragging(false); }} onDrop={(e) => { e.preventDefault(); dropCounter.current = 0; setDragging(false); void addFiles(e.dataTransfer.files); }}>
    {dragging && <div className="drop-overlay"><UploadCloud size={52}/><h2>Solte para importar</h2><p>Arquivos de até 25 MB</p></div>}
    <input className="hidden-input" ref={picker} type="file" multiple accept=".html,.htm,.pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => e.currentTarget.files && void addFiles(e.currentTarget.files)}/>
    <header className="topbar">
      <div className="brand"><div className="brand-logo"><BookOpenText size={22}/></div><div><strong>Universal<span>Reader</span></strong><small>AI DOCUMENT WORKSPACE</small></div></div>
      <div className="topbar-right"><span className="version">LOCAL · v0.2</span><div className="connection">{online ? <><span className="online-indicator"/> Online</> : <><CloudOff size={14}/> Offline</>}</div><button className="primary import-button" onClick={() => picker.current?.click()}><FilePlus2 size={17}/> <span>Adicionar arquivo</span></button></div>
    </header>
    <div className="mobile-nav"><button className={panel === 'library' ? 'selected' : ''} onClick={() => setPanel('library')}><FolderOpen size={17}/> Biblioteca</button><button className={panel === 'reader' ? 'selected' : ''} onClick={() => setPanel('reader')}><BookOpenText size={17}/> Leitor</button><button className={panel === 'assistant' ? 'selected' : ''} onClick={() => setPanel('assistant')}><Sparkles size={17}/> Assistente</button></div>
    <div className="workspace">
      <aside className={`sidebar ${panel === 'library' ? 'mobile-show' : ''}`}>
        <div className="sidebar-title"><span>Biblioteca</span><span className="count">{library.length}</span></div>
        <div className="sidebar-body">{loadingLibrary ? <p className="muted">Carregando biblioteca…</p> : library.length ? library.map((m) => <div key={m.id} className={`file-row ${activeId === m.id ? 'active' : ''}`}><button className="file-select" onClick={() => void openMeta(m)}><span className={`file-icon type-${m.kind}`}>{extension(m.name).slice(0, 4)}</span><span className="file-info"><strong title={m.name}>{m.name}</strong><small>{humanBytes(m.bytes)} · {new Date(m.added).toLocaleDateString('pt-BR')}</small></span></button><button className="delete-button" onClick={() => void removeFile(m.id)} title={`Excluir ${m.name}`}><Trash2 size={15}/></button></div>) : <div className="sidebar-empty"><FolderOpen size={30}/><p>Nenhum documento importado ainda.</p></div>}</div>
        <div className="sidebar-footer"><div className="footer-icon"><HardDrive size={18}/></div><div><strong>Armazenamento local</strong><small>Arquivos mantidos neste dispositivo</small></div></div>
      </aside>
      <div className={panel === 'reader' ? 'mobile-show reader-wrapper' : 'reader-wrapper'}>{showReader}</div>
      <aside className={`assistant ${panel === 'assistant' ? 'mobile-show' : ''}`}>
        <div className="assistant-head"><div className="assistant-icon"><Sparkles size={19}/></div><div><h3>Intelligent UI</h3><small>OpenUI open source · execução local</small></div></div>
        <div className="assistant-scroll">
          {!current && <div className="assistant-intro"><div className="ai-orb"><Sparkles size={30}/></div><h3>Biblioteca interna OpenUI</h3><p>Importe um documento para gerar uma interface interativa local, sem servidor.</p></div>}
          {current && <>
            <div className="demo-label"><ShieldCheck size={15}/> Dados analisados neste dispositivo · sem IA remota</div>
            <div className="openui-renderer" key={current.id}>
              <DocumentUI document={{ name: current.name, text: current.text, pages: current.pages, slides: current.slides?.length }} query={uiQuery} program={customProgram} onError={(m) => setError(`OpenUI Lang: ${m}`)}/>
            </div>
            <div className="quick-questions"><h4>CONSULTAS LOCAIS</h4>{INITIAL_QUESTIONS.map((q) => <button key={q} onClick={() => { setQuestion(q); analyzeLocally(q); }}><span>{q}</span><ChevronRight size={17}/></button>)}</div>
          </>}
        </div>
        <div className="assistant-bottom">
          <div className="local-ui-actions">
            <button className="secondary" disabled={!current} onClick={() => void copyPrompt()}><Copy size={15}/> Copiar prompt para GPT-6</button>
            <button className="secondary" disabled={!current} onClick={() => setShowEditor((old) => !old)}><FileText size={15}/> {showEditor ? 'Fechar editor' : 'Importar OpenUI Lang'}</button>
          </div>
          {showEditor && <div className="lang-editor"><label htmlFor="lang-input">Cole aqui o código OpenUI Lang produzido por um modelo ou ferramenta externa.</label><textarea id="lang-input" rows={7} value={programDraft} onChange={(e) => setProgramDraft(e.target.value)} placeholder={'root = Stack([title])\ntitle = TextContent("Olá", "large-heavy")'} /><button className="primary" onClick={applyProgram} disabled={!programDraft.trim()}>Renderizar interface</button><button className="secondary" onClick={() => { setCustomProgram(''); setProgramDraft(''); }}>Restaurar visualização local</button></div>}
          <form className="ask-box" onSubmit={(e) => { e.preventDefault(); analyzeLocally(question); }}><textarea rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={current ? 'Filtrar trechos do documento (busca literal)…' : 'Abra um arquivo para consultar…'} disabled={!current} aria-label="Busca local no documento"/><button type="submit" disabled={!current} title="Buscar trechos"><Send size={19}/></button></form>
          <div className="assist-footer"><ShieldCheck size={13}/> Sem backend · sem upload · sem credenciais embutidas</div>
        </div>
      </aside>
    </div>
    {busy && <div className="loading-toast"><LoaderCircle className="spin" size={18}/> Processando documento…</div>}
    {error && <div className="error-toast" role="alert"><span>{error}</span><button aria-label="Fechar erro" onClick={() => setError('')}><X size={17}/></button></div>}
    <footer className="app-footer"><span><Check size={14}/> Leitura local disponível sem conexão</span><span><FileSearch size={14}/> Pesquisa no texto extraído</span><span><MessageCircle size={14}/> OpenUI no dispositivo</span><span className="footer-menu"><Menu size={14}/> PWA + Android</span></footer>
  </div>;
}
