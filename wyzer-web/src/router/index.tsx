import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RootLayout } from '../components/layout/RootLayout';
import { NotFoundPage, RouteErrorPage } from '@pages/error';
import { Seo } from '@components/Seo';
import HomePage from '@pages/home';
import LoginPage from '@pages/auth/login';
import RegisterPage from '@pages/auth/register';
import VerifyEmailPage from '@pages/auth/verify-email';
import VerifyPage from '@pages/auth/verify';
import DashboardPage from '@pages/dashboard';
import PrivacyPage from '@pages/privacy';
import TermsPage from '@pages/terms';
import CookiesPage from '@pages/cookies';
import StacksPage from '@pages/stacks';
import NewStackPage from '@pages/stacks/new';
import StackDetailPage from '@pages/stacks/detail';
import ReportsListPage from '@pages/reports';
import ReportPage from '@pages/reports/detail';
import SharedReportPage from '@pages/share';
import AcceptInvitePage from '@pages/invitations/accept';
import PricingPage from '@pages/pricing';
import SettingsPage from '@pages/settings';
import BillingPage from '@pages/billing';
import TeamsPage from '@pages/teams';
import ProfilePage from '@pages/profile';
import CheckPage from '@pages/check';
import GuestReportResultPage from '@pages/check/result';

type SeoProps = Parameters<typeof Seo>[0];
/** Prefix a route element with page-level SEO tags (rendered into <head>). */
const withSeo = (node: React.ReactNode, seo: SeoProps) => (
 <>
  <Seo {...seo} />
  {node}
 </>
);

export const router = createBrowserRouter([
 {
  element: <RootLayout />,
  errorElement: <RouteErrorPage />,
  children: [
   // ── Public routes ─────────────────────────────────────────────────────────
   { path: '/', element: <HomePage /> },
   {
    path: '/login',
    element: withSeo(<LoginPage />, {
     title: 'Sign in',
     path: '/login',
     noindex: true,
  }),
 },
 {
  path: '/register',
  element: withSeo(<RegisterPage />, {
   title: 'Create your account',
   path: '/register',
   noindex: true,
  }),
 },
 {
  path: '/auth/verify-email',
  element: withSeo(<VerifyEmailPage />, { title: 'Verify email', noindex: true }),
 },
 {
  path: '/auth/verify',
  element: withSeo(<VerifyPage />, { title: 'Verify email', noindex: true }),
 },
 { path: '/privacy', element: <PrivacyPage /> },
 { path: '/terms', element: <TermsPage /> },
 { path: '/cookies', element: <CookiesPage /> },
 {
  path: '/pricing',
  element: withSeo(<PricingPage />, {
   title: 'Pricing',
   path: '/pricing',
   description:
    'Simple, transparent pricing. Score one stack free forever, upgrade when your team grows.',
  }),
 },
 // T-042 — public shareable report (no sidebar)
 {
  path: '/share/:token',
  element: withSeo(<SharedReportPage />, {
   title: 'Shared compliance report',
   noindex: true,
  }),
 },
 // T-043 — accept org invite via email link (no sidebar)
 {
  path: '/invitations/accept',
  element: withSeo(<AcceptInvitePage />, {
   title: 'Accept invitation',
   noindex: true,
  }),
 },
 // T-050 — free public stack check (guest flow, no auth)
 {
  path: '/check',
  element: withSeo(<CheckPage />, {
   title: 'Free compliance check',
   path: '/check',
   description:
    'Describe your stack and get a free plain-language compliance score in seconds. No signup required.',
  }),
 },
 {
  path: '/check/:token',
  element: withSeo(<GuestReportResultPage />, {
   title: 'Your compliance report',
   noindex: true,
  }),
 },

  // ── Authenticated app (sidebar layout) ────────────────────────────────────
  {
   element: <DashboardLayout />,
   children: [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/stacks', element: <StacksPage /> },
    { path: '/stacks/new', element: <NewStackPage /> },
    { path: '/stacks/:id', element: <StackDetailPage /> },
    { path: '/reports', element: <ReportsListPage /> },
    { path: '/reports/:id', element: <ReportPage /> },
    { path: '/settings', element: <SettingsPage /> },
    { path: '/billing', element: <BillingPage /> },
    { path: '/teams', element: <TeamsPage /> },
    { path: '/profile', element: <ProfilePage /> },
   ],
  },

  // ── 404 ────────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
  ],
 },
]);
