import { Server, BarChart3, CheckSquare } from 'lucide-react';
import { SectionHeader } from '@components/ui/SectionHeader';

const STEPS = [
 {
  num: '01',
  icon: Server,
  title: 'Run the agent',
  body:
   'One command runs anywhere: your CI pipeline, a developer laptop, or a scheduled job in your cluster. The agent inspects your repos, IaC, container images, and cloud accounts in under a minute.',
  detail: 'Any environment',
 },
 {
  num: '02',
  icon: BarChart3,
  title: 'Wyzer maps and scores',
  body:
   "Every signal is cross-referenced against the controls of all six frameworks at once: SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, NDPR. Wyzer pre-computes overlaps so you don't double-work.",
  detail: 'All 6 frameworks',
 },
 {
  num: '03',
  icon: CheckSquare,
  title: 'Ship with evidence',
  body:
   'The dashboard shows live scores per environment, drift between runs, and a prioritised remediation plan. Export board-ready and auditor-ready reports on demand.',
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
     className='mb-16'
    />
    <div className='grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10'>
     {STEPS.map(({ num, icon: Icon, title, body, detail }) => (
      <div key={num}>
       <div className='flex items-center gap-3 mb-5'>
        <div
         className='w-9 h-9 rounded-md flex items-center justify-center shrink-0'
         style={{ background: 'var(--color-accent-soft)' }}
        >
         <Icon size={16} style={{ color: 'var(--color-accent-ink)' }} />
        </div>
        <span
         className='font-mono text-[13px]'
         style={{ color: 'var(--color-accent-ink)' }}
        >
         {num}
        </span>
       </div>
       <h3
        className='text-[16px] font-semibold mb-2.5'
        style={{ color: 'var(--color-ink)' }}
       >
        {title}
       </h3>
       <p
        className='text-[14.5px] leading-[1.65] mb-4'
        style={{ color: 'var(--color-body)' }}
       >
        {body}
       </p>
       <span
        className='font-mono text-[11px]'
        style={{ color: 'var(--color-muted)' }}
       >
        → {detail}
       </span>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
