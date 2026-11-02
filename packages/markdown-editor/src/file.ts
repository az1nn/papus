import { MarkdownDocument, type PatchResult } from './core';

export interface WritableStreamLike {
  write(data: Uint8Array): Promise<void>;
  close(): Promise<void>;
  abort?(): Promise<void>;
}
export interface FileHandleLike {
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<WritableStreamLike>;
  isSameEntry?(other: FileHandleLike): Promise<boolean>;
}
type PickerWindow = Window & {
  showOpenFilePicker?: (options?: object) => Promise<FileHandleLike[]>;
  showSaveFilePicker?: (options?: object) => Promise<FileHandleLike>;
};
export type SaveStatus = 'saved' | 'download-requested';
export interface FileSession {
  document: MarkdownDocument;
  handle: FileHandleLike | null;
  lastConfirmedBytes: Uint8Array;
}
export function sessionFromBytes(name: string, bytes: Uint8Array, handle: FileHandleLike | null = null): FileSession {
  const document = new MarkdownDocument(name, bytes);
  return { document, handle, lastConfirmedBytes: bytes.slice() };
}
export async function fromLocalFile(file: File): Promise<FileSession> {
  return sessionFromBytes(file.name, new Uint8Array(await file.arrayBuffer()));
}

export async function openWithPicker(win: PickerWindow = window): Promise<FileSession | null> {
  if (!win.showOpenFilePicker) return null;
  const [handle] = await win.showOpenFilePicker({ types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown'] } }] });
  if (!handle) return null;
  const file = await handle.getFile();
  return sessionFromBytes(file.name, new Uint8Array(await file.arrayBuffer()), handle);
}
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, index) => byte === b[index]);
}
/** Reject external modifications, permission errors and partial writes. No false-success state. */
export async function saveDirect(session: FileSession): Promise<SaveStatus> {
  if (!session.handle) throw new Error('Gravação direta indisponível: utilize Salvar como ou Exportar.');
  const external = new Uint8Array(await (await session.handle.getFile()).arrayBuffer());
  if (!bytesEqual(external, session.lastConfirmedBytes)) throw new Error('Conflito: arquivo modificado fora do editor.');
  const output = session.document.toBytes();
  const stream = await session.handle.createWritable();
  try {
    await stream.write(output);
    await stream.close();
  } catch (error) {
    if (stream.abort) { try { await stream.abort(); } catch { /* preserve original failure */ } }
    throw error;
  }
  session.lastConfirmedBytes = output.slice();
  session.document.confirmSaved();
  return 'saved';
}
export async function saveAs(session: FileSession, win: PickerWindow = window): Promise<SaveStatus> {
  if (!win.showSaveFilePicker) return requestDownload(session);
  const handle = await win.showSaveFilePicker({ suggestedName: session.document.name, types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }] });
  if (session.handle && (session.handle === handle ||
      (handle.isSameEntry && await handle.isSameEntry(session.handle))))
    throw new Error('Salvar como não pode sobrescrever silenciosamente o arquivo original. Use Salvar.');
  // File picker confirmation is an explicit user's choice; never mutate the original handle until success.
  const output = session.document.toBytes();
  const stream = await handle.createWritable();
  try { await stream.write(output); await stream.close(); }
  catch (error) {
    if (stream.abort) { try { await stream.abort(); } catch { /* keep write error */ } }
    throw error;
  }
  session.handle = handle;
  session.lastConfirmedBytes = output.slice();
  session.document.rename(handle.name);
  session.document.confirmSaved();
  return 'saved';
}
export function requestDownload(session: FileSession): SaveStatus {
  const file = new Blob([new Uint8Array(session.document.toBytes())], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = session.document.name;
  document.body.append(link);
  link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  // Browser downloads do not prove persistence and MUST NOT clear the dirty flag.
  return 'download-requested';
}

export function replaceSource(session: FileSession, next: string): PatchResult {
  return session.document.replace(next);
}
