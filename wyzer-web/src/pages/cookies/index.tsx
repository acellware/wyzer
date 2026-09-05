import { LegalLayout } from '@components/legal/LegalLayout';

export default function CookiesPage() {
 return (
  <LegalLayout
   kicker='legal'
   title='Cookie Policy'
   lastUpdated='1 January 2026'
   path='/cookies'
   description='Which cookies Wyzer uses and how to control them.'
  >
   <h2>What are cookies?</h2>
   <p>
    Cookies are small text files stored on your device by your browser. They
    allow websites to remember information across page loads and sessions.
   </p>

   <h2>How Wyzer uses cookies</h2>
   <p>We use only the following cookies:</p>

   <h3>Strictly necessary cookies</h3>
   <p>
    These cookies are required for the service to function and cannot be
    disabled:
   </p>
   <ul>
    <li>
     <strong>wyzer-session</strong> — Keeps you signed in during your browser
     session. Expires when you close your browser unless you selected
     &ldquo;remember me&rdquo;.
    </li>
    <li>
     <strong>csrf-token</strong> — Protects form submissions against cross-site
     request forgery. Session-scoped.
    </li>
   </ul>

   <h3>Functional cookies</h3>
   <p>
    These cookies remember your preferences. You can clear them at any time via
    your browser settings without losing core functionality:
   </p>
   <ul>
    <li>
     <strong>wyzer-theme</strong> — Stores your light/dark mode preference.
     Stored in <code>localStorage</code>, not a cookie, so it is not transmitted
     to our servers.
    </li>
   </ul>

   <h2>Third-party cookies</h2>
   <p>
    Wyzer does not use third-party advertising or analytics cookies. We do not
    embed social media widgets on the main application that would set
    third-party cookies.
   </p>

   <h2>Managing cookies</h2>
   <p>
    You can disable or delete cookies through your browser settings. Disabling
    strictly necessary cookies will prevent you from signing in to Wyzer.
    Instructions for common browsers:
   </p>
   <ul>
    <li>
     Chrome — Settings › Privacy and security › Cookies and other site data
    </li>
    <li>Safari — Preferences › Privacy › Manage Website Data</li>
    <li>Firefox — Settings › Privacy and Security › Cookies and Site Data</li>
   </ul>

   <h2>Changes to this policy</h2>
   <p>
    If we introduce new cookies we will update this page and, where required by
    law, obtain your consent before setting them.
   </p>

   <h2>Contact</h2>
   <p>
    Questions? Email <a href='mailto:privacy@wyzer.io'>privacy@wyzer.io</a>.
   </p>
  </LegalLayout>
 );
}
