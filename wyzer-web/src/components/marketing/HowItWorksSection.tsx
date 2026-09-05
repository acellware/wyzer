import { SectionHeader } from './SectionHeader';

const STEPS = [
 {
  num: '01',
  title: 'Run the agent',
  body:
   'One command runs anywhere: your CI pipeline, a developer laptop, or a scheduled job in your cluster. It inspects your repos, IaC, container images, and cloud accounts in under a minute.',
  detail: 'Any environment',
 },
 {
  num: '02',
  title: 'Wyzer maps and scores',
  body:
   "Every signal is cross-referenced against the controls of all six frameworks at once: SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, NDPR. Wyzer pre-computes the overlaps so you don't double-work.",
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

const SCORES = [
 { name: 'SOC 2 Type II', score: 73, color: '#f59e0b' },
 { name: 'ISO 27001', score: 66, color: '#f59e0b' },
 { name: 'GDPR', score: 88, color: '#22c55e' },
 { name: 'HIPAA', score: 61, color: '#f87171' },
];

function EvidenceCard() {
 return (
  <div
   className='rounded-xl border overflow-hidden shadow-card'
   style={{
    background: 'var(--color-app-surface)',
    borderColor: 'var(--color-app-border)',
   }}
  >
   <div
    className='flex items-center gap-2 px-4 h-11 border-b'
    style={{ borderColor: 'var(--color-app-border)' }}
   >
    <span className='w-2.5 h-2.5 rounded-full' style={{ background: '#ff5f57' }} />
    <span className='w-2.5 h-2.5 rounded-full' style={{ background: '#febc2e' }} />
    <span className='w-2.5 h-2.5 rounded-full' style={{ background: '#28c840' }} />
    <span
     className='ml-2 font-mono text-[11px]'
     style={{ color: 'var(--color-app-muted)' }}
    >
     production · run #4e2a9f
    </span>
   </div>
   <div className='p-5'>
    <div className='flex items-baseline justify-between mb-5'>
     <span
      className='font-mono text-[10px] uppercase tracking-widest'
      style={{ color: 'var(--color-app-muted)' }}
     >
      compliance score
     </span>
     <span
      className='inline-flex items-center gap-1.5 font-mono text-[11px]'
      style={{ color: '#4ade80' }}
     >
      <span className='w-1.5 h-1.5 rounded-full' style={{ background: '#4ade80' }} />
      live
     </span>
    </div>
    {SCORES.map((row) => (
     <div key={row.name} className='mb-4 last:mb-0'>
      <div className='flex items-center justify-between mb-1.5'>
       <span className='text-[12.5px]' style={{ color: 'var(--color-app-body)' }}>
        {row.name}
       </span>
       <span
        className='font-mono text-[12.5px] font-medium'
        style={{ color: row.color }}
       >
        {row.score}
       </span>
      </div>
      <div
       className='h-1.5 rounded-full overflow-hidden'
       style={{ background: 'var(--color-app-raised)' }}
      >
       <div
        className='h-full rounded-full'
        style={{ width: `${row.score}%`, background: row.color }}
       />
      </div>
     </div>
    ))}
    <div
     className='mt-5 pt-4 border-t flex items-center gap-2'
     style={{ borderColor: 'var(--color-app-border)' }}
    >
     <span style={{ color: '#4ade80' }}>↑</span>
     <span className='text-[12px]' style={{ color: 'var(--color-app-muted)' }}>
      4 controls fixed since the last run
     </span>
    </div>
   </div>
  </div>
 );
}

export function HowItWorksSection() {
 return (
  <section id='how' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <div className='flex flex-col lg:flex-row gap-14 lg:gap-20'>
     {/* Left: header + timeline */}
     <div className='lg:flex-1 lg:min-w-0'>
      <SectionHeader
       index='02'
       kicker='how it works'
       title='Continuous evidence, generated wherever your code runs.'
       intro='Drop the Wyzer agent into any environment you trust: CI, a laptop, a server, a Kubernetes job. Every run produces fresh evidence, mapped to every framework you care about.'
       className='mb-12'
      />
      <ol className='relative'>
       <span
        aria-hidden='true'
        className='absolute left-5 top-5 bottom-5 w-px'
        style={{ background: 'var(--color-border)' }}
       />
       {STEPS.map((s) => (
        <li key={s.num} className='relative flex gap-6 pb-11 last:pb-0'>
         <div
          className='relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-mono text-[13px] font-medium text-white'
          style={{ background: 'var(--color-accent)' }}
         >
          {s.num}
         </div>
         <div className='pt-1'>
          <h3
           className='text-[17px] font-semibold'
           style={{ color: 'var(--color-ink)' }}
          >
           {s.title}
          </h3>
          <p
           className='mt-2 text-[14.5px] leading-[1.65] max-w-[480px]'
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
        </li>
       ))}
      </ol>
     </div>

     {/* Right: sticky evidence visual */}
     <div className='hidden lg:block lg:w-[380px] shrink-0'>
      <div className='lg:sticky lg:top-28'>
       <EvidenceCard />
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}
