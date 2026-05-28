import { FileText, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { ComplianceResult } from '../../api/reports';
import { useFrameworks } from '../../api/frameworks';
import { avgScore, frameworkLabel } from '../../helpers/report-labels';
import { formatRelativeTime } from '../../helpers/format-time';

type ReportStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

interface ReportListItem {
 id: string;
 status: ReportStatus;
 result: ComplianceResult | null;
 error: string | null;
 createdAt: string;
 stack: { id: string; name: string };
}

interface ReportsPage {
 items: ReportListItem[];
 nextCursor: string | null;
}

const PAGE_SIZE = 25;

function useReports() {
 return useInfiniteQuery<ReportsPage>({
  queryKey: ['reports'],
  initialPageParam: null as string | null,
  queryFn: ({ pageParam }) => {
   const params = new URLSearchParams({ take: String(PAGE_SIZE) });
   if (pageParam) params.set('cursor', pageParam as string);
   return apiClient
    .get<ReportsPage>(`/reports?${params.toString()}`)
    .then((r) => r.data);
  },
  getNextPageParam: (last) => last.nextCursor,
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
   className='text-[12px] font-semibold px-2 py-0.5 rounded-full shrink-0'
   style={{ color, background: bg }}
  >
   {score}%
  </span>
 );
}

function StatusBadge({ status }: { status: ReportStatus }) {
 if (status === 'PENDING' || status === 'RUNNING') {
  return (
   <span
    className='flex items-center gap-1 text-[12px]'
    style={{ color: 'var(--color-muted)' }}
   >
    <Loader2 size={12} className='animate-spin' />
    {status === 'PENDING' ? 'Pending' : 'Running'}
   </span>
  );
 }
 if (status === 'FAILED') {
  return (
   <span
    className='flex items-center gap-1 text-[12px]'
    style={{ color: 'hsl(0 70% 48%)' }}
   >
    <AlertCircle size={12} />
    Failed
   </span>
  );
 }
 return null;
}

export default function ReportsListPage() {
 const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useReports();
 const { data: fwList = [] } = useFrameworks();

 const reports = data?.pages.flatMap((p) => p.items) ?? [];

 return (
  <div className='px-6 py-10 max-w-3xl mx-auto'>
   <div className='mb-8'>
    <h1
     className='text-[22px] font-semibold tracking-tight mb-1'
     style={{ color: 'var(--color-ink)' }}
    >
     Reports
    </h1>
    <p className='text-[14px]' style={{ color: 'var(--color-muted)' }}>
     Compliance reports generated from your stacks.
    </p>
   </div>

   {isLoading ? (
    <div className='space-y-2'>
     {[1, 2, 3].map((i) => (
      <div
       key={i}
       className='h-16 rounded-xl animate-pulse'
       style={{ background: 'var(--color-surface)' }}
      />
     ))}
    </div>
   ) : !reports || reports.length === 0 ? (
    <div
     className='rounded-xl border p-10 text-center'
     style={{
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border-subtle)',
     }}
    >
     <FileText
      size={28}
      className='mx-auto mb-3'
      style={{ color: 'var(--color-muted)' }}
     />
     <p
      className='text-[14px] font-medium mb-1'
      style={{ color: 'var(--color-ink)' }}
     >
      No reports yet
     </p>
     <p className='text-[13px] mb-5' style={{ color: 'var(--color-muted)' }}>
      Run a compliance check on a stack to generate your first report.
     </p>
     <Link
      to='/stacks'
      className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white'
      style={{ background: 'var(--color-accent)' }}
     >
      View stacks
     </Link>
    </div>
   ) : (
    <div
     className='rounded-xl border overflow-hidden'
     style={{ borderColor: 'var(--color-border-subtle)' }}
    >
     {reports.map((r) => {
      const score = avgScore(r.result);
      const frameworks = frameworkLabel(r.result, fwList);
      return (
       <Link
        key={r.id}
        to={`/reports/${r.id}`}
        className='group flex items-center justify-between px-5 py-4 border-b last:border-0 transition-colors'
        style={{
         borderColor: 'var(--color-border-subtle)',
         background: 'var(--color-surface)',
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
          className='w-8 h-8 rounded-lg flex items-center justify-center shrink-0'
          style={{ background: 'var(--color-accent-soft)' }}
         >
          <FileText size={14} style={{ color: 'var(--color-accent-ink)' }} />
         </div>
         <div className='min-w-0'>
          <p
           className='text-[13px] font-semibold truncate'
           style={{ color: 'var(--color-ink)' }}
          >
           {frameworks || r.stack.name}
          </p>
          <p
           className='text-[12px] truncate'
           style={{ color: 'var(--color-muted)' }}
           title={new Date(r.createdAt).toLocaleString()}
          >
           {r.stack.name} · {formatRelativeTime(r.createdAt)}
          </p>
         </div>
        </div>
        <div className='flex items-center gap-2 shrink-0 ml-4'>
         {score !== null ? (
          <ScoreBadge score={score} />
         ) : (
          <StatusBadge status={r.status} />
         )}
         <ChevronRight size={14} style={{ color: 'var(--color-muted)' }} />
        </div>
       </Link>
      );
     })}
    </div>
   )}

   {hasNextPage && !isLoading && (
    <div className='mt-4 flex justify-center'>
     <button
      type='button'
      onClick={() => fetchNextPage()}
      disabled={isFetchingNextPage}
      className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors'
      style={{
       background: 'var(--color-surface)',
       borderColor: 'var(--color-border-subtle)',
       color: 'var(--color-ink)',
       opacity: isFetchingNextPage ? 0.6 : 1,
       cursor: isFetchingNextPage ? 'default' : 'pointer',
      }}
     >
      {isFetchingNextPage ? (
       <>
        <Loader2 size={14} className='animate-spin' />
        Loading…
       </>
      ) : (
       'Load more'
      )}
     </button>
    </div>
   )}
  </div>
 );
}
