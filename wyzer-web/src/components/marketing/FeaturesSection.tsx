import {
 BarChart3,
 Zap,
 AlertTriangle,
 FileText,
 Users,
 GitBranch,
} from 'lucide-react';
import { SectionHeader } from './SectionHeader';

const FEATURES = [
 {
  icon: BarChart3,
  title: 'Multi-framework mapping',
  body:
   "One run maps to SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA and NDPR simultaneously. Wyzer pre-computes the overlap between controls so you don't double-work.",
 },
 {
  icon: Zap,
  title: 'Runs anywhere',
  body:
   'One agent, every surface. Drop it in CI, on a laptop, on a server, in a Kubernetes job, or behind a cron. No separate infra to operate.',
 },
 {
  icon: AlertTriangle,
  title: 'Continuous drift detection',
  body:
   'Every run is diffed against your last clean baseline. The moment a control regresses, your team gets a notification, not an audit-week surprise.',
 },
 {
  icon: FileText,
  title: 'Auditor-ready evidence',
  body:
   'Every control ships with a timestamped artifact: the config we read, the controls it satisfies, and the run that produced it. Hand your auditor a link, not a spreadsheet.',
 },
 {
  icon: Users,
  title: 'Team workspaces',
  body:
   'Share projects with your security, engineering, and compliance teams. Track remediation progress across every environment, every role, and every run.',
 },
 {
  icon: GitBranch,
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
