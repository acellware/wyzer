/**
 * Canonical site metadata for SEO. The production origin can be overridden at
 * build time with VITE_SITE_URL (e.g. a preview deployment).
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? 'https://wyzer.acellhq.com'
).replace(/\/$/, '');

export const SITE_NAME = 'Wyzer';

export const DEFAULT_TITLE = 'Wyzer · Compliance intelligence for your stack';

export const DEFAULT_DESCRIPTION =
  'Wyzer scores your infrastructure stack against SOC 2, ISO 27001, GDPR, PCI DSS, HIPAA, and NDPR in seconds, with plain-language fixes.';

export const OG_IMAGE = '/og.png';

/** The educational, interactive companion product. */
export const NAVIGATOR_URL =
  import.meta.env.VITE_NAVIGATOR_URL ?? 'https://wyzernavigator.acellhq.com';

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
