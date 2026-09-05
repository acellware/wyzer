import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ConsentBanner } from '../ConsentBanner';
import { trackPageview } from '../../lib/analytics';

/**
 * App-wide shell mounted above every route: records SPA page views on
 * navigation (consent-gated) and hosts the cookie consent banner.
 */
export function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    // Defer briefly so react-helmet-async has flushed the new document.title.
    const id = window.setTimeout(() => trackPageview(path), 60);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return (
    <>
      <Outlet />
      <ConsentBanner />
    </>
  );
}
