import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  absoluteUrl,
} from '../lib/site';

interface SeoProps {
  /** Page title. The site name is appended automatically unless `exact`. */
  title?: string;
  description?: string;
  /** Path for canonical + og:url, e.g. "/pricing". Defaults to root. */
  path?: string;
  /** Keep this page out of the index (auth, app, token pages). */
  noindex?: boolean;
  /** Use `title` verbatim instead of appending the site name. */
  exact?: boolean;
  /** Optional JSON-LD structured data. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-route head tags. Constant social tags (og:image, og:type, twitter:card,
 * etc.) live statically in index.html so non-JS crawlers still get a card;
 * this component only manages the values that change per route, so every tag
 * has exactly one source (no duplicates).
 */
export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  noindex = false,
  exact = false,
  jsonLd,
}: SeoProps) {
  const fullTitle = !title
    ? DEFAULT_TITLE
    : exact
      ? title
      : `${title} · ${SITE_NAME}`;
  const canonical = absoluteUrl(path);
  const items = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {items.map((item, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
