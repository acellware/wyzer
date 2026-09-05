import { useEffect, useState } from 'react';
import {
  analyticsConfigured,
  getConsent,
  grantConsent,
  denyConsent,
} from '../lib/analytics';

/**
 * Cookie consent banner. Only renders when analytics is configured
 * (VITE_GA_ID) and the visitor has not yet chosen. Can be reopened via the
 * `wyzer:consent-open` event (see `openConsentBanner`).
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (analyticsConfigured() && !getConsent()) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener('wyzer:consent-open', onOpen);
    return () => window.removeEventListener('wyzer:consent-open', onOpen);
  }, []);

  if (!open) return null;

  return (
    <div
      className='fixed inset-x-0 bottom-0 z-[75] border-t'
      role='region'
      aria-label='Cookie consent'
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.06)',
      }}
    >
      <div className='max-w-[1240px] mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p
          className='text-[13.5px] leading-[1.5] max-w-2xl'
          style={{ color: 'var(--color-body)' }}
        >
          We use Google Analytics to understand, in aggregate, how this site is
          used. No advertising or cross-site tracking. See our{' '}
          <a
            href='/cookies'
            className='underline'
            style={{ color: 'var(--color-accent-ink)' }}
          >
            Cookie Policy
          </a>
          .
        </p>
        <div className='flex gap-2 shrink-0'>
          <button
            type='button'
            onClick={() => {
              denyConsent();
              setOpen(false);
            }}
            className='h-9 px-4 inline-flex items-center text-[13px] rounded-lg border transition-colors'
            style={{ color: 'var(--color-ink)', borderColor: 'var(--color-border)' }}
          >
            Decline
          </button>
          <button
            type='button'
            onClick={() => {
              grantConsent();
              setOpen(false);
            }}
            className='h-9 px-4 inline-flex items-center text-[13px] font-medium rounded-lg text-white transition-colors'
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
