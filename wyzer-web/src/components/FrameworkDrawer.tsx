import { useEffect, useRef, useState } from 'react';

export type Citation = { label: string; url: string | null };
export type FrameworkDetail = {
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

/** Controlled drawer panel (backdrop + slide-over). No navigation. */
export function DrawerPanel({
  frameworks,
  activeSlug,
  topicName,
  onClose,
  onSelect,
}: {
  frameworks: FrameworkDetail[];
  activeSlug: string;
  topicName: string;
  onClose: () => void;
  onSelect: (slug: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const active = frameworks.find((f) => f.slug === activeSlug) ?? frameworks[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      cancelAnimationFrame(raf);
    };
  }, [onClose]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeSlug]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-labelledby="fw-drawer-title">
      <div className="drawer-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} tabIndex={-1} className="drawer-panel flex flex-col outline-none" style={{ background: 'var(--color-surface)' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b shrink-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: active.color }} aria-hidden="true" />
              <h2 id="fw-drawer-title" className="text-[15px] font-semibold truncate" style={{ color: 'var(--color-ink)' }}>
                {active.name}
              </h2>
              {active.tier && (
                <span className="font-mono text-[10px] uppercase tracking-wide shrink-0" style={{ color: 'var(--color-muted)' }}>
                  {active.tier}
                </span>
              )}
            </div>
            <p className="mt-1 text-[12px]" style={{ color: 'var(--color-muted)' }}>on {topicName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mr-1 -mt-1 h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors hover:[background-color:var(--color-raised)]"
            style={{ color: 'var(--color-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        {/* Framework tabs */}
        {frameworks.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto px-5 py-3 border-b shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            role="tablist"
            aria-label="Frameworks"
          >
            {frameworks.map((f) => {
              const isActive = f.slug === active.slug;
              return (
                <button
                  key={f.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelect(f.slug)}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors"
                  style={
                    isActive
                      ? { color: 'var(--color-ink)', background: `${f.color}22`, border: `1px solid ${f.color}66` }
                      : { color: 'var(--color-muted)', background: 'transparent', border: '1px solid var(--color-border-subtle)' }
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.color }} aria-hidden="true" />
                  {f.shortName}
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-6">
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--color-body)' }}>{active.plain}</p>

          {active.detail.length > 0 && (
            <section className="mt-8">
              <h3 className="font-mono text-2xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>In depth</h3>
              <div className="mt-3 space-y-4 text-[14.5px] leading-[1.75]" style={{ color: 'var(--color-body)' }}>
                {active.detail.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          )}

          {active.citations.length > 0 && (
            <section className="mt-8">
              <h3 className="font-mono text-2xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                {active.citations.length === 1 ? 'Source' : 'Sources'}
              </h3>
              <ul className="mt-3 space-y-3">
                {active.citations.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0" style={{ color: active.color }} aria-hidden="true">
                      {c.url ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h.01" /></svg>
                      )}
                    </span>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener" className="text-sm leading-6 underline-offset-2 hover:underline" style={{ color: 'var(--color-body)' }}>{c.label}</a>
                    ) : (
                      <span className="text-sm leading-6" style={{ color: 'var(--color-body)' }}>{c.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-8 text-2xs leading-5" style={{ color: 'var(--color-muted)' }}>
            Informational only, not legal advice. Always confirm against the official framework text.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Self-contained drawer for content pages: intercepts [data-open-framework] links. */
export default function FrameworkDrawer({ frameworks, topicName }: { frameworks: FrameworkDetail[]; topicName: string }) {
  const [slug, setSlug] = useState<string | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.('[data-open-framework]');
      if (!target) return;
      const s = target.getAttribute('data-open-framework');
      if (!s || !frameworks.some((f) => f.slug === s)) return;
      e.preventDefault();
      e.stopPropagation();
      lastFocus.current = document.activeElement as HTMLElement;
      setSlug(s);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [frameworks]);

  if (!slug) return null;
  const close = () => {
    setSlug(null);
    const el = lastFocus.current;
    if (el && typeof el.focus === 'function') el.focus();
  };
  return <DrawerPanel frameworks={frameworks} activeSlug={slug} topicName={topicName} onClose={close} onSelect={setSlug} />;
}
