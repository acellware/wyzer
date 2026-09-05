interface SectionHeaderProps {
 index: string;
 kicker?: string;
 title: React.ReactNode;
 intro?: React.ReactNode;
 align?: 'left' | 'center';
 className?: string;
}

export function SectionHeader({
 index,
 kicker,
 title,
 intro,
 align = 'left',
 className = '',
}: SectionHeaderProps) {
 return (
  <header
   className={`${className} ${align === 'center' ? 'text-center mx-auto' : ''} max-w-[640px]`}
  >
   <div
    className={`flex items-center gap-3 mb-6 ${align === 'center' ? 'justify-center' : ''}`}
   >
    <span aria-hidden className='h-px w-8 bg-[var(--color-accent)]' />
    <span className='font-mono text-[12px] tracking-tight text-[var(--color-muted)] lowercase'>
     <span className='text-[var(--color-accent-ink)]'>{index}</span>
      {kicker ? (
       <span>
        {' / '}
        {kicker}
       </span>
      ) : null}
    </span>
   </div>
   <h2 className='text-display-3 text-[var(--color-ink)] balance'>{title}</h2>
   {intro ? (
    <p className='mt-5 text-[17px] leading-[1.6] text-[var(--color-muted)] pretty max-w-[560px]'>
     {intro}
    </p>
   ) : null}
  </header>
 );
}
