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
// Telescoping trail: the hop into the active node is full length; older hops back
// toward Start compress geometrically (with a floor that clears the Start circle),
// so the whole path stays compact and on-screen no matter how deep you drill.
const TELE = 0.62;
const HOP_MIN = 152;
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

type Role = 'core' | 'active' | 'trail' | 'option';
function halfDims(node: ExplorerNode, role: Role) {
  if (role === 'core' || role === 'active') return { w: 66, h: 66, circle: true };
  if (role === 'option') return { w: 107, h: 27, circle: false };
  return { w: Math.min(110, node.label.length * 3.6 + 16), h: 16, circle: false };
}
// Point on a node's edge in the direction `dir` (a unit vector) from its center.
function edgePoint(node: ExplorerNode, role: Role, center: Pt, dir: Pt): Pt {
  const d = halfDims(node, role);
  if (d.circle) return { x: center.x + dir.x * d.w, y: center.y + dir.y * d.h };
  const tx = dir.x !== 0 ? d.w / Math.abs(dir.x) : Infinity;
  const ty = dir.y !== 0 ? d.h / Math.abs(dir.y) : Infinity;
  const t = Math.min(tx, ty);
  return { x: center.x + dir.x * t, y: center.y + dir.y * t };
}
// Edge-to-edge segment between two nodes, leaving a small gap before the target.
function segment(from: { node: ExplorerNode; role: Role; pos: Pt }, to: { node: ExplorerNode; role: Role; pos: Pt }, gap = 8) {
  const dir = unit({ x: to.pos.x - from.pos.x, y: to.pos.y - from.pos.y });
  const a = edgePoint(from.node, from.role, from.pos, dir);
  const b0 = edgePoint(to.node, to.role, to.pos, { x: -dir.x, y: -dir.y });
  return { a, b: { x: b0.x - dir.x * gap, y: b0.y - dir.y * gap } };
}

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
      const hopR = Math.max(HOP_MIN, R * Math.pow(TELE, path.length - 1 - i));
      const p = { x: parentPos.x + hopR * Math.cos(ang), y: parentPos.y + hopR * Math.sin(ang) };
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
    // Widen the option ring when there are many children so pills never collide;
    // fitView zooms out to keep the wider fan in frame.
    const stepDeg = optAngles.length > 1 ? Math.abs(optAngles[1] - optAngles[0]) : 0;
    const optR = stepDeg > 0 ? clamp(232 / (stepDeg * DEG), R, 660) : R;
    const optPositions = options.map((node, i) => {
      const ang = (optAngles[i] ?? 0) * DEG;
      return { node, pos: { x: activePos.x + optR * Math.cos(ang), y: activePos.y + optR * Math.sin(ang) } };
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

  // Fit the whole graph (trail + active + options) into view, centered on its
  // bounding box. The telescoping trail keeps the footprint compact, so the full
  // path stays visible and readable at every depth.
  const fitView = useCallback(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const consider = (p: Pt, d: { w: number; h: number }) => {
      minX = Math.min(minX, p.x - d.w);
      maxX = Math.max(maxX, p.x + d.w);
      minY = Math.min(minY, p.y - d.h);
      maxY = Math.max(maxY, p.y + d.h);
    };
    layout.placed.forEach((pl, i) =>
      consider(pl.pos, halfDims(pl.node, i === 0 ? 'core' : pl.node.id === layout.active.id ? 'active' : 'trail')),
    );
    layout.options.forEach((o) => consider(o.pos, halfDims(o.node, 'option')));
    const PAD = 116;
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const s = clamp(Math.min((size.w - PAD * 2) / w, (size.h - PAD * 2) / h), 0.4, 1.4);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setScale(s);
    setPan({ x: size.w / 2 - cx * s, y: size.h / 2 - cy * s });
  }, [layout, size.w, size.h]);

  // Re-fit whenever the drilled path or the viewport changes.
  useEffect(() => {
    setAnimatePan(true);
    fitView();
  }, [path, size.w, size.h, fitView]);

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
    fitView();
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
              <stop offset="100%" stopColor="rgba(120,150,255,0.16)" />
            </linearGradient>
            <marker id="cx-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M0.5 1 L9 5 L0.5 9 Z" fill="rgba(150,172,236,0.62)" />
            </marker>
            <marker id="cx-arrow-lit" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8.5" markerHeight="8.5" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M0.5 1 L9 5 L0.5 9 Z" fill="rgba(140,175,255,0.85)" />
            </marker>
          </defs>
          {layout.placed.slice(1).map((pl, i) => {
            const fromPl = layout.placed[i];
            const seg = segment(
              { node: fromPl.node, role: i === 0 ? 'core' : 'trail', pos: fromPl.pos },
              { node: pl.node, role: pl.node.id === layout.active.id ? 'active' : 'trail', pos: pl.pos },
            );
            return (
              <line key={`t${i}`} x1={seg.a.x} y1={seg.a.y} x2={seg.b.x} y2={seg.b.y} stroke="rgba(140,160,220,0.4)" strokeWidth={1.5} markerEnd="url(#cx-arrow)" />
            );
          })}
          {layout.options.map((o, i) => {
            const seg = segment(
              { node: layout.active, role: 'active', pos: layout.activePos },
              { node: o.node, role: 'option', pos: o.pos },
            );
            return (
              <line
                key={`o${o.node.id}`}
                className="cx-line-draw"
                x1={seg.a.x}
                y1={seg.a.y}
                x2={seg.b.x}
                y2={seg.b.y}
                stroke="url(#cx-line)"
                strokeWidth={1.5}
                pathLength={1}
                markerEnd="url(#cx-arrow-lit)"
                style={{ animationDelay: `${i * 300}ms` }}
              />
            );
          })}
        </svg>

        {layout.placed.map(({ node, pos }, i) => {
          const isActive = node.id === activeId;
          const isCoreNode = node.id === core.id;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => (isCoreNode ? goTo(0) : goTo(i))}
              className={`cx-node cx-glide absolute ${isCoreNode || isActive ? 'cx-core' : 'cx-trail'}`}
              style={{ left: 0, top: 0, transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)` }}
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
