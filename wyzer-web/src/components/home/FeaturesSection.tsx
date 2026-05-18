import {
 BarChart3,
 Zap,
 AlertTriangle,
 FileText,
 Users,
 GitBranch,
} from 'lucide-react';
import { SectionHeader } from '@components/ui/SectionHeader';

const FEATURES = [
 {
  icon: BarChart3,
  title: 'Multi-framework scoring',
  body: 'Map your stack against SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, and NDPR simultaneously — not one framework at a time.',
 },
 {
  icon: Zap,
  title: 'Instant analysis',
  body: 'From stack description to full scored report in under 3 seconds. No waiting, no forms, no consultants.',
 },
 {
  icon: AlertTriangle,
  title: 'Severity-ranked gaps',
  body: "Every gap is ranked critical / major / minor based on the control's risk weight. Know exactly what to fix first.",
 },
 {
  icon: FileText,
  title: 'PDF export',
  body: 'Generate board-ready, audit-ready compliance reports in one click. Formatted for stakeholders, not engineers.',
 },
 {
  icon: Users,
  title: 'Team workspaces',
  body: 'Share stacks with your security, engineering, and compliance teams. Track remediation progress across the org.',
 },
 {
  icon: GitBranch,
  title: 'Wyzer Open Spec',
  body: 'An open YAML specification for compliance mappings — analogous to OpenAPI. Use it, extend it, contribute back.',
 },
];

export function FeaturesSection() {
 return (
  <section id='features' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <SectionHeader
     index='04'
     kicker='features'
     title='Everything your team needs.'
     intro='Built for engineers, designed for compliance teams, readable by boards.'
     className='mb-16'
    />
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10'>
     {FEATURES.map(({ icon: Icon, title, body }) => (
      <div key={title}>
       <div
        className='w-9 h-9 rounded-md flex items-center justify-center mb-5'
        style={{ background: 'var(--color-accent-soft)' }}
       >
        <Icon size={16} style={{ color: 'var(--color-accent-ink)' }} />
       </div>
       <h3
        className='text-[15px] font-semibold mb-2'
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
