import { useEffect, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from './Button';

export type ConfirmVariant = 'default' | 'danger' | 'warn';

export interface ConfirmOptions {
 title: string;
 message?: string;
 confirmLabel?: string;
 cancelLabel?: string;
 variant?: ConfirmVariant;
}

interface InternalState extends ConfirmOptions {
 open: boolean;
 resolve: ((v: boolean) => void) | null;
}

const initial: InternalState = {
 open: false,
 title: '',
 resolve: null,
};

let state: InternalState = initial;
const listeners = new Set<() => void>();

function setState(next: InternalState) {
 state = next;
 listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
 listeners.add(l);
 return () => {
  listeners.delete(l);
 };
}

/** Show a confirmation modal and resolve to true/false based on user choice.
 *  Drop-in replacement for `window.confirm` with a styled UI. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
 // If a previous confirm is still open, auto-cancel it
 if (state.resolve) state.resolve(false);
 return new Promise<boolean>((resolve) => {
  setState({ ...options, open: true, resolve });
 });
}

function close(result: boolean) {
 const r = state.resolve;
 setState({ ...state, open: false, resolve: null });
 if (r) r(result);
}

/** Mount once at the app root. Subscribes to the confirm store and renders the modal. */
export function ConfirmHost() {
 const [, force] = useState(0);
 useEffect(() => subscribe(() => force((n) => n + 1)), []);

 useEffect(() => {
  if (!state.open) return;
  function onKey(e: KeyboardEvent) {
   if (e.key === 'Escape') close(false);
   if (e.key === 'Enter') close(true);
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
 });

 if (!state.open) return null;

 const variant: ConfirmVariant = state.variant ?? 'default';
 const Icon = variant === 'danger' || variant === 'warn' ? AlertTriangle : Info;
 const iconTone =
  variant === 'danger'
   ? 'text-danger bg-danger/10'
   : variant === 'warn'
     ? 'text-warn bg-warn/10'
     : 'text-brand bg-brand/10';
 const confirmVariant = variant === 'danger' ? 'primary' : 'primary';
 const confirmClass =
  variant === 'danger' ? '!bg-danger hover:!bg-danger/90 !shadow-none' : '';

 return (
  <div
   className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-sm animate-in fade-in'
   onClick={() => close(false)}
  >
   <div
    role='dialog'
    aria-modal='true'
    aria-labelledby='confirm-title'
    className='w-full max-w-md rounded-2xl bg-surface border border-line shadow-xl p-5 animate-in zoom-in-95'
    onClick={(e) => e.stopPropagation()}
   >
    <div className='flex items-start gap-3'>
     <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconTone}`}
     >
      <Icon size={18} />
     </div>
     <div className='flex-1 min-w-0'>
      <h3 id='confirm-title' className='text-sm font-semibold text-ink-primary'>
       {state.title}
      </h3>
      {state.message && (
       <p className='text-sm text-ink-secondary mt-1 whitespace-pre-line'>
        {state.message}
       </p>
      )}
     </div>
    </div>

    <div className='flex items-center justify-end gap-2 mt-5'>
     <Button variant='ghost' size='sm' onClick={() => close(false)}>
      {state.cancelLabel ?? 'Cancel'}
     </Button>
     <Button
      variant={confirmVariant}
      size='sm'
      className={confirmClass}
      onClick={() => close(true)}
     >
      {state.confirmLabel ?? 'Confirm'}
     </Button>
    </div>
   </div>
  </div>
 );
}
