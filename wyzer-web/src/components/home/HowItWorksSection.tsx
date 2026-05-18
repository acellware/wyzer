import { Server, BarChart3, CheckSquare } from 'lucide-react';
import { SectionHeader } from '@components/ui/SectionHeader';

const STEPS = [
 {
  num: '01',
  icon: Server,
  title: 'Describe your stack',
  body: 'Select the technologies powering your infrastructure — cloud providers, databases, caches, containers, IaC tools, and more. 60+ technologies supported.',
  detail: '60+ technologies',
 },
 {
  num: '02',
  icon: BarChart3,
  title: 'Wyzer scores it',
  body: 'Our compliance engine maps each technology against every applicable control across all selected frameworks — simultaneously, in under 3 seconds.',
  detail: 'Results in < 3s',
 },
 {
  num: '03',
  icon: CheckSquare,
  title: 'Fix the gaps',
  body: 'Receive a prioritised action plan with remediation steps ranked by severity, impact, and effort. Export board-ready PDFs for your stakeholders.',
  detail: 'Ranked by severity',
 },
];

export function HowItWorksSection() {
 return (
  <section id='how' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <SectionHeader
     index='02'
     kicker='how it works'
     title='Three steps from stack to score.'
     intro='No forms to fill in. No consultants to brief. Just select your technologies and get a scored, actionable compliance report.'
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
         style={{ color: 'var(--color-accent)' }}
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
       <span className='font-mono text-[11px]' style={{ color: 'var(--color-muted)' }}>
        → {detail}
       </span>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
