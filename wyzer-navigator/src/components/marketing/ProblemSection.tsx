import { DollarSign, RefreshCw, Layers } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const PAINS = [
 {
  icon: DollarSign,
  title: 'Consultants cost $30k–80k',
  body:
   "Compliance audits take months and require expensive external consultants. They still deliver a stale spreadsheet you can't maintain yourself.",
 },
 {
  icon: RefreshCw,
  title: "Evidence is stale the moment it's collected",
  body:
   'Audit screenshots capture a single point in time. Deploy a service or rotate a key, and the evidence is instantly out of date.',
 },
 {
  icon: Layers,
  title: 'Six frameworks, six interpretations',
  body:
   'SOC 2, ISO 27001, GDPR. Each framework has hundreds of controls. Cross-mapping them manually is a dedicated full-time job.',
 },
];

export function ProblemSection() {
 return (
  <section id='why' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <SectionHeader
     index='01'
     kicker='the problem'
     title='Compliance used to take 6 months and $50,000.'
     intro='The same three problems kill compliance programs at every stage, from seed-stage startup to public company.'
     className='mb-16'
    />
    <div className='grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10'>
     {PAINS.map(({ icon: Icon, title, body }) => (
      <div key={title}>
       <div
        className='w-9 h-9 rounded-md flex items-center justify-center mb-5'
        style={{ background: 'var(--color-accent-soft)' }}
       >
        <Icon size={16} style={{ color: 'var(--color-accent-ink)' }} />
       </div>
       <h3
        className='text-[16px] font-semibold mb-2.5'
        style={{ color: 'var(--color-ink)' }}
       >
        {title}
       </h3>
       <p
        className='text-[14.5px] leading-[1.65]'
        style={{ color: 'var(--color-body)' }}
       >
        {body}
       </p>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
