interface AppFrameProps {
 title: string;
 children: React.ReactNode;
}

export function AppFrame({ title, children }: AppFrameProps) {
 return (
  <div
   className='rounded-xl overflow-hidden border'
   style={{
    background: 'var(--color-app-page)',
    borderColor: 'var(--color-app-border)',
   }}
  >
   {/* Title bar */}
   <div
    className='flex items-center gap-3 px-4 h-10 border-b'
    style={{
     background: 'var(--color-app-surface)',
     borderColor: 'var(--color-app-border)',
    }}
   >
    {/* Traffic lights */}
    <div className='flex items-center gap-1.5'>
     <span className='w-3 h-3 rounded-full bg-red-500/70' />
     <span className='w-3 h-3 rounded-full bg-yellow-500/70' />
     <span className='w-3 h-3 rounded-full bg-green-500/70' />
    </div>
    <span
     className='flex-1 text-center font-mono text-[11px]'
     style={{ color: 'var(--color-app-muted)' }}
    >
     {title}
    </span>
    <span className='w-12' />
   </div>

   {children}
  </div>
 );
}
