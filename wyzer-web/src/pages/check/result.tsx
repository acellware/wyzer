import { Link, useParams } from 'react-router-dom';
import {
 AlertCircle,
 AlertTriangle,
 ArrowRight,
 CheckCircle2,
 HelpCircle,
 Loader2,
 ShieldCheck,
 XCircle,
} from 'lucide-react';
import { useGuestReport } from '../../api/public';
import { ApiError } from '../../api/errors';
import type { Gap, Severity, UnverifiedItem } from '../../api/reports';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_BADGE: Record<Severity, string> = {
 CRITICAL: 'bg-danger-dim text-danger border-danger/30',
 HIGH: 'bg-warn-dim text-warn border-warn/30',
 MEDIUM: 'bg-warn-dim text-warn border-warn/30',
 LOW: 'bg-ok-dim text-ok border-ok/30',
};

function scoreTone(score: number): {
 ring: string;
 text: string;
} {
 if (score >= 80) return { ring: 'ring-ok/60', text: 'text-ok' };
 if (score >= 50) return { ring: 'ring-warn/60', text: 'text-warn' };
 return { ring: 'ring-danger/60', text: 'text-danger' };
}

function frameworkScoreClass(s: number) {
 if (s >= 80) return 'text-ok';
 if (s >= 50) return 'text-warn';
 return 'text-danger';
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GuestReportResultPage() {
 const { token = '' } = useParams<{ token: string }>();
 const { data: report, isLoading, isError, error } = useGuestReport(token);

 if (isLoading) {
  return (
   <div className='min-h-screen flex items-center justify-center bg-canvas'>
    <Loader2 size={28} className='animate-spin text-brand' />
   </div>
  );
 }

 if (isError || !report) {
  const apiErr = error instanceof ApiError ? error : null;
  return (
   <div className='min-h-screen flex items-center justify-center bg-canvas px-6'>
    <div className='max-w-md w-full text-center rounded-2xl border border-line bg-surface p-8'>
     <XCircle size={28} className='mx-auto mb-3 text-ink-muted' />
     <h1 className='text-base font-semibold text-ink-primary mb-1'>
      Report not found
     </h1>
     <p className='text-sm text-ink-muted mb-5'>
      {apiErr?.statusCode === 404
       ? 'This report may have expired. Free reports are kept for 90 days.'
       : "We couldn't load this report. Please try again later."}
     </p>
     <Link
      to='/check'
      className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white hover:opacity-90 transition-opacity'
     >
      Run a new check <ArrowRight size={14} />
     </Link>
    </div>
   </div>
  );
 }

 const { result, score, stackName } = report;
 const aggregateScore = score ?? 0;
 const tone = scoreTone(aggregateScore);
 const sortedFrameworks = Object.entries(result.frameworkScores).sort(
  (a, b) => b[1] - a[1],
 );

 return (
  <div className='min-h-screen bg-canvas text-ink-primary'>
   {/* Header */}
   <header className='border-b border-line bg-canvas/90 backdrop-blur-md sticky top-0 z-20'>
    <div className='max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
     <Link
      to='/'
      className='flex items-center gap-2 text-base font-semibold text-ink-primary'
     >
      <ShieldCheck size={18} className='text-brand' />
      Wyzer
     </Link>
     <Link
      to='/check'
      className='text-sm font-medium text-ink-muted hover:text-ink-primary transition-colors'
     >
      Run another check
     </Link>
    </div>
   </header>

   <div className='max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8'>
    {/* Score card */}
    <section className='rounded-2xl border border-line bg-surface p-6 sm:p-8'>
     <div className='flex flex-col sm:flex-row sm:items-center gap-6'>
      <div
       className={`w-32 h-32 rounded-full flex items-center justify-center shrink-0 ring-[6px] ${tone.ring} bg-canvas`}
      >
       <div className='text-center'>
        <div className={`text-3xl font-bold tabular-nums ${tone.text}`}>
         {aggregateScore}
        </div>
        <div className='text-2xs uppercase tracking-wider text-ink-muted mt-0.5'>
         Score
        </div>
       </div>
      </div>

      <div className='flex-1'>
       <div className='text-2xs uppercase tracking-wider font-medium text-ink-muted mb-1'>
        Stack Check Result
       </div>
       <h1 className='text-2xl font-semibold text-ink-primary mb-3 tracking-tight'>
        {stackName ?? 'Your stack'}
       </h1>
       <div className='flex flex-wrap gap-2'>
        {sortedFrameworks.map(([slug, s]) => (
         <span
          key={slug}
          className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-line bg-canvas text-ink-primary'
         >
          {slug.toUpperCase()}
          <span className={`tabular-nums ${frameworkScoreClass(s)}`}>{s}</span>
         </span>
        ))}
       </div>
      </div>
     </div>

     {/* Summary stats */}
     <div className='grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-line'>
      <Stat
       label='Gaps'
       value={result.gaps.length}
       icon={<AlertTriangle size={14} />}
       tone='text-danger'
      />
      <Stat
       label='Unverified'
       value={result.unverified.length}
       icon={<HelpCircle size={14} />}
       tone='text-warn'
      />
      <Stat
       label='Satisfied'
       value={result.satisfiedControls.length}
       icon={<CheckCircle2 size={14} />}
       tone='text-ok'
      />
     </div>
    </section>

    {/* Limitations banner */}
    <section className='rounded-xl border border-line bg-surface p-5 flex flex-col sm:flex-row sm:items-center gap-4'>
     <AlertCircle size={20} className='shrink-0 text-warn' />
     <div className='flex-1'>
      <p className='text-sm font-semibold text-ink-primary'>
       This is a preliminary check based on your tech choices.
      </p>
      <p className='text-xs mt-0.5 text-ink-muted'>
       The Wyzer CLI runs continuous, auditor-grade scans — join the waitlist to
       get notified when it ships.
      </p>
     </div>
     <a
      href='/#waitlist'
      className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand text-white shrink-0 hover:opacity-90 transition-opacity'
     >
      Join the waitlist <ArrowRight size={14} />
     </a>
    </section>

    {/* Gaps */}
    {result.gaps.length > 0 && (
     <section>
      <h2 className='text-2xs uppercase tracking-wider font-semibold mb-3 text-ink-muted'>
       Compliance Gaps ({result.gaps.length})
      </h2>
      <div className='rounded-xl border border-line bg-surface overflow-hidden divide-y divide-line-subtle'>
       {result.gaps.map((gap, i) => (
        <GapRow key={i} gap={gap} />
       ))}
      </div>
     </section>
    )}

    {/* Unverified */}
    {result.unverified.length > 0 && (
     <section>
      <h2 className='text-2xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5 text-ink-muted'>
       <HelpCircle size={12} /> Unverified Controls ({result.unverified.length})
      </h2>
      <div className='rounded-xl border border-line bg-surface overflow-hidden divide-y divide-line-subtle'>
       {result.unverified.map((item, i) => (
        <UnverifiedRow key={i} item={item} />
       ))}
      </div>
     </section>
    )}

    {/* Satisfied */}
    {result.satisfiedControls.length > 0 && (
     <section>
      <h2 className='text-2xs uppercase tracking-wider font-semibold mb-3 text-ink-muted'>
       Satisfied Controls ({result.satisfiedControls.length})
      </h2>
      <div className='rounded-xl border border-line bg-surface overflow-hidden divide-y divide-line-subtle'>
       {result.satisfiedControls.map((c, i) => (
        <div key={i} className='flex items-center gap-3 px-4 py-3'>
         <CheckCircle2 size={14} className='shrink-0 text-ok' />
         <span className='font-mono text-2xs w-16 shrink-0 text-ink-muted'>
          {c.controlRef}
         </span>
         <span className='text-sm flex-1 text-ink-primary'>
          {c.controlTitle}
         </span>
         <span className='text-2xs text-ink-muted'>{c.technologyName}</span>
        </div>
       ))}
      </div>
     </section>
    )}

    {/* Final CTA */}
    <section className='rounded-2xl border border-line bg-surface p-8 text-center'>
     <h2 className='text-xl font-semibold text-ink-primary mb-2 tracking-tight'>
      Want the full picture?
     </h2>
     <p className='text-sm mb-5 max-w-md mx-auto text-ink-muted'>
      The Wyzer CLI and full dashboard are coming soon. Join the waitlist and
      we'll email you when your slot opens up.
     </p>
     <a
      href='/#waitlist'
      className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-brand text-white hover:opacity-90 transition-opacity'
     >
      Join the waitlist <ArrowRight size={14} />
     </a>
    </section>
   </div>
  </div>
 );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Stat({
 label,
 value,
 icon,
 tone,
}: {
 label: string;
 value: number;
 icon: React.ReactNode;
 tone: string;
}) {
 return (
  <div className='flex items-center gap-2.5'>
   <div className={tone}>{icon}</div>
   <div>
    <div className='text-lg font-semibold tabular-nums leading-none text-ink-primary'>
     {value}
    </div>
    <div className='text-2xs mt-0.5 text-ink-muted'>{label}</div>
   </div>
  </div>
 );
}

function GapRow({ gap }: { gap: Gap }) {
 return (
  <div className='px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2'>
   <span className='font-mono text-2xs sm:w-20 shrink-0 text-ink-muted'>
    {gap.controlRef}
   </span>
   <span className='text-sm flex-1 text-ink-primary'>{gap.controlTitle}</span>
   <span className='text-2xs text-ink-muted'>{gap.technologyName}</span>
   <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wide border ${SEVERITY_BADGE[gap.severity]}`}
   >
    {gap.severity}
   </span>
  </div>
 );
}

function UnverifiedRow({ item }: { item: UnverifiedItem }) {
 return (
  <div className='px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2'>
   <span className='font-mono text-2xs sm:w-20 shrink-0 text-ink-muted'>
    {item.controlRef}
   </span>
   <span className='text-sm flex-1 text-ink-primary'>{item.controlTitle}</span>
   <span className='text-2xs text-ink-muted'>{item.technologyName}</span>
  </div>
 );
}
