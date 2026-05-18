import { Check, Minus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCreateCheckoutSession, type BillingPlan } from '../../api/billing';

interface PlanFeature {
 text: string;
 included: boolean;
}

interface Plan {
 id: 'FREE' | BillingPlan;
 name: string;
 price: string;
 period: string;
 description: string;
 highlighted: boolean;
 features: PlanFeature[];
}

const PLANS: Plan[] = [
 {
  id: 'FREE',
  name: 'Free',
  price: '$0',
  period: 'forever',
  description: 'For solo founders validating a stack.',
  highlighted: false,
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
  id: 'PRO',
  name: 'Pro',
  price: '$49',
  period: 'per month',
  description: 'For engineers and compliance leads who need the full picture.',
  highlighted: true,
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
  id: 'TEAM',
  name: 'Team',
  price: '$199',
  period: 'per month',
  description: 'For compliance teams tracking remediation across the org.',
  highlighted: false,
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

function PlanCard({ plan }: { plan: Plan }) {
 const checkout = useCreateCheckoutSession();

 const handleUpgrade = () => {
  if (plan.id !== 'FREE') {
   checkout.mutate(plan.id);
  }
 };

 return (
  <div
   className='rounded-xl p-6 flex flex-col border transition-colors'
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
    <p
     className='text-[13.5px] leading-[1.5]'
     style={{ color: 'var(--color-body)' }}
    >
     {plan.description}
    </p>
   </div>

   {plan.id === 'FREE' ? (
    <Link
     to='/register'
     className='block text-center py-2.5 px-4 rounded-lg text-[14px] font-medium mb-5 border transition-colors'
     style={{
      background: 'transparent',
      color: 'var(--color-ink)',
      borderColor: 'var(--color-border)',
     }}
    >
     Get started free
    </Link>
   ) : (
    <button
     onClick={handleUpgrade}
     disabled={checkout.isPending}
     className='block w-full text-center py-2.5 px-4 rounded-lg text-[14px] font-medium mb-5 border transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
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
    >
     {checkout.isPending
      ? 'Redirecting…'
      : plan.id === 'PRO'
        ? 'Start Pro trial'
        : 'Talk to us'}
    </button>
   )}

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
 );
}

export default function PricingPage() {
 return (
  <div className='min-h-screen bg-canvas px-6 py-16'>
   <div className='max-w-4xl mx-auto'>
    {/* Header */}
    <div className='text-center mb-14'>
     <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface text-ink-muted text-xs font-mono mb-6'>
      <Zap size={11} className='text-brand' />
      pricing
     </div>
     <h1 className='text-[32px] font-semibold tracking-tight text-ink-primary mb-3'>
      Simple, honest pricing.
     </h1>
     <p className='text-[15px] text-ink-muted max-w-md mx-auto leading-relaxed'>
      Free forever on one stack. Upgrade when your team is ready.
     </p>
    </div>

    {/* Plan cards */}
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 items-start mb-8'>
     {PLANS.map((plan) => (
      <PlanCard key={plan.id} plan={plan} />
     ))}
    </div>

    <p
     className='text-center font-mono text-[12px]'
     style={{ color: 'var(--color-muted)' }}
    >
     All plans include a 14-day Pro trial. No credit card required.
    </p>

    {/* Back link */}
    <div className='flex justify-center mt-10'>
     <Link
      to='/'
      className='text-[13.5px] transition-colors'
      style={{ color: 'var(--color-muted)' }}
     >
      ← Back to home
     </Link>
    </div>
   </div>
  </div>
 );
}
