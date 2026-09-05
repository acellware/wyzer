import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Seo } from '@components/Seo';

function WyzerMark() {
 return (
  <svg width='22' height='22' viewBox='0 0 24 24' aria-hidden fill='none'>
   <rect x='0.5' y='0.5' width='23' height='23' rx='6' fill='var(--color-accent)' />
   <path
    d='M6 17L9.5 7H11.5L14 13.2L16.5 7H18.5L22 17H19.8L17.5 10.8L15 17H13L10.5 10.8L8.2 17H6Z'
    fill='white'
   />
  </svg>
 );
}

function ErrorShell({
 code,
 title,
 message,
}: {
 code: string;
 title: string;
 message: string;
}) {
 return (
  <main
   id='main-content'
   className='min-h-screen flex flex-col items-center justify-center px-6 text-center'
   style={{ background: 'var(--color-page)' }}
  >
   <Link to='/' className='flex items-center gap-2 mb-10'>
    <WyzerMark />
    <span
     className='text-[15px] font-semibold tracking-[-0.01em]'
     style={{ color: 'var(--color-ink)' }}
    >
     wyzer
    </span>
   </Link>
   <p
    className='font-mono text-[13px] mb-3'
    style={{ color: 'var(--color-accent-ink)' }}
   >
    {code}
   </p>
   <h1
    className='text-display-3 balance mb-3'
    style={{ color: 'var(--color-ink)' }}
   >
    {title}
   </h1>
   <p
    className='text-[15px] leading-[1.6] max-w-[440px] mb-8'
    style={{ color: 'var(--color-muted)' }}
   >
    {message}
   </p>
   <div className='flex flex-wrap items-center justify-center gap-3'>
    <Link
     to='/'
     className='h-10 px-5 inline-flex items-center text-[14px] font-medium rounded-[10px] text-white'
     style={{ backgroundColor: 'var(--color-accent)' }}
    >
     Back to home
    </Link>
    <Link
     to='/check'
     className='h-10 px-5 inline-flex items-center text-[14px] rounded-[10px] border'
     style={{ color: 'var(--color-ink)', borderColor: 'var(--color-border)' }}
    >
     Try the free check
    </Link>
   </div>
  </main>
 );
}

export function NotFoundPage() {
 return (
  <>
   <Seo title='Page not found' noindex />
   <ErrorShell
    code='404'
    title='Page not found'
    message="The page you're looking for doesn't exist or has moved."
   />
  </>
 );
}

export function RouteErrorPage() {
 const error = useRouteError();
 const notFound = isRouteErrorResponse(error) && error.status === 404;
 if (notFound) return <NotFoundPage />;
 return (
  <>
   <Seo title='Something went wrong' noindex />
   <ErrorShell
    code='error'
    title='Something went wrong'
    message='An unexpected error occurred. Try again, or head back to the homepage.'
   />
  </>
 );
}
