import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DrawerPanel, type FrameworkDetail } from './FrameworkDrawer';

type TopicDetail = { slug: string; name: string; summary: string; frameworks: FrameworkDetail[] };
export type ExplorerNode = {
  id: string;
  label: string;
  sublabel?: string;
  kind: string;
  children?: ExplorerNode[];
  topic?: TopicDetail | null;
};

const CORE: ExplorerNode = { id: '__core__', label: 'Start', kind: 'core' };
const R = 300;
const DEG = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

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
  const [scale, setScale] = useState(1);
  const [animatePan, setAnimatePan] = useState(true);
  const [revealed, setRevealed] = useState<TopicDetail | null>(null);
  const [drawerSlug, setDrawerSlug] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, sx: 0, sy: 0, px: 0, py: 0, moved: false });
  const panRef = useRef(pan);
  panRef.current = pan;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setSize({ w: e[0].contentRect.width, h: e[0].contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // ── Hash sync: the URL fragment is the source of truth for the drilled path ──
  const pathFromIds = useCallback(
    (ids: string[]) => {
      const out: ExplorerNode[] = [];
      let lvl = tree;
      for (const id of ids) {
        const n = lvl.find((x) => x.id === id);
        if (!n) break;
        out.push(n);
        lvl = n.children ?? [];
      }
      return out;
    },
    [tree],
  );
  const parseHash = () => {
    const h = location.hash.replace(/^#\/?/, '');
    return h ? h.split('/').filter(Boolean) : [];
  };
  const applyPath = useCallback(
    (ids: string[]) => {
      setPath(pathFromIds(ids));
      setRevealed(null);
      setDrawerSlug(null);
    },
    [pathFromIds],
  );
  useEffect(() => {
    applyPath(parseHash());
    const onPop = () => applyPath(parseHash());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, [applyPath]);

  const navigate = useCallback(
    (ids: string[]) => {
      const url = ids.length ? `#${ids.join('/')}` : location.pathname + location.search;
      history.pushState(null, '', url);
      applyPath(ids);
    },
    [applyPath],
  );

  const pick = useCallback(
    (node: ExplorerNode) => {
      if (drag.current.moved) return;
      if (isTerminal(node) && node.topic) {
        setRevealed(node.topic);
        setDrawerSlug(null);
        return;
      }
      navigate([...path.map((n) => n.id), node.id]);
    },
    [path, navigate],
  );
  const goTo = useCallback(
    (depth: number) => {
      if (drag.current.moved) return;
      navigate(path.map((n) => n.id).slice(0, depth));
    },
    [path, navigate],
  );

  // Re-center the active node into view whenever the path changes.
  useEffect(() => {
    setAnimatePan(true);
    const s = scaleRef.current;
    setPan({ x: size.w / 2 - layout.activePos.x * s, y: size.h / 2 - layout.activePos.y * s });
  }, [path, size.w, size.h]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drag to pan.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) {
        drag.current.moved = false;
        return;
      }
      drag.current = { active: true, sx: e.clientX, sy: e.clientY, px: panRef.current.x, py: panRef.current.y, moved: false };
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
    const onUp = () => {
      drag.current.active = false;
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // Wheel to zoom (around the cursor).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setAnimatePan(false);
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const prev = scaleRef.current;
      const next = clamp(prev * Math.exp(-e.deltaY * 0.0015), 0.4, 1.85);
      const pp = panRef.current;
      const wx = (cx - pp.x) / prev;
      const wy = (cy - pp.y) / prev;
      setScale(next);
      setPan({ x: cx - wx * next, y: cy - wy * next });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zoomBy = (factor: number) => {
    setAnimatePan(true);
    const prev = scaleRef.current;
    const next = clamp(prev * factor, 0.4, 1.85);
    const cx = size.w / 2;
    const cy = size.h / 2;
    const pp = panRef.current;
    const wx = (cx - pp.x) / prev;
    const wy = (cy - pp.y) / prev;
    setScale(next);
    setPan({ x: cx - wx * next, y: cy - wy * next });
  };
  const recenter = () => {
    setAnimatePan(true);
    setScale(1);
    setPan({ x: size.w / 2 - layout.activePos.x, y: size.h / 2 - layout.activePos.y });
  };

  const activeId = layout.active.id;

  return (
    <div
      ref={wrapRef}
      className="canvas-root absolute inset-0 overflow-hidden"
      style={{ touchAction: 'none', cursor: drag.current.active ? 'grabbing' : 'grab' }}
      aria-label="Compliance explorer canvas"
    >
      <div className="canvas-vignette" aria-hidden="true" />

      <div
        className="absolute left-0 top-0"
        style={{
          transformOrigin: '0 0',
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
          transition: animatePan ? 'transform 600ms cubic-bezier(0.22, 0.8, 0.2, 1)' : 'none',
        }}
      >
        <svg style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, overflow: 'visible', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <linearGradient id="cx-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(120,150,255,0.5)" />
              <stop offset="100%" stopColor="rgba(120,150,255,0.12)" />
            </linearGradient>
          </defs>
          {layout.placed.slice(1).map((pl, i) => {
            const from = layout.placed[i].pos;
            return <line key={`t${i}`} x1={from.x} y1={from.y} x2={pl.pos.x} y2={pl.pos.y} stroke="rgba(140,160,220,0.35)" strokeWidth={1.5} />;
          })}
          {layout.options.map((o, i) => (
            <line
              key={`o${o.node.id}`}
              className="cx-line-draw"
              x1={layout.activePos.x}
              y1={layout.activePos.y}
              x2={o.pos.x}
              y2={o.pos.y}
              stroke="url(#cx-line)"
              strokeWidth={1.5}
              pathLength={1}
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </svg>

        {layout.placed.map(({ node, pos }, i) => {
          const isActive = node.id === activeId;
          const isCoreNode = node.id === core.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => (isCoreNode ? goTo(0) : goTo(i))}
              className={`cx-node absolute ${isCoreNode || isActive ? 'cx-core' : 'cx-trail'}`}
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
              aria-current={isActive ? 'true' : undefined}
            >
              {isCoreNode || isActive ? (
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

        {layout.options.map((o, i) => {
          const terminal = isTerminal(o.node);
          return (
            <button
              key={o.node.id}
              type="button"
              onClick={() => pick(o.node)}
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

      <div className="canvas-controls">
        <button type="button" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">−</button>
        <button type="button" onClick={recenter} aria-label="Recenter" title="Recenter">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
        </button>
        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
      </div>

      <p className="canvas-hint" aria-hidden="true">drag to pan · scroll to zoom · click to explore</p>

      {revealed && <TopicReveal topic={revealed} onClose={() => setRevealed(null)} onReadMore={setDrawerSlug} />}
      {revealed && drawerSlug && (
        <DrawerPanel
          frameworks={revealed.frameworks}
          activeSlug={drawerSlug}
          topicName={revealed.name}
          onClose={() => setDrawerSlug(null)}
          onSelect={setDrawerSlug}
        />
      )}
    </div>
  );
}

function TopicReveal({ topic, onClose, onReadMore }: { topic: TopicDetail; onClose: () => void; onReadMore: (slug: string) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
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
                <button type="button" className="cx-fw-more" onClick={() => onReadMore(f.slug)}>
                  Read more <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
