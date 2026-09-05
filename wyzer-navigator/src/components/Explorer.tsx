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

const kindLabel = (parent?: ExplorerNode) => {
  if (!parent) return 'choose a starting point';
  switch (parent.kind) {
    case 'root':
      return parent.id === 'cloud' ? 'cloud providers' : 'industries';
    case 'provider':
      return 'service categories';
    case 'category':
      return 'services';
    case 'resource':
      return 'configurations';
    case 'industry':
      return 'business functions';
    case 'function':
      return 'topics';
    default:
      return 'options';
  }
};

const H = 520;
const CORE = { x: 156, y: H / 2 };

export default function Explorer({ tree }: { tree: ExplorerNode[] }) {
  const [ids, setIds] = useState<string[]>([]);
  const [w, setW] = useState(880);
  const [par, setPar] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIds(parseHash());
    const onHash = () => setIds(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mobile = w < 680;

  // Parallax (desktop, motion allowed)
  useEffect(() => {
    if (mobile) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      setPar({ x: dx * 16, y: dy * 14 });
    };
    const onLeave = () => setPar({ x: 0, y: 0 });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [mobile]);

  const { core, options, path, chosen } = useMemo(() => {
    const path: ExplorerNode[] = [];
    let level: ExplorerNode[] = tree;
    let core: ExplorerNode | null = null;
    for (const id of ids) {
      const node = level.find((n) => n.id === id);
      if (!node) break;
      path.push(node);
      core = node;
      level = node.children || [];
    }
    return { core, options: level, path, chosen: path };
  }, [ids, tree]);

  function encodeTrail(idList: string[], nodes: ExplorerNode[]) {
    return idList.map((id, i) => encodeURIComponent(id) + '~' + encodeURIComponent(nodes[i]?.label ?? id)).join('/');
  }

  function pick(node: ExplorerNode, depth: number) {
    if (isTerminal(node) && node.topic) {
      const trailIds = ids.slice(0, depth).concat(node.id);
      const trailNodes = chosen.slice(0, depth).concat(node);
      window.location.href = `/topic/${node.topic.slug}?p=${encodeTrail(trailIds, trailNodes)}`;
      return;
    }
    const next = ids.slice(0, depth).concat(node.id);
    const hash = next.length ? '#' + next.join('/') : '#';
    if (location.hash !== hash) location.hash = hash;
    else setIds(next);
  }

  function goTo(depth: number) {
    const next = ids.slice(0, depth);
    const hash = next.length ? '#' + next.join('/') : '#';
    if (location.hash !== hash) location.hash = hash;
    else setIds(next);
  }

  const coreLabel = core ? core.label : 'Start';
  const coreSub = core ? core.kind : 'compliance';
  const levelId = ids.join('/');

  // Desktop node positions
  const childCx = Math.min(Math.max(w * 0.6, 400), w - 150);
  const yTop = 64;
  const yBot = H - 64;
  const positions = options.map((_, i) => {
    const y = options.length === 1 ? H / 2 : yTop + ((yBot - yTop) / options.length) * (i + 0.5);
    return { x: childCx, y };
  });

  return (
    <div
      ref={wrapRef}
      className="hud"
      style={{ minHeight: mobile ? 'auto' : H }}
      aria-label="Compliance explorer console"
    >
      <div className="hud-grid" aria-hidden="true"></div>
      <div className="hud-vignette" aria-hidden="true"></div>
      <span className="hud-bracket tl" aria-hidden="true"></span>
      <span className="hud-bracket tr" aria-hidden="true"></span>
      <span className="hud-bracket bl" aria-hidden="true"></span>
      <span className="hud-bracket br" aria-hidden="true"></span>

      {/* Top HUD readouts / path */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-5 pt-4 sm:px-6">
        <nav aria-label="Path" className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[11px]">
          <span className="hud-readout mr-1"><b>PATH</b></span>
          <button type="button" className={`hud-crumb ${path.length ? '' : 'active'}`} onClick={() => goTo(0)}>start</button>
          {path.map((n, i) => (
            <span key={n.id + i} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="hud-dim" style={{ color: 'var(--hud-dim)' }}>▸</span>
              <button
                type="button"
                className={`hud-crumb ${i === path.length - 1 ? 'active' : ''}`}
                onClick={() => goTo(i + 1)}
                aria-current={i === path.length - 1 ? 'step' : undefined}
              >
                {n.label}
              </button>
            </span>
          ))}
        </nav>
        <span className="hud-readout font-mono text-[10px] uppercase tracking-widest shrink-0 hidden sm:block">
          {kindLabel(core ?? undefined)} · <b>{options.length}</b>
        </span>
      </div>

      <p className="sr-only" aria-live="polite">{`${coreLabel}: ${kindLabel(core ?? undefined)}, ${options.length} options`}</p>

      {mobile ? (
        // Mobile: stacked glowing list
        <div className="relative z-10 px-4 pb-5 pt-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 hud-core">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--hud-cyan)' }}></span>
            <span className="text-[13px] font-semibold">{coreLabel}</span>
          </div>
          <div key={levelId} className="flex flex-col gap-2">
            {options.map((n, i) => {
              const terminal = isTerminal(n);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => pick(n, path.length)}
                  className={`hud-node hud-node-anim stacked flex items-center justify-between gap-2 rounded-lg px-3.5 py-3 text-left ${terminal ? 'is-terminal' : ''}`}
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{n.label}</span>
                    {n.sublabel && <span className="block truncate font-mono text-[10px]" style={{ color: 'var(--hud-muted)' }}>{n.sublabel}</span>}
                  </span>
                  <span aria-hidden="true" style={{ color: terminal ? 'var(--hud-cyan)' : 'var(--hud-muted)' }}>{terminal ? '◆' : '▸'}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Desktop: hub-and-spokes graph
        <div className="relative" style={{ height: H }}>
          <div className="absolute inset-0" style={{ transform: `translate3d(${par.x}px, ${par.y}px, 0)`, transition: 'transform 220ms ease-out' }}>
            {/* connective lines */}
            <svg key={'l' + levelId} className="hud-lines absolute inset-0" width={w} height={H} aria-hidden="true" style={{ pointerEvents: 'none' }}>
              <defs>
                <linearGradient id="hudLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(87,214,255,0.55)" />
                  <stop offset="100%" stopColor="rgba(106,160,255,0.15)" />
                </linearGradient>
              </defs>
              {positions.map((p, i) => (
                <path
                  key={i}
                  d={`M ${CORE.x} ${CORE.y} C ${CORE.x + 130} ${CORE.y} ${p.x - 150} ${p.y} ${p.x} ${p.y}`}
                  fill="none"
                  stroke="url(#hudLineGrad)"
                  strokeWidth={1.5}
                />
              ))}
            </svg>

            {/* core */}
            <div
              className="hud-core absolute flex flex-col items-center justify-center rounded-full text-center"
              style={{ left: CORE.x, top: CORE.y, width: 132, height: 132, transform: 'translate(-50%, -50%)' }}
            >
              <span className="hud-ring" aria-hidden="true"></span>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--hud-cyan)' }}>{coreSub}</span>
              <span className="mt-1 px-3 text-[15px] font-semibold leading-tight">{coreLabel}</span>
            </div>

            {/* option nodes */}
            <div key={levelId}>
              {options.map((n, i) => {
                const p = positions[i];
                const terminal = isTerminal(n);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => pick(n, path.length)}
                    className={`hud-node hud-node-anim absolute flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left ${terminal ? 'is-terminal' : ''}`}
                    style={{
                      left: p.x,
                      top: p.y,
                      width: 216,
                      transform: 'translate(-50%, -50%)',
                      // where it flies in from (the core)
                      ['--fx' as any]: `${CORE.x - p.x}px`,
                      ['--fy' as any]: `${CORE.y - p.y}px`,
                      animationDelay: `${i * 55}ms`,
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium">{n.label}</span>
                      {n.sublabel && <span className="block truncate font-mono text-[10px]" style={{ color: 'var(--hud-muted)' }}>{n.sublabel}</span>}
                    </span>
                    <span aria-hidden="true" className="shrink-0" style={{ color: terminal ? 'var(--hud-cyan)' : 'var(--hud-muted)' }}>
                      {terminal ? '◆' : '▸'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
