import { Check, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '@components/ui/SectionHeader';

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
  name: 'Free',
  price: '$0',
  period: 'forever',
  description: 'For solo founders validating a stack.',
  highlighted: false,
  cta: 'Get started free',
  href: '/register',
  features: [
   { text: '1 stack', included: true },
   { text: '2 frameworks', included: true },
   { text: 'Gap summary report', included: true },
   { text: 'PDF export', included: false },
   { text: 'All 6 frameworks', included: false },
   { text: 'Team seats', included: false },
  ],
 },
 {
  name: 'Pro',
  price: '$49',
  period: 'per month',
  description: 'For engineers and compliance leads who need the full picture.',
  highlighted: true,
  cta: 'Start Pro trial',
  href: '/register',
  features: [
   { text: 'Unlimited stacks', included: true },
   { text: 'All 6 frameworks', included: true },
   { text: 'Gap summary report', included: true },
   { text: 'PDF export', included: true },
   { text: 'Priority gap ranking', included: true },
   { text: 'Team seats', included: false },
  ],
 },
 {
  name: 'Team',
  price: '$199',
  period: 'per month',
  description: 'For compliance teams tracking remediation across the org.',
  highlighted: false,
  cta: 'Talk to us',
  href: '/register',
  features: [
   { text: 'Unlimited stacks', included: true },
   { text: 'All 6 frameworks', included: true },
   { text: 'Gap summary report', included: true },
   { text: 'PDF export', included: true },
   { text: 'Team seats (up to 20)', included: true },
   { text: 'SSO / SAML', included: true },
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
     intro='Free forever on one stack. Upgrade when your team is ready.'
     className='mb-16'
    />
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 items-start'>
     {PLANS.map((plan) => (
      <div
       key={plan.name}
       className='rounded-xl p-6 flex flex-col border'
       style={{
        borderColor: plan.highlighted ? 'var(--color-accent)' : 'var(--color-border-subtle)',
        background: plan.highlighted ? 'var(--color-accent-soft)' : 'var(--color-surface)',
       }}
      >
       {plan.highlighted && (
        <p
         className='font-mono text-[11px] mb-4'
         style={{ color: 'var(--color-accent-ink)' }}
        >
         — most popular
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
         <span className='text-[13px] pb-1' style={{ color: 'var(--color-muted)' }}>
          {plan.period}
         </span>
        </div>
        <p className='text-[13.5px] leading-[1.5]' style={{ color: 'var(--color-body)' }}>
         {plan.description}
        </p>
       </div>
       <Link
        to={plan.href}
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
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-ink)';
        }}
        onMouseLeave={(e) => {
         if (!plan.highlighted)
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
        }}
       >
        {plan.cta}
       </Link>
       <ul className='flex-1 space-y-2.5'>
        {plan.features.map((f) => (
         <li key={f.text} className='flex items-center gap-2.5'>
          {f.included ? (
           <Check size={14} style={{ color: 'var(--color-positive)', flexShrink: 0 }} />
          ) : (
           <Minus size={14} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
          )}
          <span
           className='text-[13.5px]'
           style={{ color: f.included ? 'var(--color-body)' : 'var(--color-muted)' }}
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
     All plans include a 14-day Pro trial. No credit card required.
    </p>
   </div>
  </section>
 );
}
