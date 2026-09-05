import { SectionHeader } from './SectionHeader';

const PAINS = [
 {
  figure: '$30–80k',
  label: 'in consultants, per audit',
  body:
   "Audits take months and expensive external consultants, and still hand you a stale spreadsheet you can't maintain yourself.",
 },
 {
  figure: 'Day one',
  label: 'evidence is already stale',
  body:
   'A screenshot captures a single moment. Deploy a service or rotate a key and the evidence is instantly out of date.',
 },
 {
  figure: '6×',
  label: 'frameworks to reconcile',
  body:
   'SOC 2, ISO 27001, GDPR and more, each with hundreds of controls. Cross-mapping them by hand is a full-time job.',
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
     className='mb-14'
    />
    <div className='flex flex-col sm:flex-row'>
     {PAINS.map((p) => (
      <div
       key={p.figure}
       className='flex-1 py-7 sm:py-1 sm:px-9 sm:first:pl-0 sm:last:pr-0 border-t first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0'
       style={{ borderColor: 'var(--color-border-subtle)' }}
      >
       <p
        className='text-[42px] leading-none font-semibold tracking-tight'
        style={{ color: 'var(--color-ink)' }}
       >
        {p.figure}
       </p>
       <p
        className='mt-3 text-[14px] font-medium'
        style={{ color: 'var(--color-accent-ink)' }}
       >
        {p.label}
       </p>
       <p
        className='mt-2 text-[14px] leading-[1.6]'
        style={{ color: 'var(--color-body)' }}
       >
        {p.body}
       </p>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
