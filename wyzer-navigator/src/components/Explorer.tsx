import { useEffect, useMemo, useRef, useState } from 'react';

type Topic = { slug: string; name: string; summary: string; frameworks: string[] };
export type ExplorerNode = {
  id: string;
  label: string;
  sublabel?: string;
  kind: string;
  providerNote?: string;
  children?: ExplorerNode[];
  topic?: Topic | null;
};

const FW_COLOR: Record<string, string> = {
  nist: '#3B5B8C',
  soc2: '#2F855A',
  iso27001: '#2B6CB0',
  gdpr: '#5A67D8',
  hipaa: '#319795',
  'pci-dss': '#B7791F',
  fda: '#9B2C2C',
};
const fwLabel = (f: string) =>
  f === 'pci-dss' ? 'PCI DSS' : f === 'iso27001' ? 'ISO 27001' : f.toUpperCase();

function parseHash(): string[] {
  if (typeof location === 'undefined') return [];
  const h = location.hash.replace(/^#\/?/, '');
  return h ? h.split('/').filter(Boolean) : [];
}

export default function Explorer({ tree }: { tree: ExplorerNode[] }) {
  // Start at root so the client's first render matches the SSR output (no
  // hydration mismatch); sync the hash after mount.
  const [ids, setIds] = useState<string[]>([]);
  const userNav = useRef(false);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIds(parseHash());
    const onHash = () => setIds(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Move focus into the freshly revealed level, but only on user interaction.
  useEffect(() => {
    if (userNav.current) {
      userNav.current = false;
      revealRef.current?.focus();
    }
  }, [ids]);

  function go(next: string[]) {
    userNav.current = true;
    const hash = next.length ? '#' + next.join('/') : '#';
    if (location.hash !== hash) location.hash = hash;
    else setIds(next); // same hash (e.g. Start from root) — update directly
  }

  const { trail, options, topic } = useMemo(() => {
    const trail: ExplorerNode[] = [];
    let level: ExplorerNode[] = tree;
    let topic: Topic | null = null;
    for (const id of ids) {
      const node = (level || []).find((n) => n.id === id);
      if (!node) break;
      trail.push(node);
      if (node.topic && (!node.children || node.children.length === 0)) {
        topic = node.topic;
        level = [];
      } else {
        level = node.children || [];
      }
    }
    return { trail, options: topic ? [] : level, topic };
  }, [ids, tree]);

  const current = trail[trail.length - 1];
  const heading = topic
    ? topic.name
    : trail.length === 0
      ? 'Where do you want to start?'
      : `${current?.label}: choose one`;

  return (
    <div>
      {/* Trail of chosen nodes */}
      <nav aria-label="Your path" className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
        <button
          type="button"
          onClick={() => go([])}
          className="font-mono text-[11px] px-2 py-1 rounded-md transition-colors"
          style={{ color: ids.length ? 'var(--color-muted)' : 'var(--color-accent-ink)', border: '1px solid var(--color-border-subtle)' }}
        >
          Start
        </button>
        {trail.map((n, i) => {
          const isLast = i === trail.length - 1;
          return (
            <span key={n.id + i} className="flex items-center gap-1.5">
              <span aria-hidden="true" style={{ color: 'var(--color-border)' }}>›</span>
              <button
                type="button"
                onClick={() => go(ids.slice(0, i + 1))}
                className="font-mono text-[11px] px-2 py-1 rounded-md transition-colors hover:[background-color:var(--color-surface)]"
                style={{
                  color: isLast ? 'var(--color-ink)' : 'var(--color-muted)',
                  border: isLast ? '1px solid var(--color-border)' : '1px solid transparent',
                  background: isLast ? 'var(--color-surface)' : 'transparent',
                }}
                aria-current={isLast ? 'step' : undefined}
              >
                {n.label}
              </button>
            </span>
          );
        })}
      </nav>

      {/* connector */}
      <div className="mx-auto mt-4 h-6 w-px" style={{ background: 'var(--color-border-subtle)' }} aria-hidden="true"></div>

      {/* Revealed level (re-keyed so the reveal animation replays each step) */}
      <div
        key={ids.join('/')}
        ref={revealRef}
        tabIndex={-1}
        aria-label={heading}
        className="explorer-reveal outline-none"
      >
        <p className="text-center font-mono text-[11px] uppercase tracking-widest mb-5" style={{ color: 'var(--color-muted)' }} aria-live="polite">
          {topic ? 'topic' : trail.length === 0 ? 'start' : 'choose'}
        </p>

        {topic ? (
          <div className="mx-auto max-w-[640px] rounded-2xl border p-6 text-left explorer-node" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-surface)' }}>
            <h2 className="text-[22px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-ink)' }}>{topic.name}</h2>
            <p className="mt-2 text-[14.5px] leading-[1.6]" style={{ color: 'var(--color-body)' }}>{topic.summary}</p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>what each framework says</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.frameworks.map((f) => {
                const c = FW_COLOR[f] || 'var(--color-accent)';
                return (
                  <a
                    key={f}
                    href={`/topic/${topic.slug}/${f}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide transition-transform hover:-translate-y-0.5"
                    style={{ background: `${c}12`, color: 'var(--color-ink)', border: `1px solid ${c}40` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} aria-hidden="true"></span>
                    {fwLabel(f)}
                  </a>
                );
              })}
            </div>
            <a
              href={`/topic/${topic.slug}`}
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium"
              style={{ color: 'var(--color-accent-ink)' }}
            >
              Open full topic
              <span aria-hidden="true">→</span>
            </a>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 text-left max-w-[720px] mx-auto">
            {options.map((n, i) => {
              const terminal = Boolean(n.topic && (!n.children || n.children.length === 0));
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => go([...ids, n.id])}
                  className="explorer-node nav-glow group flex items-center justify-between gap-3 rounded-xl border p-4 text-left"
                  style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-surface)', animationDelay: `${i * 45}ms` }}
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold" style={{ color: 'var(--color-ink)' }}>{n.label}</span>
                    {n.sublabel && <span className="block mt-0.5 font-mono text-[11px]" style={{ color: 'var(--color-muted)' }}>{n.sublabel}</span>}
                    {terminal && <span className="block mt-0.5 font-mono text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-accent-ink)' }}>reveal topic</span>}
                  </span>
                  <span aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--color-muted)' }}>
                    {terminal ? '✦' : '→'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
