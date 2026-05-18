import { SectionHeader } from '@components/ui/SectionHeader';

const FRAMEWORKS = [
 {
  name: 'SOC 2 Type II',
  controls: 84,
  categories: ['Availability', 'Confidentiality', 'Processing Integrity', 'Privacy'],
 },
 {
  name: 'ISO 27001:2022',
  controls: 93,
  categories: ['Asset Management', 'Cryptography', 'Access Control', 'Incident Mgmt'],
 },
 {
  name: 'GDPR',
  controls: 47,
  categories: ['Data Subject Rights', 'Consent', 'Breach Notification', 'DPO'],
 },
 {
  name: 'PCI-DSS 4.0',
  controls: 263,
  categories: ['Network Security', 'Cardholder Data', 'Cryptography', 'Audit'],
 },
 {
  name: 'HIPAA',
  controls: 78,
  categories: ['Administrative', 'Physical Safeguards', 'Technical', 'PHI Protection'],
 },
 {
  name: 'NDPR',
  controls: 31,
  categories: ['Data Subject Rights', 'Accountability', 'Security', 'Consent'],
 },
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
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
     {FRAMEWORKS.map((fw) => (
      <div
       key={fw.name}
       className='p-6 rounded-xl border transition-colors'
       style={{
        borderColor: 'var(--color-border-subtle)',
        background: 'var(--color-surface)',
       }}
       onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
       }}
       onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
         'var(--color-border-subtle)';
       }}
      >
       <div className='flex items-start justify-between mb-4'>
        <h3
         className='text-[14px] font-semibold leading-tight'
         style={{ color: 'var(--color-ink)' }}
        >
         {fw.name}
        </h3>
        <span className='shrink-0 font-mono text-[11px] ml-3' style={{ color: 'var(--color-muted)' }}>
         {fw.controls}
        </span>
       </div>
       <div className='flex flex-wrap gap-1.5'>
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
        className='mt-4 pt-4 border-t'
        style={{ borderColor: 'var(--color-border-subtle)' }}
       >
        <span className='font-mono text-[11px]' style={{ color: 'var(--color-positive)' }}>
         ✓ Full coverage
        </span>
       </div>
      </div>
     ))}
    </div>

    {/* Stats row */}
    <div
     className='mt-10 py-6 px-8 rounded-xl border flex flex-wrap gap-8 justify-center'
     style={{
      borderColor: 'var(--color-border-subtle)',
      background: 'var(--color-surface)',
     }}
    >
     {[
      { value: '6', label: 'frameworks covered' },
      { value: '596', label: 'total controls' },
      { value: '60+', label: 'technologies mapped' },
      { value: '< 3s', label: 'to generate a report' },
     ].map((stat) => (
      <div key={stat.label} className='text-center'>
       <div
        className='text-[24px] font-semibold font-mono tabular-nums'
        style={{ color: 'var(--color-ink)' }}
       >
        {stat.value}
       </div>
       <div className='font-mono text-[11px] mt-0.5' style={{ color: 'var(--color-muted)' }}>
        {stat.label}
       </div>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
