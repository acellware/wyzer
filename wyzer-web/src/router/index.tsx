import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RootLayout } from '../components/layout/RootLayout';
import { NotFoundPage, RouteErrorPage } from '@pages/error';
import { Seo } from '@components/Seo';

// Route components are code-split so the marketing/landing bundle stays small
// (heavy deps like recharts and the whole authed app load only when needed).
const HomePage = lazy(() => import('@pages/home'));
const LoginPage = lazy(() => import('@pages/auth/login'));
const RegisterPage = lazy(() => import('@pages/auth/register'));
const VerifyEmailPage = lazy(() => import('@pages/auth/verify-email'));
const VerifyPage = lazy(() => import('@pages/auth/verify'));
const DashboardPage = lazy(() => import('@pages/dashboard'));
const PrivacyPage = lazy(() => import('@pages/privacy'));
const TermsPage = lazy(() => import('@pages/terms'));
const CookiesPage = lazy(() => import('@pages/cookies'));
const StacksPage = lazy(() => import('@pages/stacks'));
const NewStackPage = lazy(() => import('@pages/stacks/new'));
const StackDetailPage = lazy(() => import('@pages/stacks/detail'));
const ReportsListPage = lazy(() => import('@pages/reports'));
const ReportPage = lazy(() => import('@pages/reports/detail'));
const SharedReportPage = lazy(() => import('@pages/share'));
const AcceptInvitePage = lazy(() => import('@pages/invitations/accept'));
const PricingPage = lazy(() => import('@pages/pricing'));
const SettingsPage = lazy(() => import('@pages/settings'));
const BillingPage = lazy(() => import('@pages/billing'));
const TeamsPage = lazy(() => import('@pages/teams'));
const ProfilePage = lazy(() => import('@pages/profile'));
const CheckPage = lazy(() => import('@pages/check'));
const GuestReportResultPage = lazy(() => import('@pages/check/result'));

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
