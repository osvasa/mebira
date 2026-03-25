import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mb-8">Last updated: February 2026</p>

          <div className="space-y-8 text-sm text-slate-700 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Information We Collect</h2>
              <p className="mb-2">We collect the following types of information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account information:</strong> email address, username, and profile details you provide</li>
                <li><strong>Content:</strong> posts, comments, and media you upload to the Platform</li>
                <li><strong>Usage data:</strong> pages visited, posts liked, clicks on affiliate links, and time spent on the Platform</li>
                <li><strong>Device information:</strong> browser type, operating system, and IP address</li>
                <li><strong>Cookies:</strong> session tokens and preferences stored in your browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide, maintain, and improve the Platform</li>
                <li>To process affiliate commission payments to creators</li>
                <li>To personalize your feed and recommendations</li>
                <li>To send account-related notifications and, with your consent, marketing emails</li>
                <li>To detect and prevent fraud, spam, and abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. Affiliate Tracking</h2>
              <p>
                When you click an affiliate link on Mebira (e.g., a link to Expedia), third-party cookies and tracking parameters may be set to attribute any resulting bookings to Mebira or the creator whose post you clicked. This tracking is how commissions are measured. We do not sell this tracking data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Sharing of Information</h2>
              <p className="mb-2">We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Service providers:</strong> hosting (Vercel), database (Supabase), and analytics services that help us operate the Platform</li>
                <li><strong>Affiliate partners:</strong> anonymized click and booking data as required to track commissions</li>
                <li><strong>Law enforcement:</strong> when required by valid legal process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management. We may also use analytics cookies to understand how the Platform is used. You can disable cookies in your browser settings, though some features may not function correctly without them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as fraud prevention.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Your Rights</h2>
              <p className="mb-2">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict certain processing</li>
                <li>Export your data in a portable format</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact us at{' '}
                <a href="mailto:hello@mebira.pro" className="text-sky-600 hover:underline">hello@mebira.pro</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Security</h2>
              <p>
                We use industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and access controls. However, no system is 100% secure, and we cannot guarantee the absolute security of your information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">9. Children</h2>
              <p>
                Mebira is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us to have it removed.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">10. Contact</h2>
              <p>
                For privacy-related questions or requests, email{' '}
                <a href="mailto:hello@mebira.pro" className="text-sky-600 hover:underline">hello@mebira.pro</a>.
              </p>
            </section>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
          {' · '}
          <Link href="/help" className="hover:text-slate-600">Help Center</Link>
          {' · '}
          <Link href="/" className="hover:text-slate-600">Home</Link>
        </p>
      </main>
    </div>
  );
}
