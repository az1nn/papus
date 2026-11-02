import { describe, expect, it } from 'vitest';
import { parsePreview } from '../packages/markdown-editor/src/preview';

describe('SPEC-MD-001 M3 local technical Markdown', () => {
  it('renders GFM table/tasks and syntax highlighting', () => {
    const r = parsePreview('| a | b |\n|---|---|\n| x | y |\n\n- [x] concluído\n\n' +
      ['',''].join('') + String.fromCharCode(96).repeat(3) + 'javascript\nconst x = 1;\n' + String.fromCharCode(96).repeat(3));
    expect(r.html).toContain('<table>');
    expect(r.html).toContain('type="checkbox"');
    expect(r.html).toContain('class="hljs"');
  });
  it('renders math with locally produced MathML and reads YAML frontmatter', () => {
    const r = parsePreview('---\ntitle: Papus\n---\n\n$$\nx^2\n$$');
    expect(r.html).toContain('<math');
    expect(r.html).toContain('Papus');
  });
  it('keeps Mermaid source local for isolated image rendering', () => {
    const marker = String.fromCharCode(96).repeat(3);
    const r = parsePreview(marker + 'mermaid\ngraph TD\n  A-->B\n' + marker);
    expect(r.diagrams).toHaveLength(1);
    expect(r.html).toContain('md-mermaid-slot');
    expect(r.html).not.toContain('<svg');
  });
});
