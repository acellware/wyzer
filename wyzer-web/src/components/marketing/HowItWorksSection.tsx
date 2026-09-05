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
    <ol className='relative max-w-[720px]'>
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
         className='mt-2 text-[14.5px] leading-[1.65] max-w-[520px]'
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
  </section>
 );
}
