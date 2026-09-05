/**
 * Consent-gated Google Analytics 4 for the SPA.
 *
 * GA does not load until the visitor accepts. Analytics is only active when
 * VITE_GA_ID is configured, so nothing tracks (and no banner shows) unless a
 * measurement ID is provided at build time. Consent is stored in localStorage
 * under `wyzer-consent` (shared key with the Navigator).
 */

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const DEBUG = import.meta.env.VITE_ANALYTICS_DEBUG === 'true';
const CONSENT_KEY = 'wyzer-consent';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

export type ConsentValue = 'granted' | 'denied';

let gaLoaded = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function analyticsConfigured(): boolean {
  return Boolean(GA_ID);
}

export function getConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function setConsent(v: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* ignore */
  }
}

function isLocal(): boolean {
  return LOCAL_HOSTS.includes(location.hostname);
}

function loadGA() {
  if (gaLoaded || !GA_ID) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.gtag('js', new Date());
  // We send page_view manually on every route change (SPA), so disable the
  // automatic one to avoid double counting.
  window.gtag('config', GA_ID, { send_page_view: false });
}

/** Record a page view for the current route (no-op unless consent granted). */
export function trackPageview(path: string) {
  if (!GA_ID || getConsent() !== 'granted') return;
  loadGA();
  if (DEBUG) console.log('[analytics] page_view', path);
  if (isLocal()) return;
  window.gtag?.('event', 'page_view', {
    page_path: path,
    page_location: location.href,
    page_title: document.title,
  });
}

/** A custom event (no-op unless consent granted). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_ID || getConsent() !== 'granted') return;
  loadGA();
  if (DEBUG) console.log('[analytics]', name, params ?? {});
  if (isLocal()) return;
  window.gtag?.('event', name, params ?? {});
}

export function grantConsent() {
  setConsent('granted');
  loadGA();
  trackPageview(location.pathname + location.search);
}

export function denyConsent() {
  setConsent('denied');
}

/** Reopen the consent banner (e.g. from a "Cookie settings" link). */
export function openConsentBanner() {
  window.dispatchEvent(new CustomEvent('wyzer:consent-open'));
}
