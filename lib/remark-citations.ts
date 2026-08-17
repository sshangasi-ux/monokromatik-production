// remark plugin: turn inline `[n]` citation markers in prose into links to
// `#ref-n`, so react-markdown renders them as superscript reference marks that
// jump to the numbered References block. Non-numeric brackets (e.g. `[sic]`)
// are left untouched. Self-contained — walks the mdast tree manually to avoid a
// hard dependency on unist-util-visit's typings.

/* eslint-disable @typescript-eslint/no-explicit-any */

const CITE = /\[(\d+)\]/g;

function transformTextNode(value: string): any[] | null {
  if (!/\[\d+\]/.test(value)) return null;
  const parts: any[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  CITE.lastIndex = 0;
  while ((m = CITE.exec(value))) {
    if (m.index > last) parts.push({ type: 'text', value: value.slice(last, m.index) });
    const n = m[1];
    parts.push({
      type: 'link',
      url: `#ref-${n}`,
      data: { hProperties: { className: 'citation-ref', 'data-cite': n } },
      children: [{ type: 'text', value: n }],
    });
    last = m.index + m[0].length;
  }
  if (last < value.length) parts.push({ type: 'text', value: value.slice(last) });
  return parts;
}

function walk(node: any): void {
  if (!node || !Array.isArray(node.children)) return;
  // Never rewrite inside existing links or code.
  const out: any[] = [];
  for (const child of node.children) {
    if (child.type === 'text') {
      const replaced = transformTextNode(child.value);
      if (replaced) { out.push(...replaced); continue; }
    } else if (child.type !== 'link' && child.type !== 'inlineCode' && child.type !== 'code') {
      walk(child);
    }
    out.push(child);
  }
  node.children = out;
}

export function remarkCitations() {
  return (tree: any) => walk(tree);
}
