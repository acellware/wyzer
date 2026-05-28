import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
 RadialBarChart,
 RadialBar,
 ResponsiveContainer,
 PolarAngleAxis,
} from 'recharts';
import {
 ArrowLeft,
 CheckCircle2,
 AlertTriangle,
 XCircle,
 Loader2,
 HelpCircle,
 Share2,
 FileDown,
 Copy,
 Check,
 ExternalLink,
} from 'lucide-react';
import {
 useReport,
 useRequestPdf,
 useCreateShareToken,
 type Gap,
 type UnverifiedItem,
 type Severity,
} from '../../../api/reports';
import { useFrameworks } from '../../../api/frameworks';
import { getErrorMessage } from '../../../api/errors';

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

// ── Score Ring (Recharts RadialBar) ───────────────────────────────────────────

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
       cornerRadius={8}
       background={{ fill: '#1B2B42' }}
      />
     </RadialBarChart>
    </ResponsiveContainer>
    <div className='absolute inset-0 flex items-center justify-center'>
     <span className='text-2xl font-bold tabular-nums' style={{ color }}>
      {clampedScore}
     </span>
    </div>
   </div>
   <p className='text-xs font-medium text-ink-secondary text-center max-w-[7rem] leading-tight'>
    {label}
   </p>
  </div>
 );
}

// ── Gap Row ───────────────────────────────────────────────────────────────────

function GapRow({ gap }: { gap: Gap }) {
 return (
  <tr className='border-t border-line'>
   <td className='py-3 pr-4'>
    <span
     className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-semibold border ${severityBg(gap.severity)}`}
    >
     {gap.severity}
    </span>
   </td>
   <td className='py-3 pr-4'>
    <p className='text-sm font-mono text-ink-secondary'>{gap.controlRef}</p>
   </td>
   <td className='py-3 pr-4'>
    <p className='text-sm text-ink-primary'>{gap.controlTitle}</p>
    {gap.remediation && (
     <p className='text-xs text-ink-muted mt-0.5'>{gap.remediation}</p>
    )}
   </td>
   <td className='py-3 pr-4 text-xs text-ink-secondary whitespace-nowrap'>
    {gap.frameworkSlug.toUpperCase()}
   </td>
   <td className='py-3 text-xs text-ink-secondary whitespace-nowrap'>
    {gap.technologyName}
   </td>
   <td className='py-3'>
    <span
     className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-medium border ${
      gap.isPartial
       ? 'bg-warn-dim text-warn border-warn/20'
       : 'bg-danger-dim text-danger border-danger/20'
     }`}
    >
     {gap.isPartial ? 'Partial' : 'Violates'}
    </span>
   </td>
  </tr>
 );
}

// ── Unverified Row ────────────────────────────────────────────────────────────

function UnverifiedRow({ item }: { item: UnverifiedItem }) {
 return (
  <div className='flex items-start gap-3 px-4 py-3 rounded-lg bg-warn/5 border border-warn/20'>
   <HelpCircle size={14} className='text-warn flex-shrink-0 mt-0.5' />
   <div className='flex-1 min-w-0'>
    <div className='flex items-center gap-2 flex-wrap'>
     <span className='text-xs font-mono text-ink-secondary'>
      {item.controlRef}
     </span>
     <span className='text-2xs text-ink-dim uppercase'>
      {item.frameworkSlug}
     </span>
     <span className='text-2xs text-ink-dim'>·</span>
     <span className='text-xs text-ink-muted'>{item.technologyName}</span>
    </div>
    <p className='text-sm text-ink-primary mt-0.5'>{item.controlTitle}</p>
    {item.remediation && (
     <p className='text-xs text-warn/80 mt-1 italic'>{item.remediation}</p>
    )}
    {item.signalKey && (
     <p className='text-2xs text-ink-dim mt-1'>
      Signal: <span className='font-mono'>{item.signalKey}</span> — answer this
      in the stack builder to improve your score.
     </p>
    )}
   </div>
  </div>
 );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportPage() {
 const { id } = useParams<{ id: string }>();
 const { data: report, isLoading } = useReport(id!);
 const { data: frameworks = [] } = useFrameworks();
 const requestPdf = useRequestPdf(id!);
 const createShare = useCreateShareToken(id!);
 const [shareUrl, setShareUrl] = useState<string | null>(null);
 const [copied, setCopied] = useState(false);

 function handleShare() {
  if (shareUrl) {
   copyToClipboard(shareUrl);
   return;
  }
  createShare.mutate(undefined, {
   onSuccess: (data) => {
    setShareUrl(data.shareUrl);
    copyToClipboard(data.shareUrl);
    toast.success('Share link copied to clipboard');
   },
   onError: (err) =>
    toast.error(getErrorMessage(err, 'Failed to create share link')),
  });
 }

 function handleExportPdf() {
  requestPdf.mutate(undefined, {
   onSuccess: () =>
    toast.success('PDF export started — it will appear here when ready'),
   onError: (err) => toast.error(getErrorMessage(err, 'Failed to export PDF')),
  });
 }

 function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
   setCopied(true);
   setTimeout(() => setCopied(false), 2000);
  });
 }

 if (isLoading) {
  return (
   <div className='min-h-screen bg-canvas flex items-center justify-center'>
    <Loader2 size={24} className='text-brand animate-spin' />
   </div>
  );
 }

 if (!report) {
  return (
   <div className='min-h-screen bg-canvas flex items-center justify-center text-ink-muted text-sm'>
    Report not found.
   </div>
  );
 }

 const isPending = report.status === 'PENDING' || report.status === 'RUNNING';

 return (
  <div className='min-h-screen bg-canvas px-6 py-8'>
   <div className='max-w-5xl mx-auto'>
    {/* Header */}
    <div className='flex items-start gap-3 mb-8'>
     <Link
      to={`/stacks/${report.stack.id}`}
      className='p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors mt-0.5'
     >
      <ArrowLeft size={16} />
     </Link>
     <div className='flex-1 min-w-0'>
      <h1 className='text-xl font-semibold text-ink-primary'>
       Compliance Report
      </h1>
      <p className='text-sm text-ink-muted'>
       Stack: <span className='text-ink-secondary'>{report.stack.name}</span>
      </p>
     </div>
     {/* Action buttons — only when report is done */}
     {report.status === 'DONE' && (
      <div className='flex items-center gap-2 flex-shrink-0'>
       {/* PDF button */}
       {report.pdfUrl ? (
        <a
         href={report.pdfUrl}
         target='_blank'
         rel='noreferrer'
         className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-line text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors'
        >
         <ExternalLink size={13} />
         PDF ready
        </a>
       ) : (
        <button
         onClick={handleExportPdf}
         disabled={requestPdf.isPending}
         className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-line text-ink-secondary hover:text-ink-primary hover:bg-surface-raised disabled:opacity-50 transition-colors'
        >
         {requestPdf.isPending ? (
          <Loader2 size={13} className='animate-spin' />
         ) : (
          <FileDown size={13} />
         )}
         {requestPdf.isPending ? 'Generating…' : 'Export PDF'}
        </button>
       )}

       {/* Share button */}
       <button
        onClick={handleShare}
        disabled={createShare.isPending}
        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand text-white hover:bg-brand/90 disabled:opacity-50 transition-colors'
       >
        {createShare.isPending ? (
         <Loader2 size={13} className='animate-spin' />
        ) : copied ? (
         <Check size={13} />
        ) : (
         <Share2 size={13} />
        )}
        {copied ? 'Copied!' : shareUrl ? 'Copy link' : 'Share'}
       </button>
      </div>
     )}
    </div>

    {/* Share URL display */}
    {shareUrl && (
     <div className='mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-brand/5 border border-brand/20'>
      <Share2 size={14} className='text-brand flex-shrink-0' />
      <input
       readOnly
       value={shareUrl}
       className='flex-1 bg-transparent text-sm text-ink-secondary focus:outline-none truncate'
      />
      <button
       onClick={() => copyToClipboard(shareUrl)}
       className='flex-shrink-0 p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-raised transition-colors'
      >
       {copied ? <Check size={14} className='text-ok' /> : <Copy size={14} />}
      </button>
     </div>
    )}

    {/* Status banners */}
    {isPending && (
     <div className='mb-8 flex items-center gap-3 px-5 py-4 rounded-xl bg-brand/10 border border-brand/20 text-brand'>
      <Loader2 size={18} className='animate-spin flex-shrink-0' />
      <div>
       <p className='text-sm font-medium'>Assessment in progress</p>
       <p className='text-xs opacity-70'>
        This page refreshes automatically. Please wait…
       </p>
      </div>
     </div>
    )}

    {report.status === 'FAILED' && (
     <div className='mb-8 flex items-center gap-3 px-5 py-4 rounded-xl bg-danger-dim border border-danger/20 text-danger'>
      <XCircle size={18} className='flex-shrink-0' />
      <div>
       <p className='text-sm font-medium'>Assessment failed</p>
       {report.error && (
        <p className='text-xs opacity-80 font-mono mt-0.5'>{report.error}</p>
       )}
      </div>
     </div>
    )}

    {/* Results */}
    {report.status === 'DONE' && report.result && (
     <>
      {/* Score rings */}
      <section className='mb-10'>
       <h2 className='text-xs font-semibold text-ink-dim uppercase tracking-widest mb-6'>
        Framework Scores
       </h2>
       {Object.keys(report.result.frameworkScores).length === 0 ? (
        <p className='text-sm text-ink-muted'>No framework scores available.</p>
       ) : (
        <div className='flex flex-wrap gap-10'>
         {(
          Object.entries(report.result.frameworkScores) as [string, number][]
         ).map(([frameworkId, score]) => {
          const fw = frameworks.find((f) => f.id === frameworkId);
          return (
           <ScoreRing
            key={frameworkId}
            score={score}
            label={fw?.name ?? frameworkId}
           />
          );
         })}
        </div>
       )}
      </section>

      {/* Summary stats */}
      <section className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10'>
       <StatCard
        icon={<XCircle size={16} className='text-danger' />}
        label='Gaps'
        value={report.result.gaps.filter((g) => !g.isPartial).length}
        bg='bg-danger-dim'
       />
       <StatCard
        icon={<AlertTriangle size={16} className='text-warn' />}
        label='Partial'
        value={report.result.gaps.filter((g) => g.isPartial).length}
        bg='bg-warn-dim'
       />
       <StatCard
        icon={<HelpCircle size={16} className='text-warn' />}
        label='Unverified'
        value={(report.result.unverified ?? []).length}
        bg='bg-warn/5'
       />
       <StatCard
        icon={<CheckCircle2 size={16} className='text-ok' />}
        label='Satisfied'
        value={report.result.satisfiedControls.length}
        bg='bg-ok-dim'
       />
      </section>

      {/* Gaps table */}
      {report.result.gaps.length > 0 && (
       <section className='mb-8'>
        <h2 className='text-xs font-semibold text-ink-dim uppercase tracking-widest mb-4'>
         Gaps ({report.result.gaps.length})
        </h2>
        <div className='overflow-x-auto rounded-xl border border-line'>
         <table className='w-full text-left text-sm'>
          <thead>
           <tr className='bg-surface text-ink-dim text-xs uppercase tracking-wide'>
            <th className='px-4 py-3 font-medium'>Severity</th>
            <th className='px-4 py-3 font-medium'>Control</th>
            <th className='px-4 py-3 font-medium'>Title</th>
            <th className='px-4 py-3 font-medium'>Framework</th>
            <th className='px-4 py-3 font-medium'>Technology</th>
            <th className='px-4 py-3 font-medium'>Status</th>
           </tr>
          </thead>
          <tbody>
           {report.result.gaps.map((gap: Gap, i: number) => (
            <GapRow key={i} gap={gap} />
           ))}
          </tbody>
         </table>
        </div>
       </section>
      )}

      {/* Unverified section */}
      {(report.result.unverified ?? []).length > 0 && (
       <section className='mb-8'>
        <h2 className='text-xs font-semibold text-ink-dim uppercase tracking-widest mb-2'>
         Unverified ({report.result.unverified.length})
        </h2>
        <p className='text-xs text-ink-muted mb-4'>
         These controls couldn't be evaluated because you answered "Not sure" on
         one or more config questions. Go back to the stack builder to verify
         them and improve your compliance score.
        </p>
        <div className='space-y-2'>
         {report.result.unverified.map((item: UnverifiedItem, i: number) => (
          <UnverifiedRow key={i} item={item} />
         ))}
        </div>
       </section>
      )}

      {/* Satisfied controls */}
      {report.result.satisfiedControls.length > 0 && (
       <section className='mt-8'>
        <h2 className='text-xs font-semibold text-ink-dim uppercase tracking-widest mb-4'>
         Satisfied Controls ({report.result.satisfiedControls.length})
        </h2>
        <div className='space-y-2'>
         {report.result.satisfiedControls.map((c, i) => (
          <div
           key={i}
           className='flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface border border-line'
          >
           <CheckCircle2 size={14} className='text-ok flex-shrink-0' />
           <span className='text-xs font-mono text-ink-secondary w-16 flex-shrink-0'>
            {c.controlRef}
           </span>
           <span className='text-sm text-ink-primary flex-1'>
            {c.controlTitle}
           </span>
           <span className='text-xs text-ink-muted'>{c.technologyName}</span>
           <span className='text-2xs text-ink-dim uppercase'>
            {c.frameworkSlug}
           </span>
          </div>
         ))}
        </div>
       </section>
      )}
     </>
    )}
   </div>
  </div>
 );
}

function StatCard({
 icon,
 label,
 value,
 bg,
}: {
 icon: React.ReactNode;
 label: string;
 value: number;
 bg: string;
}) {
 return (
  <div
   className={`flex items-center gap-3 px-5 py-4 rounded-xl border border-line ${bg}`}
  >
   {icon}
   <div>
    <p className='text-xl font-bold text-ink-primary tabular-nums'>{value}</p>
    <p className='text-xs text-ink-muted'>{label}</p>
   </div>
  </div>
 );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
