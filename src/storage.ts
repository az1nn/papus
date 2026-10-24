import { del, get, set } from 'idb-keyval';

export type DocMeta = { id: string; name: string; bytes: number; kind: string; added: number };
const INDEX_KEY = 'reader:library';
const fileKey = (id: string) => `reader:file:${id}`;

// One serial queue for index mutations; no async side effects inside React setState.
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const pending = queue.then(task, task);
  queue = pending.then(() => undefined, () => undefined);
  return pending;
}

export function readLibrary(): Promise<DocMeta[]> {
  return exclusive(async () => (await get<DocMeta[]>(INDEX_KEY)) ?? []);
}

export function readFile(id: string): Promise<File | undefined> {
  return get<File>(fileKey(id));
}

export function saveFile(meta: DocMeta, file: File): Promise<DocMeta[]> {
  return exclusive(async () => {
    const current = (await get<DocMeta[]>(INDEX_KEY)) ?? [];
    await set(fileKey(meta.id), file);
    const updated = [meta, ...current.filter((item) => item.id !== meta.id)];
    try {
      await set(INDEX_KEY, updated);
    } catch (error) {
      await del(fileKey(meta.id)).catch(() => undefined);
      throw error;
    }
    return updated;
  });
}

export function removeStoredFile(id: string): Promise<DocMeta[]> {
  return exclusive(async () => {
    const current = (await get<DocMeta[]>(INDEX_KEY)) ?? [];
    const updated = current.filter((item) => item.id !== id);
    if (updated.length === current.length) return current;
    await set(INDEX_KEY, updated);
    try {
      await del(fileKey(id));
    } catch (error) {
      await set(INDEX_KEY, current).catch(() => undefined);
      throw error;
    }
    return updated;
  });
}
