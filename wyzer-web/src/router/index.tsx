import { createBrowserRouter } from 'react-router-dom';
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
import ReportPage from '@pages/reports/detail';
import SharedReportPage from '@pages/share';
import AcceptInvitePage from '@pages/invitations/accept';
import PricingPage from '@pages/pricing';
import SettingsPage from '@pages/settings';

export const router = createBrowserRouter([
 {
  path: '/',
  element: <HomePage />,
 },
 {
  path: '/login',
  element: <LoginPage />,
 },
 {
  path: '/register',
  element: <RegisterPage />,
 },
 // T-018 — post-registration "check your email" page
 {
  path: '/auth/verify-email',
  element: <VerifyEmailPage />,
 },
 // T-019 — email verification link handler (called with ?token=)
 {
  path: '/auth/verify',
  element: <VerifyPage />,
 },
 {
  path: '/dashboard',
  element: <DashboardPage />,
 },
 {
  path: '/privacy',
  element: <PrivacyPage />,
 },
 {
  path: '/terms',
  element: <TermsPage />,
 },
 {
  path: '/cookies',
  element: <CookiesPage />,
 },
 // T-037 — stack builder
 {
  path: '/stacks',
  element: <StacksPage />,
 },
 {
  path: '/stacks/new',
  element: <NewStackPage />,
 },
 {
  path: '/stacks/:id',
  element: <StackDetailPage />,
 },
 // T-038 — compliance report view
 {
  path: '/reports/:id',
  element: <ReportPage />,
 },
 // T-042 — public shareable report
 {
  path: '/share/:token',
  element: <SharedReportPage />,
 },
 // T-043 — accept org invite via email link
 {
  path: '/invitations/accept',
  element: <AcceptInvitePage />,
 },
 // T-055 — pricing page
 {
  path: '/pricing',
  element: <PricingPage />,
 },
 // T-056 — org settings
 {
  path: '/settings',
  element: <SettingsPage />,
 },
]);
