import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FrameworkDrawer from './FrameworkDrawer';

type Citation = { label: string; url: string | null };
type FrameworkDetail = {
  slug: string;
  name: string;
  shortName: string;
  tier: string | null;
  color: string;
  plain: string;
  detail: string[];
  citations: Citation[];
  href: string;
};
type TopicDetail = {
  slug: string;
  name: string;
  summary: string;
  frameworks: FrameworkDetail[];
};
export type ExplorerNode = {
  id: string;
  label: string;
  sublabel?: string;
  kind: string;
  children?: ExplorerNode[];
  topic?: TopicDetail | null;
};

const CORE: ExplorerNode = { id: '__core__', label: 'Start', kind: 'core' };
const R = 300; // radius between a node and its options
const DEG = Math.PI / 180;

type Pt = { x: number; y: number };
const unit = (p: Pt): Pt => {
  const m = Math.hypot(p.x, p.y) || 1;
  return { x: p.x / m, y: p.y / m };
};

function fanAngles(n: number, baseDeg: number, isCore: boolean): number[] {
  if (isCore) {
    if (n <= 1) return [0];
    if (n === 2) return [180, 0];
    return Array.from({ length: n }, (_, i) => -90 + (360 / n) * i);
  }
  if (n <= 1) return [baseDeg];
  const spread = Math.min(168, 52 + n * 16);
  return Array.from({ length: n }, (_, i) => baseDeg - spread / 2 + (spread / (n - 1)) * i);
}

const isTerminal = (n: ExplorerNode) => Boolean(n.topic) && (!n.children || n.children.length === 0);

export default function Explorer({ tree }: { tree: ExplorerNode[] }) {
  const core = useMemo(() => ({ ...CORE, children: tree }), [tree]);
  const [path, setPath] = useState<ExplorerNode[]>([]);
  const [size, setSize] = useState({ w: 1200, h: 700 });
  const [pan, setPan] = useState<Pt>({ x: 600, y: 350 });
  const [animatePan, setAnimatePan] = useState(true);
  const [revealed, setRevealed] = useState<TopicDetail | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ active: boolean; sx: number; sy: number; px: number; py: number; moved: boolean }>({
    active: false, sx: 0, sy: 0, px: 0, py: 0, moved: false,
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => {
      const r = e[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Deterministic layout for the chosen path + the current options.
  const layout = useMemo(() => {
    const pos: Record<string, Pt> = { [core.id]: { x: 0, y: 0 } };
    let parentPos: Pt = { x: 0, y: 0 };
    let parentDir: Pt | null = null;
    let sibs: ExplorerNode[] = tree;
    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      const idx = sibs.findIndex((s) => s.id === node.id);
      const baseDeg = parentDir ? Math.atan2(parentDir.y, parentDir.x) / DEG : 0;
      const ang = (fanAngles(sibs.length, baseDeg, i === 0)[Math.max(0, idx)] ?? 0) * DEG;
      const p = { x: parentPos.x + R * Math.cos(ang), y: parentPos.y + R * Math.sin(ang) };
      pos[node.id] = p;
      parentDir = unit({ x: p.x - parentPos.x, y: p.y - parentPos.y });
      parentPos = p;
      sibs = node.children ?? [];
    }
    const active = path.length ? path[path.length - 1] : core;
    const activePos = pos[active.id] ?? { x: 0, y: 0 };
    const options = active.children ?? [];
    const baseDeg = parentDir ? Math.atan2(parentDir.y, parentDir.x) / DEG : 0;
    const optAngles = fanAngles(options.length, baseDeg, path.length === 0);
    const optPositions = options.map((node, i) => {
      const ang = (optAngles[i] ?? 0) * DEG;
      return { node, pos: { x: activePos.x + R * Math.cos(ang), y: activePos.y + R * Math.sin(ang) } };
    });
    const placed = [core, ...path].map((n) => ({ node: n, pos: pos[n.id] }));
    return { pos, placed, options: optPositions, activePos, active };
  }, [path, tree, core]);

  // Re-center the active node when the path changes (animated).
  useEffect(() => {
    setAnimatePan(true);
    setPan({ x: size.w / 2 - layout.activePos.x, y: size.h / 2 - layout.activePos.y });
  }, [path, size.w, size.h]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = useCallback((node: ExplorerNode) => {
    if (isTerminal(node) && node.topic) {
      setRevealed(node.topic);
      return;
    }
    setPath((p) => [...p, node]);
  }, []);

  const goTo = useCallback((depth: number) => setPath((p) => p.slice(0, depth)), []);

  // Panning by dragging the background.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) {
        drag.current.moved = false;
        return;
      }
      drag.current = { active: true, sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y, moved: false };
      setAnimatePan(false);
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.sx;
      const dy = e.clientY - drag.current.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
      setPan({ x: drag.current.px + dx, y: drag.current.py + dy });
    };
    const onUp = () => { drag.current.active = false; };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [pan.x, pan.y]);

  const activeId = layout.active.id;

  return (
    <div
      ref={wrapRef}
      className="canvas-root absolute inset-0 overflow-hidden"
      style={{ touchAction: 'none', cursor: drag.current.active ? 'grabbing' : 'grab' }}
      aria-label="Compliance explorer canvas"
    >
      <div className="canvas-vignette" aria-hidden="true" />

      {/* World layer (panned) */}
      <div
        className="absolute left-0 top-0"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
          transition: animatePan ? 'transform 600ms cubic-bezier(0.22, 0.8, 0.2, 1)' : 'none',
        }}
      >
        {/* connective lines */}
        <svg style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, overflow: 'visible', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <linearGradient id="cx-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(120,150,255,0.5)" />
              <stop offset="100%" stopColor="rgba(120,150,255,0.12)" />
            </linearGradient>
          </defs>
          {/* trail: consecutive placed nodes */}
          {layout.placed.slice(1).map((pl, i) => {
            const from = layout.placed[i].pos;
            return <line key={`t${i}`} x1={from.x} y1={from.y} x2={pl.pos.x} y2={pl.pos.y} stroke="rgba(140,160,220,0.35)" strokeWidth={1.5} />;
          })}
          {/* active → options */}
          {layout.options.map((o, i) => (
            <line
              key={`o${o.node.id}`}
              className="cx-line-draw"
              x1={layout.activePos.x} y1={layout.activePos.y} x2={o.pos.x} y2={o.pos.y}
              stroke="url(#cx-line)" strokeWidth={1.5} pathLength={1}
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </svg>

        {/* placed nodes (core + trail path) */}
        {layout.placed.map(({ node, pos }, i) => {
          const isActive = node.id === activeId;
          const isCoreNode = node.id === core.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => (drag.current.moved ? null : isCoreNode ? goTo(0) : goTo(i))}
              className={`cx-node absolute ${isCoreNode || isActive ? 'cx-core' : 'cx-trail'}`}
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
              aria-current={isActive ? 'true' : undefined}
            >
              {(isCoreNode || isActive) ? (
                <span className="cx-core-inner">
                  <span className="cx-kicker">{isCoreNode ? 'compliance' : node.kind}</span>
                  <span className="cx-core-label">{node.label}</span>
                </span>
              ) : (
                <span className="cx-node-label">{node.label}</span>
              )}
            </button>
          );
        })}

        {/* current options */}
        {layout.options.map((o, i) => {
          const terminal = isTerminal(o.node);
          return (
            <button
              key={o.node.id}
              type="button"
              onClick={() => (drag.current.moved ? null : pick(o.node))}
              className={`cx-node cx-option cx-anim absolute ${terminal ? 'is-terminal' : ''}`}
              style={{
                left: o.pos.x,
                top: o.pos.y,
                transform: 'translate(-50%, -50%)',
                ['--fx' as string]: `${layout.activePos.x - o.pos.x}px`,
                ['--fy' as string]: `${layout.activePos.y - o.pos.y}px`,
                animationDelay: `${i * 300}ms`,
              }}
            >
              <span className="min-w-0">
                <span className="cx-node-label block truncate">{o.node.label}</span>
                {o.node.sublabel && <span className="cx-node-sub block truncate">{o.node.sublabel}</span>}
              </span>
              <span aria-hidden="true" className="cx-node-caret">{terminal ? '◆' : '▸'}</span>
            </button>
          );
        })}
      </div>

      {/* HUD path readout */}
      <nav className="canvas-path" aria-label="Path">
        <span className="cx-path-key">PATH</span>
        <button type="button" className={`cx-crumb ${path.length ? '' : 'active'}`} onClick={() => goTo(0)}>start</button>
        {path.map((n, i) => (
          <span key={n.id + i} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="cx-sep">▸</span>
            <button type="button" className={`cx-crumb ${i === path.length - 1 ? 'active' : ''}`} onClick={() => goTo(i + 1)}>
              {n.label}
            </button>
          </span>
        ))}
      </nav>
      <p className="canvas-hint" aria-hidden="true">drag to pan · click to explore</p>

      {/* Topic reveal panel */}
      {revealed && (
        <TopicReveal topic={revealed} onClose={() => setRevealed(null)} />
      )}
      {revealed && <FrameworkDrawer frameworks={revealed.frameworks} topicName={revealed.name} />}
    </div>
  );
}

function TopicReveal({ topic, onClose }: { topic: TopicDetail; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="cx-reveal-wrap" role="dialog" aria-modal="true" aria-label={topic.name}>
      <div className="cx-reveal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="cx-reveal-card">
        <div className="cx-reveal-head">
          <div>
            <p className="cx-reveal-kicker">topic</p>
            <h2 className="cx-reveal-title">{topic.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="cx-reveal-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <p className="cx-reveal-summary">{topic.summary}</p>
        <p className="cx-reveal-label">What each framework says</p>
        <div className="cx-reveal-grid">
          {topic.frameworks.map((f) => (
            <div key={f.slug} className="cx-fw-card">
              <span className="cx-fw-badge">
                <span className="cx-fw-dot" style={{ background: f.color }} aria-hidden="true" />
                {f.shortName}
                {f.tier && <span className="cx-fw-tier">{f.tier}</span>}
              </span>
              <p className="cx-fw-plain">{f.plain}</p>
              {(f.detail.length > 0 || f.citations.length > 0) && (
                <a href={f.href} data-open-framework={f.slug} className="cx-fw-more">
                  Read more <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
