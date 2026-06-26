import { useEffect, useState } from 'react';
import {
 LayoutDashboard,
 Layers,
 FileText,
 Settings,
 AlertTriangle,
 ChevronRight,
} from 'lucide-react';
import { AppFrame } from '@components/ui/AppFrame';

const SCORES = [
 { framework: 'SOC 2 Type II', score: 73, delay: 0 },
 { framework: 'ISO 27001', score: 66, delay: 140 },
 { framework: 'GDPR', score: 88, delay: 280 },
 { framework: 'HIPAA', score: 61, delay: 420 },
];

const GAPS = [
 { severity: 'critical', label: 'Encryption at rest not configured on RDS' },
 { severity: 'critical', label: 'MFA not enforced for all IAM users' },
 { severity: 'major', label: 'No WAF rule set attached to load balancer' },
 { severity: 'major', label: 'CloudTrail logging disabled in us-east-2' },
 { severity: 'minor', label: 'Security group allows unrestricted egress' },
];

const NAV = [
 { icon: LayoutDashboard, label: 'Dashboard' },
 { icon: Layers, label: 'Projects', active: true },
 { icon: FileText, label: 'Reports' },
 { icon: Settings, label: 'Settings' },
];

function severityColor(s: string) {
 if (s === 'critical') return '#ef4444';
 if (s === 'major') return '#f59e0b';
 return 'var(--color-app-muted)';
}

function scoreColor(score: number) {
 if (score >= 80) return '#22c55e';
 if (score >= 65) return '#f59e0b';
 return '#ef4444';
}

function ScoreChip({
 framework,
 score,
 animated,
 delay,
}: {
 framework: string;
 score: number;
 animated: boolean;
 delay: number;
}) {
 const [w, setW] = useState(0);
 useEffect(() => {
  if (!animated) return;
  const t = setTimeout(() => setW(score), delay);
  return () => clearTimeout(t);
 }, [animated, score, delay]);

 const color = scoreColor(score);
 return (
  <div
   className='p-3 rounded-lg'
   style={{
    background: 'var(--color-app-raised)',
    border: '1px solid var(--color-app-border)',
   }}
  >
   <div className='flex items-center justify-between mb-2'>
    <span
     className='text-[10px] font-mono leading-tight'
     style={{ color: 'var(--color-app-muted)' }}
    >
     {framework}
    </span>
    <span
     className='text-[13px] font-semibold font-mono tabular-nums'
     style={{ color }}
    >
     {score}
    </span>
   </div>
   <div
    className='h-1 rounded-full overflow-hidden'
    style={{ background: 'var(--color-app-border)' }}
   >
    <div
     className='h-full rounded-full transition-all'
     style={{
      width: `${w}%`,
      background: color,
      transitionDuration: '1100ms',
      transitionTimingFunction: 'ease-out',
     }}
    />
   </div>
  </div>
 );
}

export function ScoreCardMockup() {
 const [animated, setAnimated] = useState(false);
 useEffect(() => {
  const t = setTimeout(() => setAnimated(true), 600);
  return () => clearTimeout(t);
 }, []);

 return (
  <AppFrame title='wyzer.io/projects/production'>
   <div className='flex' style={{ minHeight: '360px' }}>
    {/* Sidebar */}
    <div
     className='flex flex-col py-3 shrink-0'
     style={{
      width: '130px',
      background: 'var(--color-app-surface)',
      borderRight: '1px solid var(--color-app-border)',
     }}
    >
     {/* Logo area */}
     <div className='px-3 mb-4 flex items-center gap-2'>
      <div
       className='w-5 h-5 rounded flex items-center justify-center shrink-0'
       style={{ background: 'var(--color-app-accent)' }}
      >
       <svg width='10' height='10' viewBox='0 0 24 24' fill='none'>
        <path
         d='M6 17L9.5 7H11.5L14 13.2L16.5 7H18.5L22 17H19.8L17.5 10.8L15 17H13L10.5 10.8L8.2 17H6Z'
         fill='white'
        />
       </svg>
      </div>
      <span
       className='text-[11px] font-semibold'
       style={{ color: 'var(--color-app-body)' }}
      >
       wyzer
      </span>
     </div>

     {/* Nav items */}
     {NAV.map(({ icon: Icon, label, active }) => (
      <div
       key={label}
       className='flex items-center gap-2 px-3 py-2 mx-2 rounded-md cursor-default'
       style={{
        background: active ? 'var(--color-app-raised)' : 'transparent',
        color: active ? 'var(--color-app-body)' : 'var(--color-app-muted)',
       }}
      >
       <Icon size={13} />
       <span className='text-[11px]'>{label}</span>
      </div>
     ))}

     {/* Bottom: team / account */}
     <div
      className='mt-auto px-3 pt-3'
      style={{ borderTop: '1px solid var(--color-app-border)' }}
     >
      <div className='flex items-center gap-2'>
       <div
        className='w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0'
        style={{ background: 'var(--color-app-accent)', color: 'white' }}
       >
        A
       </div>
       <span
        className='text-[10px] truncate'
        style={{ color: 'var(--color-app-muted)' }}
       >
        acme-corp
       </span>
      </div>
     </div>
    </div>

    {/* Main content */}
    <div className='flex-1 overflow-hidden flex flex-col'>
     {/* Breadcrumb / top bar */}
     <div
      className='flex items-center gap-1.5 px-4 h-9 shrink-0'
      style={{ borderBottom: '1px solid var(--color-app-border)' }}
     >
      <span className='text-[11px]' style={{ color: 'var(--color-app-muted)' }}>
       Projects
      </span>
      <ChevronRight size={10} style={{ color: 'var(--color-app-muted)' }} />
      <span className='text-[11px]' style={{ color: 'var(--color-app-body)' }}>
       Production
      </span>
      <div
       className='ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full'
       style={{
        background: 'hsl(145 50% 10%)',
        border: '1px solid hsl(145 40% 18%)',
       }}
      >
       <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
       <span className='font-mono text-[10px]' style={{ color: '#22c55e' }}>
        live
       </span>
      </div>
     </div>

     {/* Stack chips */}
     <div className='px-4 pt-3 pb-2 flex items-center justify-between gap-2 flex-wrap shrink-0'>
      <div className='flex items-center gap-1.5 flex-wrap'>
       {['AWS', 'PostgreSQL', 'Redis', 'Docker', 'Nginx'].map((t) => (
        <span
         key={t}
         className='font-mono text-[10px] px-2 py-0.5 rounded'
         style={{
          color: 'var(--color-app-body)',
          background: 'var(--color-app-raised)',
          border: '1px solid var(--color-app-border)',
         }}
        >
         {t}
        </span>
       ))}
      </div>
      <span
       className='font-mono text-[9px] shrink-0'
       style={{ color: 'var(--color-app-muted)' }}
      >
       auto-synced 12s ago
      </span>
     </div>

     {/* Score grid */}
     <div className='px-4 pb-3 grid grid-cols-2 gap-2 shrink-0'>
      {SCORES.map((s) => (
       <ScoreChip key={s.framework} {...s} animated={animated} />
      ))}
     </div>

     {/* Gaps list */}
     <div
      className='flex-1 overflow-hidden px-4 pb-3'
      style={{
       borderTop: '1px solid var(--color-app-border)',
       paddingTop: '10px',
      }}
     >
      <div className='flex items-center gap-1.5 mb-2'>
       <AlertTriangle size={11} style={{ color: '#ef4444' }} />
       <span
        className='text-[11px] font-medium'
        style={{ color: 'var(--color-app-body)' }}
       >
        14 gaps
       </span>
       <span
        className='font-mono text-[10px]'
        style={{ color: 'var(--color-app-muted)' }}
       >
        · 3 critical · 7 major
       </span>
      </div>
      <div className='space-y-1'>
       {GAPS.map((g) => (
        <div key={g.label} className='flex items-start gap-2'>
         <span
          className='w-1.5 h-1.5 rounded-full mt-1.5 shrink-0'
          style={{ background: severityColor(g.severity) }}
         />
         <span
          className='text-[11px] leading-[1.5]'
          style={{ color: 'var(--color-app-muted)' }}
         >
          {g.label}
         </span>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>
  </AppFrame>
 );
}
