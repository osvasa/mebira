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
                By accessing or using Mebira (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. Mebira reserves the right to update these terms at any time, and continued use of the Platform after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">2. Description of Service</h2>
              <p>
                Mebira is a travel recommendation platform that allows users to share travel experiences, discover destinations, and earn commissions through affiliate partnerships with booking platforms including Expedia. The Platform connects travelers with accommodation, dining, and destination recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">3. User Accounts</h2>
              <p className="mb-2">To post content or earn commissions, you must create an account. You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate and truthful information during registration</li>
                <li>Keep your login credentials secure and not share them with others</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be at least 18 years of age to create an account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">4. Content Guidelines</h2>
              <p className="mb-2">Users are responsible for all content they post. You agree not to post content that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Is false, misleading, or fraudulent</li>
                <li>Infringes on the intellectual property rights of others</li>
                <li>Contains spam, unsolicited promotions, or malicious code</li>
                <li>Is offensive, defamatory, or violates applicable laws</li>
                <li>Misrepresents affiliate relationships or commission structures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">5. Affiliate Links and Commissions</h2>
              <p>
                Mebira participates in affiliate programs with third-party booking platforms. When users make bookings through links on Mebira, we and/or the content creator may earn a commission at no additional cost to the buyer. All affiliate relationships are disclosed with &ldquo;Affiliate link&rdquo; or similar labeling. Commission amounts and payment terms are subject to change and are governed by the terms of each affiliate program.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
              <p>
                You retain ownership of content you post on Mebira. By posting content, you grant Mebira a non-exclusive, royalty-free, worldwide license to display, distribute, and promote your content on the Platform and in marketing materials. Mebira&apos;s branding, design, and original content remain the property of Mebira.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">7. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. Mebira does not guarantee the accuracy of travel recommendations, pricing information, or availability of third-party services. We are not responsible for the quality or safety of any accommodations, restaurants, or destinations featured on the Platform.
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
                We reserve the right to suspend or terminate accounts that violate these Terms of Service, engage in fraudulent activity, or misuse the affiliate commission system. You may close your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-3">10. Contact</h2>
              <p>
                For questions about these Terms, please contact us at{' '}
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
