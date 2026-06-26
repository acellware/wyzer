import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
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

export const router = createBrowserRouter([
 // ── Public routes ──────────────────────────────────────────────────────────
 { path: '/', element: <HomePage /> },
 { path: '/login', element: <LoginPage /> },
 { path: '/register', element: <RegisterPage /> },
 { path: '/auth/verify-email', element: <VerifyEmailPage /> },
 { path: '/auth/verify', element: <VerifyPage /> },
 { path: '/privacy', element: <PrivacyPage /> },
 { path: '/terms', element: <TermsPage /> },
 { path: '/cookies', element: <CookiesPage /> },
 { path: '/pricing', element: <PricingPage /> },
 // T-042 — public shareable report (no sidebar)
 { path: '/share/:token', element: <SharedReportPage /> },
 // T-043 — accept org invite via email link (no sidebar)
 { path: '/invitations/accept', element: <AcceptInvitePage /> },
 // T-050 — free public stack check (guest flow, no auth)
 { path: '/check', element: <CheckPage /> },
 { path: '/check/:token', element: <GuestReportResultPage /> },

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
]);
