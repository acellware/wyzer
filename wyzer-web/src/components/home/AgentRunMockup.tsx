import { useEffect, useState } from 'react';
import { AppFrame } from '@components/ui/AppFrame';

type Line =
 | { kind: 'cmd'; text: string }
 | { kind: 'info'; text: string; dim?: boolean }
 | { kind: 'ok'; text: string }
 | { kind: 'warn'; text: string }
 | { kind: 'blank' };

const LINES: Line[] = [
 { kind: 'cmd', text: '$ wyzer scan --project production' },
 { kind: 'info', text: 'detecting environment...', dim: true },
 { kind: 'ok', text: 'ci: github-actions  ·  region: us-east-1' },
 { kind: 'blank' },
 { kind: 'info', text: 'inspecting infrastructure', dim: true },
 { kind: 'ok', text: 'aws         · 24 resources' },
 { kind: 'ok', text: 'postgresql  · 2 instances, encrypted' },
 { kind: 'ok', text: 'redis       · 1 cluster, tls enforced' },
 { kind: 'ok', text: 'k8s         · 18 workloads, 3 namespaces' },
 { kind: 'blank' },
 { kind: 'info', text: 'mapping to controls (6 frameworks)...', dim: true },
 { kind: 'ok', text: '596 controls evaluated in 41s' },
 { kind: 'blank' },
];

const SCORES = [
 { framework: 'SOC 2 Type II', score: 73 },
 { framework: 'ISO 27001', score: 66 },
 { framework: 'GDPR', score: 88 },
 { framework: 'HIPAA', score: 61 },
];

function scoreColor(score: number) {
 if (score >= 80) return '#22c55e';
 if (score >= 65) return '#f59e0b';
 return '#ef4444';
}

function lineColor(kind: Line['kind']) {
 switch (kind) {
  case 'cmd':
   return 'var(--color-app-body)';
  case 'ok':
   return '#22c55e';
  case 'warn':
   return '#f59e0b';
  default:
   return 'var(--color-app-muted)';
 }
}

function linePrefix(kind: Line['kind']) {
 switch (kind) {
  case 'cmd':
   return '';
  case 'ok':
   return '✓ ';
  case 'warn':
   return '! ';
  case 'info':
   return '› ';
  default:
   return '';
 }
}

export function AgentRunMockup() {
 const [shown, setShown] = useState(0);
 const [scoresIn, setScoresIn] = useState(false);
 const [barWidths, setBarWidths] = useState<number[]>([0, 0, 0, 0]);

 // Stream lines in
 useEffect(() => {
  if (shown >= LINES.length) {
   const t = setTimeout(() => setScoresIn(true), 250);
   return () => clearTimeout(t);
  }
  const delay = LINES[shown].kind === 'blank' ? 80 : 180;
  const t = setTimeout(() => setShown((s) => s + 1), delay);
  return () => clearTimeout(t);
 }, [shown]);

 // Animate score bars
 useEffect(() => {
  if (!scoresIn) return;
  SCORES.forEach((s, i) => {
   setTimeout(() => {
    setBarWidths((prev) => {
     const next = [...prev];
     next[i] = s.score;
     return next;
    });
   }, i * 140);
  });
 }, [scoresIn]);

 return (
  <AppFrame title='wyzer.io/runs/4e2a9f'>
   <div
    className='font-mono text-[11.5px] leading-[1.7] p-4'
    style={{
     minHeight: '360px',
     background: 'var(--color-app-page)',
     color: 'var(--color-app-body)',
    }}
   >
    {/* Run header */}
    <div className='flex items-center gap-2 mb-3 pb-3' style={{ borderBottom: '1px solid var(--color-app-border)' }}>
     <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
     <span style={{ color: 'var(--color-app-body)' }}>run #4e2a9f</span>
     <span style={{ color: 'var(--color-app-muted)' }}>·</span>
     <span style={{ color: 'var(--color-app-muted)' }}>main@a1b2c3d</span>
     <span className='ml-auto' style={{ color: 'var(--color-app-muted)' }}>
      live
     </span>
    </div>

    {/* Streaming log */}
    <div>
     {LINES.slice(0, shown).map((line, i) => {
      if (line.kind === 'blank') return <div key={i} style={{ height: '6px' }} />;
      return (
       <div
        key={i}
        style={{
         color: line.kind === 'info' && line.dim ? 'var(--color-app-muted)' : lineColor(line.kind),
        }}
       >
        {linePrefix(line.kind)}
        {line.text}
       </div>
      );
     })}
     {shown < LINES.length && (
      <span
       className='inline-block w-1.5 h-3 align-middle animate-pulse'
       style={{ background: 'var(--color-app-body)' }}
      />
     )}
    </div>

    {/* Scores */}
    {scoresIn && (
     <div
      className='mt-3 pt-3'
      style={{ borderTop: '1px solid var(--color-app-border)' }}
     >
      <div className='grid grid-cols-2 gap-2 mb-3'>
       {SCORES.map((s, i) => {
        const color = scoreColor(s.score);
        return (
         <div
          key={s.framework}
          className='p-2 rounded'
          style={{
           background: 'var(--color-app-raised)',
           border: '1px solid var(--color-app-border)',
          }}
         >
          <div className='flex items-center justify-between mb-1.5'>
           <span style={{ color: 'var(--color-app-muted)' }}>{s.framework}</span>
           <span style={{ color }}>{s.score}</span>
          </div>
          <div
           className='h-1 rounded-full overflow-hidden'
           style={{ background: 'var(--color-app-border)' }}
          >
           <div
            className='h-full rounded-full'
            style={{
             width: `${barWidths[i]}%`,
             background: color,
             transition: 'width 1100ms ease-out',
            }}
           />
          </div>
         </div>
        );
       })}
      </div>
      <div style={{ color: '#ef4444' }}>! 14 gaps · 3 critical · 7 major</div>
      <div style={{ color: 'var(--color-app-muted)' }}>
       evidence stored · auditor link generated →
      </div>
     </div>
    )}
   </div>
  </AppFrame>
 );
}
