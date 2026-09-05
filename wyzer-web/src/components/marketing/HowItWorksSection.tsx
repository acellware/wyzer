import { Fragment } from 'react';
import { SectionHeader } from './SectionHeader';

const STEPS = [
 {
  num: '01',
  title: 'Run the agent',
  body:
   'One command runs anywhere: CI, a developer laptop, or a scheduled job. It inspects your repos, IaC, container images, and cloud accounts in under a minute.',
  detail: 'Any environment',
 },
 {
  num: '02',
  title: 'Wyzer maps and scores',
  body:
   "Every signal is cross-referenced against all six frameworks at once. Wyzer pre-computes the overlaps between controls so you don't double-work.",
  detail: 'All 6 frameworks',
 },
 {
  num: '03',
  title: 'Ship with evidence',
  body:
   'Live scores per environment, drift between runs, and a prioritised remediation plan. Export board-ready and auditor-ready reports on demand.',
  detail: 'Continuous',
 },
];

const SHELL = 'h-[152px] rounded-xl border p-4 shadow-card overflow-hidden';
const SHELL_STYLE = {
 background: 'var(--color-app-surface)',
 borderColor: 'var(--color-app-border)',
};
const Dot = ({ c }: { c: string }) => (
 <span className='w-2.5 h-2.5 rounded-full' style={{ background: c }} />
);

function StageGraphic({ index }: { index: number }) {
 if (index === 0) {
  return (
   <div className={`${SHELL} font-mono text-[11px] leading-[1.9]`} style={SHELL_STYLE}>
    <div className='flex gap-1.5 mb-3'>
     <Dot c='#ff5f57' />
     <Dot c='#febc2e' />
     <Dot c='#28c840' />
    </div>
    <div style={{ color: 'var(--color-app-muted)' }}>$ wyzer scan --project prod</div>
    <div style={{ color: '#4ade80' }}>✓ 24 resources inspected</div>
    <div style={{ color: '#4ade80' }}>✓ 6 frameworks mapped</div>
   </div>
  );
 }
 if (index === 1) {
  const rows: [string, number, string][] = [
   ['SOC 2', 73, '#f59e0b'],
   ['GDPR', 88, '#22c55e'],
   ['HIPAA', 61, '#f87171'],
  ];
  return (
   <div className={`${SHELL} flex flex-col justify-center gap-3`} style={SHELL_STYLE}>
    {rows.map(([name, score, color]) => (
     <div key={name}>
      <div className='flex justify-between mb-1 text-[11px]'>
       <span style={{ color: 'var(--color-app-body)' }}>{name}</span>
       <span className='font-mono font-medium' style={{ color }}>{score}</span>
      </div>
      <div className='h-1.5 rounded-full' style={{ background: 'var(--color-app-raised)' }}>
       <div className='h-full rounded-full' style={{ width: `${score}%`, background: color }} />
      </div>
     </div>
    ))}
   </div>
  );
 }
 return (
  <div className={`${SHELL} flex flex-col justify-center gap-2.5`} style={SHELL_STYLE}>
   <div className='font-mono text-[11px] mb-0.5' style={{ color: 'var(--color-app-muted)' }}>
    evidence.pdf
   </div>
   {['SOC 2 · passed', 'ISO 27001 · passed', 'GDPR · passed'].map((t) => (
    <div
     key={t}
     className='flex items-center gap-2 text-[12px]'
     style={{ color: 'var(--color-app-body)' }}
    >
     <span style={{ color: '#4ade80' }}>✓</span>
     {t}
    </div>
   ))}
  </div>
 );
}

export function HowItWorksSection() {
 return (
  <section id='how' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <SectionHeader
     index='02'
     kicker='how it works'
     title='Continuous evidence, generated wherever your code runs.'
     intro='Drop the Wyzer agent into any environment you trust: CI, a laptop, a server, a Kubernetes job. Every run produces fresh evidence, mapped to every framework you care about.'
     className='mb-14'
    />
    <div className='flex flex-col md:flex-row md:items-start gap-10 md:gap-0'>
     {STEPS.map((s, i) => (
      <Fragment key={s.num}>
       <div className='md:flex-1 md:min-w-0'>
        <StageGraphic index={i} />
        <div className='mt-6'>
         <div className='flex items-center gap-2.5 mb-2'>
          <span
           className='font-mono text-[12px] px-2 py-0.5 rounded'
           style={{
            color: 'var(--color-accent-ink)',
            background: 'var(--color-accent-soft)',
           }}
          >
           {s.num}
          </span>
          <h3 className='text-[16px] font-semibold' style={{ color: 'var(--color-ink)' }}>
           {s.title}
          </h3>
         </div>
         <p
          className='text-[14px] leading-[1.65] max-w-[340px]'
          style={{ color: 'var(--color-body)' }}
         >
          {s.body}
         </p>
         <span
          className='mt-3 inline-block font-mono text-[11px]'
          style={{ color: 'var(--color-muted)' }}
         >
          → {s.detail}
         </span>
        </div>
       </div>
       {i < STEPS.length - 1 && (
        <div
         className='hidden md:flex w-12 shrink-0 items-start justify-center'
         style={{ paddingTop: '66px' }}
         aria-hidden='true'
        >
         <span className='text-[20px]' style={{ color: 'var(--color-border)' }}>
          →
         </span>
        </div>
       )}
      </Fragment>
     ))}
    </div>
   </div>
  </section>
 );
}
