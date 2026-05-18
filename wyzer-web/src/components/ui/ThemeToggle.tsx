import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'wyzer-theme';

function readInitial(): Theme {
 if (typeof window === 'undefined') return 'light';
 const saved = window.localStorage.getItem(STORAGE_KEY);
 if (saved === 'light' || saved === 'dark') return saved;
 return 'light';
}

export function ThemeToggle() {
 const [theme, setTheme] = useState<Theme>(readInitial);

 useEffect(() => {
  const root = document.documentElement;
  if (theme === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
  window.localStorage.setItem(STORAGE_KEY, theme);
 }, [theme]);

 const next = theme === 'light' ? 'dark' : 'light';

 return (
  <button
   type='button'
   onClick={() => setTheme(next)}
   aria-label={`Switch to ${next} mode`}
   className='relative h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors'
   style={{
    color: 'var(--color-muted)',
   }}
   onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-ink)';
    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
     'var(--color-surface)';
   }}
   onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
     'transparent';
   }}
  >
   <Sun
    size={15}
    className={`absolute transition-all duration-200 ${
     theme === 'light'
      ? 'opacity-100 scale-100'
      : 'opacity-0 scale-75 -rotate-45'
    }`}
   />
   <Moon
    size={15}
    className={`absolute transition-all duration-200 ${
     theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-75 rotate-45'
    }`}
   />
  </button>
 );
}
