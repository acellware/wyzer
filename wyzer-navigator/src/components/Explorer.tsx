import { useEffect, useMemo, useRef, useState } from 'react';

type Topic = { slug: string; name: string; summary: string; frameworks: string[] };
export type ExplorerNode = {
  id: string;
  label: string;
  sublabel?: string;
  kind: string;
  children?: ExplorerNode[];
  topic?: Topic | null;
};

function parseHash(): string[] {
  if (typeof location === 'undefined') return [];
  const h = location.hash.replace(/^#\/?/, '');
  return h ? h.split('/').filter(Boolean) : [];
}

const isTerminal = (n: ExplorerNode) => Boolean(n.topic && (!n.children || n.children.length === 0));

const columnLabel = (parent?: ExplorerNode) => {
  if (!parent) return 'start here';
  switch (parent.kind) {
    case 'root':
      return parent.id === 'cloud' ? 'provider' : 'industry';
    case 'provider':
      return 'category';
    case 'category':
      return 'service';
    case 'resource':
      return 'configuration';
    case 'industry':
      return 'function';
    case 'function':
      return 'topic';
    default:
      return 'choose';
  }
};

export default function Explorer({ tree }: { tree: ExplorerNode[] }) {
  // Start at root so the client's first render matches SSR (no hydration
  // mismatch); sync the hash after mount.
  const [ids, setIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIds(parseHash());
    const onHash = () => setIds(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Auto-scroll the cascade so the newest column is in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
  }, [ids]);

  // Build the columns (Miller-columns): one per level, with the chosen item
  // highlighted; the last column is the active (unselected) level.
  const { columns, chosen } = useMemo(() => {
    const columns: { depth: number; parent?: ExplorerNode; options: ExplorerNode[]; selectedId?: string }[] = [];
    const chosen: ExplorerNode[] = [];
    let level: ExplorerNode[] = tree;
    let parent: ExplorerNode | undefined = undefined;
    for (let d = 0; d <= ids.length; d++) {
      columns.push({ depth: d, parent, options: level, selectedId: d < ids.length ? ids[d] : undefined });
      if (d < ids.length) {
        const node = level.find((n) => n.id === ids[d]);
        if (!node) break;
        chosen.push(node);
        parent = node;
        level = node.children || [];
      }
    }
    return { columns, chosen };
  }, [ids, tree]);

  function encodeTrail(idList: string[], nodes: ExplorerNode[]) {
    return idList
      .map((id, i) => encodeURIComponent(id) + '~' + encodeURIComponent(nodes[i]?.label ?? id))
      .join('/');
  }

  function pick(depth: number, node: ExplorerNode) {
    if (isTerminal(node) && node.topic) {
      // Final choice -> navigate to the details page, carrying the trail.
      const trailIds = ids.slice(0, depth).concat(node.id);
      const trailNodes = chosen.slice(0, depth).concat(node);
      const p = encodeTrail(trailIds, trailNodes);
      window.location.href = `/topic/${node.topic.slug}?p=${p}`;
      return;
    }
    const next = ids.slice(0, depth).concat(node.id);
    const hash = next.length ? '#' + next.join('/') : '#';
    if (location.hash !== hash) location.hash = hash;
    else setIds(next);
  }

  return (
    <div
      ref={scrollRef}
      className="explorer-cascade flex items-start gap-3 overflow-x-auto pb-2 -mx-2 px-2"
      aria-label="Explore compliance topics"
    >
      {columns.map((col) => {
        const keyBase = `${col.depth}:${col.selectedId ?? 'active'}`;
        const active = col.selectedId === undefined;
        return (
          <div
            key={keyBase}
            className="explorer-col shrink-0 w-[220px]"
            role="group"
            aria-label={columnLabel(col.parent)}
          >
            <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: active ? 'var(--color-accent-ink)' : 'var(--color-muted)' }}>
              {columnLabel(col.parent)}
            </p>
            <div className="flex flex-col gap-1.5">
              {col.options.map((n) => {
                const selected = n.id === col.selectedId;
                const terminal = isTerminal(n);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => pick(col.depth, n)}
                    aria-current={selected ? 'true' : undefined}
                    className={`explorer-node group flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${selected ? '' : 'hover:[border-color:var(--color-border)]'}`}
                    style={{
                      borderColor: selected ? 'var(--color-accent)' : 'var(--color-border-subtle)',
                      background: selected ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium" style={{ color: 'var(--color-ink)' }}>{n.label}</span>
                      {n.sublabel && <span className="block truncate font-mono text-[10px]" style={{ color: 'var(--color-muted)' }}>{n.sublabel}</span>}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: terminal ? 'var(--color-accent-ink)' : selected ? 'var(--color-accent-ink)' : 'var(--color-muted)' }}
                    >
                      {terminal ? '✦' : selected ? '•' : '›'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
