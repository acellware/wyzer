import { useParams, Link } from 'react-router-dom';
import {
 RadialBarChart,
 RadialBar,
 ResponsiveContainer,
 PolarAngleAxis,
} from 'recharts';
import {
 CheckCircle2,
 AlertTriangle,
 XCircle,
 Loader2,
 HelpCircle,
 ExternalLink,
} from 'lucide-react';
import {
 useSharedReport,
 type Gap,
 type UnverifiedItem,
 type Severity,
} from '../../api/reports';

// ── Helpers ───────────────────────────────────────────────────────────────────

function severityBg(severity: Severity) {
 switch (severity) {
  case 'CRITICAL':
   return 'bg-danger-dim text-danger border-danger/20';
  case 'HIGH':
   return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  case 'MEDIUM':
   return 'bg-warn-dim text-warn border-warn/20';
  case 'LOW':
   return 'bg-ok-dim text-ok border-ok/20';
 }
}

function ScoreRing({ score, label }: { score: number; label: string }) {
 const clampedScore = Math.max(0, Math.min(100, score));
 const color =
  clampedScore >= 75 ? '#22C55E' : clampedScore >= 50 ? '#EAB308' : '#EF4444';
 const data = [{ name: label, value: clampedScore, fill: color }];

 return (
  <div className='flex flex-col items-center gap-2'>
   <div className='relative w-28 h-28'>
    <ResponsiveContainer width='100%' height='100%'>
     <RadialBarChart
      cx='50%'
      cy='50%'
      innerRadius='72%'
      outerRadius='100%'
      startAngle={90}
      endAngle={-270}
      data={data}
     >
      <PolarAngleAxis type='number' domain={[0, 100]} tick={false} />
      <RadialBar
       dataKey='value'
       background={{ fill: 'rgba(255,255,255,0.05)' }}
       cornerRadius={6}
      />
     </RadialBarChart>
    </ResponsiveContainer>
    <div className='absolute inset-0 flex items-center justify-center'>
     <span className='text-2xl font-bold' style={{ color }}>
      {clampedScore}
     </span>
    </div>
   </div>
   <span className='text-xs font-mono uppercase tracking-wider text-ink-muted'>
    {label}
   </span>
  </div>
 );
}

function GapRow({ gap }: { gap: Gap }) {
 return (
  <tr className='border-t border-line'>
   <td className='py-3 pr-4 font-mono text-xs text-ink-muted'>
    {gap.controlRef}
   </td>
   <td className='py-3 pr-4 text-sm text-ink-primary'>{gap.controlTitle}</td>
   <td className='py-3 pr-4 text-xs text-ink-muted'>{gap.technologyName}</td>
   <td className='py-3 pr-4'>
    <span
     className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
      gap.isPartial
       ? 'bg-warn-dim text-warn border-warn/20'
       : 'bg-danger-dim text-danger border-danger/20'
     }`}
    >
     {gap.isPartial ? 'Partial' : 'Violates'}
    </span>
   </td>
   <td className='py-3'>
    <span
     className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${severityBg(gap.severity)}`}
    >
     {gap.severity}
    </span>
   </td>
  </tr>
 );
}

function UnverifiedRow({ item }: { item: UnverifiedItem }) {
 return (
  <tr className='border-t border-line'>
   <td className='py-3 pr-4 font-mono text-xs text-ink-muted'>
    {item.controlRef}
   </td>
   <td className='py-3 pr-4 text-sm text-ink-primary'>{item.controlTitle}</td>
   <td className='py-3 pr-4 text-xs text-ink-muted'>{item.technologyName}</td>
   <td className='py-3 pr-4' colSpan={2}>
    <div className='flex items-center gap-1.5'>
     <HelpCircle size={13} className='text-warn shrink-0' />
     <span className='text-xs text-warn'>Not sure</span>
     {item.signalKey && (
      <span className='ml-1 font-mono text-xs text-ink-muted opacity-60'>
       ({item.signalKey})
      </span>
     )}
    </div>
    {item.remediation && (
     <p className='mt-0.5 text-xs text-ink-muted italic'>{item.remediation}</p>
    )}
   </td>
  </tr>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SharedReportPage() {
 const { token = '' } = useParams<{ token: string }>();
 const { data: report, isLoading, isError } = useSharedReport(token);

 if (isLoading) {
  return (
   <div className='min-h-screen flex items-center justify-center bg-canvas'>
    <Loader2 size={32} className='animate-spin text-brand' />
   </div>
  );
 }

 if (isError || !report) {
  return (
   <div className='min-h-screen flex flex-col items-center justify-center gap-4 bg-canvas'>
    <XCircle size={40} className='text-danger' />
    <h1 className='text-xl font-semibold text-ink-primary'>
     Share link invalid or expired
    </h1>
    <p className='text-sm text-ink-muted'>This link is no longer active.</p>
    <Link to='/' className='text-sm text-brand hover:underline'>
     Learn about Wyzer →
    </Link>
   </div>
  );
 }

 const { result } = report;

 if (!result) {
  return (
   <div className='min-h-screen flex items-center justify-center bg-canvas'>
    <p className='text-ink-muted'>This report has not completed yet.</p>
   </div>
  );
 }

 const frameworks = Object.entries(result.frameworkScores);

 return (
  <div className='min-h-screen bg-canvas'>
   {/* Public banner */}
   <div className='bg-surface border-b border-line py-2 px-6 flex items-center justify-between'>
    <div className='flex items-center gap-2'>
     <span className='text-xs font-mono text-ink-muted'>SHARED REPORT</span>
     <span className='w-1 h-1 rounded-full bg-ink-muted/40' />
     <span className='text-xs text-ink-muted'>{report.stack?.name}</span>
    </div>
    <Link
     to='/register'
     className='flex items-center gap-1 text-xs text-brand hover:underline'
    >
     Generate your own report <ExternalLink size={11} />
    </Link>
   </div>

   <div className='max-w-5xl mx-auto px-6 py-10 space-y-10'>
    {/* Header */}
    <div>
     <h1 className='text-2xl font-bold text-ink-primary mb-1'>
      {report.stack?.name}
     </h1>
     <p className='text-sm text-ink-muted'>
      Generated{' '}
      {new Date(result.generatedAt).toLocaleDateString('en-US', {
       month: 'long',
       day: 'numeric',
       year: 'numeric',
      })}
     </p>
    </div>

    {/* Framework scores */}
    <section>
     <h2 className='text-sm font-semibold text-ink-primary mb-6 uppercase tracking-wider'>
      Framework Scores
     </h2>
     <div className='flex flex-wrap gap-8'>
      {frameworks.map(([slug, score]) => (
       <ScoreRing key={slug} score={score} label={slug} />
      ))}
     </div>
    </section>

    {/* Summary stats */}
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
     {[
      {
       icon: <XCircle size={18} className='text-danger' />,
       label: 'Gaps',
       value: result.gaps.length,
       bg: 'bg-danger-dim/30',
      },
      {
       icon: <AlertTriangle size={18} className='text-warn' />,
       label: 'Partial',
       value: result.gaps.filter((g) => g.isPartial).length,
       bg: 'bg-warn-dim/30',
      },
      {
       icon: <HelpCircle size={18} className='text-warn' />,
       label: 'Unverified',
       value: result.unverified.length,
       bg: 'bg-warn-dim/30',
      },
      {
       icon: <CheckCircle2 size={18} className='text-ok' />,
       label: 'Satisfied',
       value: result.satisfiedControls.length,
       bg: 'bg-ok-dim/30',
      },
     ].map(({ icon, label, value, bg }) => (
      <div
       key={label}
       className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-line ${bg}`}
      >
       {icon}
       <div>
        <p className='text-xl font-bold text-ink-primary tabular-nums'>
         {value}
        </p>
        <p className='text-xs text-ink-muted'>{label}</p>
       </div>
      </div>
     ))}
    </div>

    {/* Gaps */}
    {result.gaps.length > 0 && (
     <section>
      <h2 className='text-sm font-semibold text-ink-primary mb-3 uppercase tracking-wider'>
       Compliance Gaps
      </h2>
      <div className='rounded-xl border border-line overflow-hidden bg-surface'>
       <table className='w-full text-sm'>
        <thead className='bg-surface-raised'>
         <tr>
          {['Control', 'Title', 'Technology', 'Status', 'Severity'].map((h) => (
           <th
            key={h}
            className='px-3 py-2 text-left text-xs font-medium text-ink-muted'
           >
            {h}
           </th>
          ))}
         </tr>
        </thead>
        <tbody className='divide-y divide-line px-3'>
         {result.gaps.map((gap, i) => (
          <GapRow key={i} gap={gap} />
         ))}
        </tbody>
       </table>
      </div>
     </section>
    )}

    {/* Unverified */}
    {result.unverified.length > 0 && (
     <section>
      <h2 className='text-sm font-semibold text-warn mb-1 uppercase tracking-wider flex items-center gap-2'>
       <HelpCircle size={14} /> Unverified Controls
      </h2>
      <p className='text-xs text-ink-muted mb-3'>
       These controls had "not sure" answers — treated conservatively as unmet.
      </p>
      <div className='rounded-xl border border-line overflow-hidden bg-surface'>
       <table className='w-full text-sm'>
        <thead className='bg-surface-raised'>
         <tr>
          {['Control', 'Title', 'Technology', 'Signal'].map((h) => (
           <th
            key={h}
            className='px-3 py-2 text-left text-xs font-medium text-ink-muted'
           >
            {h}
           </th>
          ))}
         </tr>
        </thead>
        <tbody className='divide-y divide-line px-3'>
         {result.unverified.map((item, i) => (
          <UnverifiedRow key={i} item={item} />
         ))}
        </tbody>
       </table>
      </div>
     </section>
    )}

    {/* Satisfied controls */}
    {result.satisfiedControls.length > 0 && (
     <section>
      <h2 className='text-sm font-semibold text-ink-primary mb-3 uppercase tracking-wider'>
       Satisfied Controls
      </h2>
      <div className='rounded-xl border border-line bg-surface'>
       <ul className='divide-y divide-line'>
        {result.satisfiedControls.map((c, i) => (
         <li key={i} className='flex items-center gap-3 px-4 py-3'>
          <CheckCircle2 size={14} className='text-ok shrink-0' />
          <span className='font-mono text-xs text-ink-muted w-16 shrink-0'>
           {c.controlRef}
          </span>
          <span className='text-sm text-ink-primary'>{c.controlTitle}</span>
          <span className='ml-auto text-xs text-ink-muted'>
           {c.technologyName}
          </span>
         </li>
        ))}
       </ul>
      </div>
     </section>
    )}

    {/* CTA footer */}
    <div className='border-t border-line pt-8 text-center'>
     <p className='text-sm text-ink-muted mb-3'>
      Build your own compliance report with Wyzer — free forever on one stack.
     </p>
     <Link
      to='/register'
      className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand hover:bg-brand/90 transition-colors'
     >
      Get started free <ExternalLink size={14} />
     </Link>
    </div>
   </div>
  </div>
 );
}
