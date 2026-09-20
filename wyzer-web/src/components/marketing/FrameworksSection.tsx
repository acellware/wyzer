import { SectionHeader } from './SectionHeader';

// Badge colors match the Navigator's framework colors (src/content/frameworks).
const FRAMEWORKS = [
 {
  name: 'NIST CSF 2.0',
  controls: 22,
  color: '#3B5B8C',
  categories: ['Govern', 'Identify', 'Protect', 'Detect'],
 },
 {
  name: 'SOC 2 Type II',
  controls: 84,
  color: '#2F855A',
  categories: ['Availability', 'Confidentiality', 'Processing Integrity', 'Privacy'],
 },
 {
  name: 'ISO 27001:2022',
  controls: 93,
  color: '#2B6CB0',
  categories: ['Asset Management', 'Cryptography', 'Access Control', 'Incident Mgmt'],
 },
 {
  name: 'GDPR',
  controls: 47,
  color: '#5A67D8',
  categories: ['Data Subject Rights', 'Consent', 'Breach Notification', 'DPO'],
 },
 {
  name: 'HIPAA',
  controls: 78,
  color: '#319795',
  categories: ['Administrative', 'Physical Safeguards', 'Technical', 'PHI Protection'],
 },
 {
  name: 'PCI DSS 4.0',
  controls: 263,
  color: '#B7791F',
  categories: ['Network Security', 'Cardholder Data', 'Cryptography', 'Audit'],
 },
 {
  name: 'FDA 21 CFR Part 11',
  controls: 11,
  color: '#9B2C2C',
  categories: ['Electronic Records', 'Electronic Signatures', 'Audit Trails', 'Validation'],
 },
];

const STATS = [
 { value: '7', label: 'frameworks covered' },
 { value: '598', label: 'total controls' },
 { value: '60+', label: 'technologies mapped' },
 { value: '< 3s', label: 'to generate a report' },
];

export function FrameworksSection() {
 return (
  <section id='frameworks' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <SectionHeader
     index='03'
     kicker='frameworks'
     title='Every major framework. One platform.'
     intro='We maintain and update mappings as frameworks evolve. New controls are added within days of each revision.'
     className='mb-16'
    />
    <div className='rounded-xl border' style={{ borderColor: 'var(--color-border-subtle)' }}>
     {FRAMEWORKS.map((fw, i) => (
      <div
       key={fw.name}
       className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-6 py-5 transition-colors'
       style={{
        background: 'var(--color-surface)',
        borderTop: i > 0 ? '1px solid var(--color-border-subtle)' : undefined,
       }}
       onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--color-raised)';
       }}
       onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)';
       }}
      >
       <div className='flex items-center gap-2.5 sm:w-56 shrink-0'>
        <span
         className='w-2.5 h-2.5 rounded-full shrink-0'
         style={{ background: fw.color }}
         aria-hidden='true'
        />
        <h3
         className='text-[14px] font-semibold leading-tight'
         style={{ color: 'var(--color-ink)' }}
        >
         {fw.name}
         <span className='sm:hidden font-mono text-[11px] font-normal ml-2' style={{ color: 'var(--color-muted)' }}>
          {fw.controls} controls
        </span>
        </h3>
       </div>
       <div className='flex flex-wrap gap-1.5 flex-1'>
        {fw.categories.map((cat) => (
         <span
          key={cat}
          className='text-[11px] px-2 py-0.5 rounded'
          style={{
           color: 'var(--color-muted)',
           border: '1px solid var(--color-border-subtle)',
           background: 'var(--color-raised)',
          }}
         >
          {cat}
         </span>
        ))}
       </div>
       <div
        className='hidden sm:block font-mono text-[11px] tabular-nums shrink-0 sm:w-24 sm:text-right'
        style={{ color: 'var(--color-muted)' }}
       >
        {fw.controls} controls
       </div>
      </div>
     ))}
    </div>

    {/* Stats row */}
    <div
     className='mt-10 rounded-xl border flex flex-col sm:flex-row'
     style={{
      borderColor: 'var(--color-border-subtle)',
      background: 'var(--color-surface)',
     }}
    >
     {STATS.map((stat, i) => (
      <div
       key={stat.label}
       className={`flex-1 px-6 py-6 text-center ${
        i > 0 ? 'border-t sm:border-t-0 sm:border-l' : ''
       }`}
       style={{ borderColor: 'var(--color-border-subtle)' }}
      >
       <div
        className='text-[26px] font-semibold font-mono tabular-nums leading-none'
        style={{ color: 'var(--color-ink)' }}
       >
        {stat.value}
       </div>
       <div className='font-mono text-[11px] mt-2' style={{ color: 'var(--color-muted)' }}>
        {stat.label}
       </div>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
