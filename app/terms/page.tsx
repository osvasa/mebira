import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function TermsPage() {
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
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-400 mb-8">Last updated: February 2026</p>

          <div className="prose prose-slate max-w-none space-y-8 text-sm text-slate-700 leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Mebira (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. We may update these terms at any time, and continued use constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. Description of Service</h2>
              <p>
                Mebira is a real estate listing discovery platform where licensed realtors and property owners can post property listings, and users can browse those listings for informational purposes. Mebira is not a real estate agency, brokerage, or transaction facilitator. We do not buy, sell, rent, or manage properties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. User Accounts</h2>
              <p className="mb-2">To post listings, you must create an account. You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate and truthful information during registration</li>
                <li>Keep your login credentials secure</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be at least 18 years of age</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Listing Accuracy</h2>
              <p>
                Posters are solely responsible for the accuracy, legality, and completeness of their property listings, including pricing, descriptions, images, and availability. Mebira does not verify listings and makes no guarantees about the accuracy of any content posted by users.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Content and Removal</h2>
              <p className="mb-2">We reserve the right to remove any content at our sole discretion, including but not limited to listings that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Are false, misleading, or fraudulent</li>
                <li>Infringe on intellectual property rights</li>
                <li>Contain spam, unsolicited promotions, or malicious content</li>
                <li>Are offensive, defamatory, or violate applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
              <p>
                You retain ownership of content you post. By posting, you grant Mebira a non-exclusive, royalty-free, worldwide license to display and distribute your content on the Platform. Mebira&apos;s branding, design, and original content remain our property.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Disclaimer</h2>
              <p>
                The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. Mebira is not responsible for any content posted by users, including property listings, images, pricing, or availability. Users should independently verify all information before making any decisions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Mebira shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or reliance on any content posted thereon.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">9. Termination</h2>
              <p>
                We may suspend or terminate accounts that violate these Terms. You may close your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">10. Contact</h2>
              <p>
                For questions about these Terms, contact us at{' '}
                <a href="mailto:hello@mebira.pro" className="text-sky-600 hover:underline">hello@mebira.pro</a>.
              </p>
            </section>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          {' · '}
          <Link href="/help" className="hover:text-slate-600">Help Center</Link>
          {' · '}
          <Link href="/" className="hover:text-slate-600">Home</Link>
        </p>
      </main>
    </div>
  );
}
