export const SUPPORTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'html', 'htm'];

export function findMatches(source: string, term: string): { offset: number; excerpt: string }[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  const haystack = source.toLowerCase();
  const out: { offset: number; excerpt: string }[] = [];
  let offset = 0;
  while ((offset = haystack.indexOf(needle, offset)) !== -1 && out.length < 50) {
    out.push({ offset, excerpt: source.slice(Math.max(0, offset - 75), Math.min(source.length, offset + needle.length + 115)).replace(/\s+/g, ' ') });
    offset += needle.length || 1;
  }
  return out;
}
