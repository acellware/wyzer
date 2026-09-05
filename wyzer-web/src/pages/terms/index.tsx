import { LegalLayout } from '@components/legal/LegalLayout';

export default function TermsPage() {
 return (
  <LegalLayout
   kicker='legal'
   title='Terms of Service'
   lastUpdated='1 January 2026'
   path='/terms'
   description='The terms that govern your use of the Wyzer platform.'
  >
   <h2>Acceptance</h2>
   <p>
    By accessing or using Wyzer you agree to these Terms of Service
    (&ldquo;Terms&rdquo;). If you do not agree, do not use the service. These
    Terms constitute a legally binding agreement between you and Wyzer.
   </p>

   <h2>Description of service</h2>
   <p>
    Wyzer is a compliance intelligence platform that analyses infrastructure
    stack descriptions and generates scored compliance reports against
    frameworks including SOC 2, ISO 27001, GDPR, PCI-DSS, HIPAA, and NDPR.
    Reports are provided for informational purposes and do not constitute legal
    or audit advice.
   </p>

   <h2>Account registration</h2>
   <p>
    You must register an account to access most features. You are responsible
    for maintaining the confidentiality of your credentials and for all activity
    under your account. You must be at least 18 years old and authorised to bind
    the organisation you represent.
   </p>

   <h2>Acceptable use</h2>
   <p>You must not use Wyzer to:</p>
   <ul>
    <li>Violate any applicable law or regulation</li>
    <li>
     Transmit malware or engage in attempts to compromise Wyzer's infrastructure
    </li>
    <li>
     Resell or redistribute the service without our express written permission
    </li>
    <li>
     Scrape or extract data through automated means beyond normal API usage
    </li>
   </ul>

   <h2>Intellectual property</h2>
   <p>
    All content, trademarks, and software comprising Wyzer, except the Wyzer
    Open Spec (which is Apache 2.0 licensed), are owned by or licensed to Wyzer.
    You receive a limited, non-exclusive licence to use the service for your
    internal business purposes.
   </p>

   <h2>Disclaimer of warranties</h2>
   <p>
    Wyzer is provided &ldquo;as is&rdquo;. We make no warranty that compliance
    reports are complete, accurate, or sufficient to pass any audit. You should
    engage a qualified professional for formal compliance assessments.
   </p>

   <h2>Limitation of liability</h2>
   <p>
    To the maximum extent permitted by law, Wyzer's total liability for claims
    arising from these Terms shall not exceed the fees you paid in the twelve
    months preceding the claim.
   </p>

   <h2>Termination</h2>
   <p>
    Either party may terminate the agreement at any time. We may suspend or
    terminate your account immediately for material breach of these Terms.
   </p>

   <h2>Governing law</h2>
   <p>
    These Terms are governed by the laws of England and Wales. Disputes shall be
    subject to the exclusive jurisdiction of the courts of England and Wales.
   </p>

   <h2>Contact</h2>
   <p>
    Questions about these Terms? Email{' '}
    <a href='mailto:legal@wyzer.io'>legal@wyzer.io</a>.
   </p>
  </LegalLayout>
 );
}
