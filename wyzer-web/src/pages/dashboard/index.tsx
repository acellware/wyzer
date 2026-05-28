import {
 Layers,
 FileText,
 Plus,
 ArrowRight,
 ShieldCheck,
 Loader2,
 AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStacks } from '../../api/stacks';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { ComplianceResult } from '../../api/reports';
import { useFrameworks } from '../../api/frameworks';
import { avgScore, frameworkLabel } from '../../helpers/report-labels';

type ReportStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

interface ReportListItem {
 id: string;
 status: ReportStatus;
 result: ComplianceResult | null;
 error: string | null;
 createdAt: string;
 stack: { id: string; name: string };
}

function useRecentReports() {
 return useQuery<ReportListItem[]>({
  queryKey: ['reports', 'recent'],
  queryFn: () =>
   apiClient
    .get<{
     items: ReportListItem[];
     nextCursor: string | null;
    }>('/reports?take=5')
    .then((r) => r.data.items),
 });
}

function ScoreBadge({ score }: { score: number }) {
 const color =
  score >= 80
   ? 'hsl(142 60% 32%)'
   : score >= 50
     ? 'hsl(38 80% 40%)'
     : 'hsl(0 70% 48%)';
 const bg =
  score >= 80
   ? 'hsl(142 60% 95%)'
   : score >= 50
     ? 'hsl(38 80% 94%)'
     : 'hsl(0 80% 96%)';
 return (
  <span
   className='text-[12px] font-semibold px-2 py-0.5 rounded-full'
   style={{ color, background: bg }}
  >
   {score}%
  </span>
 );
}

export default function DashboardPage() {
 const { data: stacks, isLoading: stacksLoading } = useStacks();
 const { data: reports, isLoading: reportsLoading } = useRecentReports();
 const { data: frameworks = [] } = useFrameworks();

 const recentReports = reports?.slice(0, 5) ?? [];

 return (
  <div className='px-6 py-10 max-w-4xl mx-auto'>
   {/* Header */}
   <div className='mb-8'>
    <h1
     className='text-[22px] font-semibold tracking-tight mb-1'
     style={{ color: 'var(--color-ink)' }}
    >
     Dashboard
    </h1>
    <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
     Overview of your compliance status.
    </p>
   </div>

   {/* Stat cards */}
   <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10'>
    <StatCard
     icon={<Layers size={18} style={{ color: 'var(--color-accent-ink)' }} />}
     label='Stacks'
     value={stacksLoading ? '—' : String(stacks?.length ?? 0)}
     href='/stacks'
     action='View all'
    />
    <StatCard
     icon={<FileText size={18} style={{ color: 'var(--color-accent-ink)' }} />}
     label='Reports'
     value={reportsLoading ? '—' : String(reports?.length ?? 0)}
     href='/reports'
     action='View all'
    />
   </div>

   {/* Stacks section */}
   <SectionHeader title='Your stacks' href='/stacks' action='View all' />
   {stacksLoading ? (
    <div className='space-y-2 mb-10'>
     {[1, 2].map((i) => (
      <div
       key={i}
       className='h-14 rounded-xl animate-pulse'
       style={{ background: 'var(--color-surface)' }}
      />
     ))}
    </div>
   ) : !stacks || stacks.length === 0 ? (
    <EmptyCard
     icon={<Layers size={20} style={{ color: 'var(--color-muted)' }} />}
     message='No stacks yet'
     action={
      <Link
       to='/stacks/new'
       className='inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg text-white'
       style={{ background: 'var(--color-accent)' }}
      >
       <Plus size={13} />
       Create your first stack
      </Link>
     }
    />
   ) : (
    <div
     className='rounded-xl border overflow-hidden mb-10'
     style={{ borderColor: 'var(--color-border-subtle)' }}
    >
     {stacks.slice(0, 5).map((s) => (
      <Link
       key={s.id}
       to={`/stacks/${s.id}`}
       className='flex items-center justify-between px-5 py-3.5 border-b last:border-0 transition-colors'
       style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border-subtle)',
       }}
       onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
         'var(--color-raised)';
       }}
       onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
         'var(--color-surface)';
       }}
      >
       <div className='flex items-center gap-3 min-w-0'>
        <div
         className='w-7 h-7 rounded-lg flex items-center justify-center shrink-0'
         style={{ background: 'var(--color-accent-soft)' }}
        >
         <ShieldCheck size={13} style={{ color: 'var(--color-accent-ink)' }} />
        </div>
        <span
         className='text-[13px] font-medium truncate'
         style={{ color: 'var(--color-ink)' }}
        >
         {s.name}
        </span>
       </div>
       <ArrowRight size={14} style={{ color: 'var(--color-muted)' }} />
      </Link>
     ))}
    </div>
   )}

   {/* Recent reports */}
   <SectionHeader title='Recent reports' href='/reports' action='View all' />
   {reportsLoading ? (
    <div className='space-y-2'>
     {[1, 2].map((i) => (
      <div
       key={i}
       className='h-14 rounded-xl animate-pulse'
       style={{ background: 'var(--color-surface)' }}
      />
     ))}
    </div>
   ) : recentReports.length === 0 ? (
    <EmptyCard
     icon={<FileText size={20} style={{ color: 'var(--color-muted)' }} />}
     message='No reports yet — run a compliance check on a stack'
    />
   ) : (
    <div
     className='rounded-xl border overflow-hidden'
     style={{ borderColor: 'var(--color-border-subtle)' }}
    >
     {recentReports.map((r) => {
      const score = avgScore(r.result);
      const frameworks_ = frameworkLabel(r.result, frameworks);
      return (
       <Link
        key={r.id}
        to={`/reports/${r.id}`}
        className='flex items-center justify-between px-5 py-3.5 border-b last:border-0 transition-colors'
        style={{
         background: 'var(--color-surface)',
         borderColor: 'var(--color-border-subtle)',
        }}
        onMouseEnter={(e) => {
         (e.currentTarget as HTMLAnchorElement).style.background =
          'var(--color-raised)';
        }}
        onMouseLeave={(e) => {
         (e.currentTarget as HTMLAnchorElement).style.background =
          'var(--color-surface)';
        }}
       >
        <div className='min-w-0'>
         <p
          className='text-[13px] font-medium truncate'
          style={{ color: 'var(--color-ink)' }}
         >
          {frameworks_ || r.stack.name}
         </p>
         <p
          className='text-[12px] truncate'
          style={{ color: 'var(--color-muted)' }}
         >
          {r.stack.name} ·{' '}
          {new Date(r.createdAt).toLocaleDateString('en-US', {
           month: 'short',
           day: 'numeric',
           year: 'numeric',
          })}
         </p>
        </div>
        {r.status === 'DONE' && score !== null ? (
         <ScoreBadge score={score} />
        ) : r.status === 'FAILED' ? (
         <span className='inline-flex items-center gap-1 text-[12px] font-medium text-danger'>
          <AlertCircle size={12} /> Failed
         </span>
        ) : (
         <span className='inline-flex items-center gap-1 text-[12px] text-ink-muted'>
          <Loader2 size={12} className='animate-spin' /> Running
         </span>
        )}
       </Link>
      );
     })}
    </div>
   )}
  </div>
 );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({
 icon,
 label,
 value,
 href,
 action,
}: {
 icon: React.ReactNode;
 label: string;
 value: string;
 href: string;
 action: string;
}) {
 return (
  <Link
   to={href}
   className='flex items-center justify-between p-5 rounded-xl border transition-colors'
   style={{
    background: 'var(--color-surface)',
    borderColor: 'var(--color-border-subtle)',
   }}
   onMouseEnter={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.background =
     'var(--color-raised)';
   }}
   onMouseLeave={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.background =
     'var(--color-surface)';
   }}
  >
   <div>
    <p className='text-[12px] mb-1' style={{ color: 'var(--color-muted)' }}>
     {label}
    </p>
    <p
     className='text-[28px] font-bold tracking-tight'
     style={{ color: 'var(--color-ink)' }}
    >
     {value}
    </p>
   </div>
   <div
    className='w-10 h-10 rounded-xl flex items-center justify-center'
    style={{ background: 'var(--color-accent-soft)' }}
   >
    {icon}
   </div>
  </Link>
 );
}

function SectionHeader({
 title,
 href,
 action,
}: {
 title: string;
 href: string;
 action: string;
}) {
 return (
  <div className='flex items-center justify-between mb-3'>
   <h2
    className='text-[15px] font-semibold'
    style={{ color: 'var(--color-ink)' }}
   >
    {title}
   </h2>
   <Link
    to={href}
    className='text-[12px] font-medium flex items-center gap-1'
    style={{ color: 'var(--color-accent-ink)' }}
   >
    {action} <ArrowRight size={11} />
   </Link>
  </div>
 );
}

function EmptyCard({
 icon,
 message,
 action,
}: {
 icon: React.ReactNode;
 message: string;
 action?: React.ReactNode;
}) {
 return (
  <div
   className='rounded-xl border p-8 text-center mb-10'
   style={{
    background: 'var(--color-surface)',
    borderColor: 'var(--color-border-subtle)',
   }}
  >
   <div className='flex justify-center mb-3'>{icon}</div>
   <p className='text-[13px] mb-4' style={{ color: 'var(--color-muted)' }}>
    {message}
   </p>
   {action}
  </div>
 );
}
