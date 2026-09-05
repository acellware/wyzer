import { LegalLayout } from '@components/legal/LegalLayout';

export default function PrivacyPage() {
 return (
  <LegalLayout
   kicker='legal'
   title='Privacy Policy'
   lastUpdated='1 January 2026'
   path='/privacy'
   description='How Wyzer collects, uses, and protects your personal data.'
  >
   <h2>Introduction</h2>
   <p>
    Wyzer (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates
    the Wyzer compliance intelligence platform. This Privacy Policy explains how
    we collect, use, and protect your personal data when you use our services.
   </p>

   <h2>Information we collect</h2>
   <p>We collect information you provide directly, including:</p>
   <ul>
    <li>Account registration data (name, email address, password hash)</li>
    <li>Infrastructure stack descriptions you enter into Wyzer</li>
    <li>Compliance reports generated during your session</li>
    <li>Payment information processed securely via our payment provider</li>
   </ul>
   <p>
    We also collect usage data automatically, such as browser type, IP address
    (anonymised after processing), pages visited, and feature interactions, to
    improve the service.
   </p>

   <h2>How we use your information</h2>
   <p>
    We use your data to provide, operate, and improve Wyzer; to send you
    transactional emails (account confirmation, invoices); and to comply with
    our legal obligations. We do not sell your personal data to third parties.
   </p>

   <h2>Data retention</h2>
   <p>
    We retain your account data for as long as your account is active. You may
    request deletion at any time by emailing{' '}
    <a href='mailto:privacy@wyzer.io'>privacy@wyzer.io</a>. Stack data and
    compliance reports are removed within 30 days of account deletion.
   </p>

   <h2>Your rights</h2>
   <p>
    Depending on your jurisdiction you may have the right to access, correct,
    port, or erase your personal data. To exercise any of these rights, contact
    us at <a href='mailto:privacy@wyzer.io'>privacy@wyzer.io</a>.
   </p>

   <h2>Cookies</h2>
   <p>
    We use strictly necessary cookies to keep you signed in and to remember your
    theme preference. See our <a href='/cookies'>Cookie Policy</a> for full
    details.
   </p>

   <h2>Third-party services</h2>
   <p>
    Wyzer uses the following sub-processors: Fly.io (hosting), Resend
    (transactional email), and Stripe (payments). Each sub-processor is bound by
    a data processing agreement.
   </p>

   <h2>Changes to this policy</h2>
   <p>
    We will announce material changes via in-app notice and update the
    &ldquo;Last updated&rdquo; date above. Continued use after the effective
    date constitutes acceptance.
   </p>

   <h2>Contact</h2>
   <p>
    Questions? Email <a href='mailto:privacy@wyzer.io'>privacy@wyzer.io</a> or
    write to Wyzer, c/o Legal, [Address].
   </p>
  </LegalLayout>
 );
}
