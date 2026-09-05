import { Check, Minus } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

type PlanTier = {
 name: string;
 price: string;
 period: string;
 description: string;
 highlighted: boolean;
 cta: string;
 href: string;
 features: Array<{ text: string; included: boolean }>;
};

const PLANS: PlanTier[] = [
 {
  name: 'Preview',
  price: '$0',
  period: 'free',
   description: 'See what every framework requires, free. No signup.',
  highlighted: false,
  cta: 'Explore the Navigator',
  href: '/navigator',
  features: [
   { text: '1 self-reported snapshot', included: true },
   { text: 'All 6 frameworks', included: true },
   { text: 'Summary report', included: true },
   { text: 'Continuous drift detection', included: false },
   { text: 'Auditor-ready evidence export', included: false },
   { text: 'Team seats', included: false },
  ],
 },
 {
  name: 'Starter',
  price: '$49',
  period: 'per month',
  description: 'For one team shipping one product.',
  highlighted: true,
  cta: 'Join the waitlist',
  href: '#waitlist',
  features: [
   { text: '1 project · 1 environment', included: true },
   { text: 'All 6 frameworks', included: true },
   { text: 'Agent on any surface (CI, laptop, server)', included: true },
   { text: 'Continuous drift detection', included: true },
   { text: 'Auditor-ready evidence export', included: true },
   { text: 'Team seats', included: false },
  ],
 },
 {
  name: 'Scale',
  price: '$199',
  period: 'per month',
  description: 'For multi-product orgs and compliance teams.',
  highlighted: false,
  cta: 'Join the waitlist',
  href: '#waitlist',
  features: [
   { text: 'Unlimited projects & environments', included: true },
   { text: 'All 6 frameworks', included: true },
   { text: 'Agent on any surface', included: true },
   { text: 'Drift detection + Slack / PagerDuty alerts', included: true },
   { text: 'Team seats (up to 20) · SSO / SAML', included: true },
   { text: '12-month evidence retention', included: true },
  ],
 },
];

export function PricingSection() {
 return (
  <section id='pricing' className='py-[var(--section-gap)]'>
   <div className='max-w-[1240px] mx-auto px-6'>
    <SectionHeader
     index='05'
     kicker='pricing'
     title='Simple, honest pricing.'
     intro='Explore the frameworks free, then join the waitlist for the tier that fits your team. Founding-cohort pricing locked in for life.'
     className='mb-16'
    />
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 items-start'>
     {PLANS.map((plan) => (
      <div
       key={plan.name}
       className='rounded-xl p-6 flex flex-col border'
       style={{
        borderColor: plan.highlighted
         ? 'var(--color-accent)'
         : 'var(--color-border-subtle)',
        background: plan.highlighted
         ? 'var(--color-accent-soft)'
         : 'var(--color-surface)',
       }}
      >
       {plan.highlighted && (
        <p
         className='font-mono text-[11px] mb-4'
         style={{ color: 'var(--color-accent-ink)' }}
        >
         most popular
        </p>
       )}
       <div className='mb-5'>
        <p
         className='font-mono text-[11px] uppercase tracking-widest mb-3'
         style={{ color: 'var(--color-muted)' }}
        >
         {plan.name}
        </p>
        <div className='flex items-end gap-1.5 mb-2'>
         <span
          className='text-[36px] font-semibold leading-none'
          style={{ color: 'var(--color-ink)' }}
         >
          {plan.price}
         </span>
         <span
          className='text-[13px] pb-1'
          style={{ color: 'var(--color-muted)' }}
         >
          {plan.period}
         </span>
        </div>
        <p
         className='text-[13.5px] leading-[1.5]'
         style={{ color: 'var(--color-body)' }}
        >
         {plan.description}
        </p>
       </div>
       <a
        href={plan.href}
        className='block text-center py-2.5 px-4 rounded-lg text-[14px] font-medium mb-5 border transition-colors'
        style={
         plan.highlighted
          ? {
             background: 'var(--color-accent)',
             color: '#fff',
             borderColor: 'var(--color-accent)',
            }
          : {
             background: 'transparent',
             color: 'var(--color-ink)',
             borderColor: 'var(--color-border)',
            }
        }
        onMouseEnter={(e) => {
         if (!plan.highlighted)
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
           'var(--color-ink)';
        }}
        onMouseLeave={(e) => {
         if (!plan.highlighted)
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
           'var(--color-border)';
        }}
       >
        {plan.cta}
       </a>
       <ul className='flex-1 space-y-2.5'>
        {plan.features.map((f) => (
         <li key={f.text} className='flex items-center gap-2.5'>
          {f.included ? (
           <Check
            size={14}
            style={{ color: 'var(--color-positive)', flexShrink: 0 }}
           />
          ) : (
           <Minus
            size={14}
            style={{ color: 'var(--color-muted)', flexShrink: 0 }}
           />
          )}
          <span
           className='text-[13.5px]'
           style={{
            color: f.included ? 'var(--color-body)' : 'var(--color-muted)',
           }}
          >
           {f.text}
          </span>
         </li>
        ))}
       </ul>
      </div>
     ))}
    </div>
    <p
     className='text-center font-mono text-[12px] mt-8'
     style={{ color: 'var(--color-muted)' }}
    >
     Preview is free, no signup. Starter and Scale are early access. Join the
     waitlist.
    </p>
   </div>
  </section>
 );
}
