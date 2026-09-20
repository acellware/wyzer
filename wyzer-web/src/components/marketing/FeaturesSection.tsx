import { SectionHeader } from './SectionHeader';

const FEATURES = [
 {
  title: 'Multi-framework mapping',
  body:
   "One run maps to NIST, SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS and FDA simultaneously. Wyzer pre-computes the overlap between controls so you don't double-work.",
 },
 {
  title: 'Runs anywhere',
  body:
   'One agent, every surface. Drop it in CI, on a laptop, on a server, in a Kubernetes job, or behind a cron. No separate infra to operate.',
 },
 {
  title: 'Continuous drift detection',
  body:
   'Every run is diffed against your last clean baseline. The moment a control regresses, your team gets a notification, not an audit-week surprise.',
 },
 {
  title: 'Auditor-ready evidence',
  body:
   'Every control ships with a timestamped artifact: the config we read, the controls it satisfies, and the run that produced it. Hand your auditor a link, not a spreadsheet.',
 },
 {
  title: 'Team workspaces',
  body:
   'Share projects with your security, engineering, and compliance teams. Track remediation progress across every environment, every role, and every run.',
 },
 {
  title: 'Wyzer Open Spec',
  body:
   'An open YAML specification for compliance mappings, analogous to OpenAPI. Use it, extend it, and contribute back to the public registry.',
 },
];

export function FeaturesSection() {
 return (
  <section id='features' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <SectionHeader
     index='04'
     kicker='features'
     title='Built for engineers. Trusted by auditors.'
     intro='Continuous, evidence-grade compliance. Readable by boards, defensible at audit time.'
     className='mb-14'
    />
    <div
     className='border-t'
     style={{ borderColor: 'var(--color-border-subtle)' }}
    >
     {FEATURES.map((f, i) => (
      <div
       key={f.title}
       className='flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-10 py-6 border-b'
       style={{ borderColor: 'var(--color-border-subtle)' }}
      >
       <div className='flex items-baseline gap-4 sm:w-[320px] shrink-0'>
        <span
         className='font-mono text-[13px] tabular-nums'
         style={{ color: 'var(--color-muted)' }}
        >
         {String(i + 1).padStart(2, '0')}
        </span>
        <h3
         className='text-[16px] font-semibold'
         style={{ color: 'var(--color-ink)' }}
        >
         {f.title}
        </h3>
       </div>
       <p
        className='text-[14.5px] leading-[1.65]'
        style={{ color: 'var(--color-body)' }}
       >
        {f.body}
       </p>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}
