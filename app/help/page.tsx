import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const faqs = [
  {
    q: 'What is Mebira?',
    a: 'Mebira is a travel recommendation platform where realtors share property listings they love — and connect with buyers interested in their listings.',
  },
  {
    q: 'How do I earn commissions?',
    a: 'Create an account, post property listings with video tours. When someone clicks your link and completes a booking on Expedia, you earn a commission. Commissions are tracked automatically via your unique realtor ID.',
  },
  {
    q: 'How do I sign up?',
    a: 'Click "Sign up free" in the top navigation. You can register with your email and password, or sign in instantly with your Google account. No credit card required.',
  },
  {
    q: 'Is Mebira free to use?',
    a: 'Yes — Mebira is completely free for both users and realtors. We earn a share of affiliate commissions from booking platforms, which allows us to keep the platform free and pay realtors.',
  },
  {
    q: 'How do the Expedia booking links work?',
    a: 'Every "Book on Expedia" button on Mebira includes our affiliate ID. When you click it, you are taken directly to the relevant hotel or destination search on Expedia. The price you pay is the same as going directly to Expedia — no markup.',
  },
  {
    q: 'Can I post any type of travel content?',
    a: 'You can post hotels, restaurants, destinations, and flights. Posts must be genuine recommendations based on real experience or research. Spam, fake reviews, and misleading content are prohibited under our Terms of Service.',
  },
  {
    q: 'How do I report a post?',
    a: 'Click the "..." (three dots) menu on any post card and select "Report post." Our team reviews all reports and takes action within 48 hours.',
  },
  {
    q: 'How do I delete my account?',
    a: 'To delete your account and all associated data, email us at hello@mebira.pro with the subject line "Delete my account." We will process your request within 30 days.',
  },
  {
    q: 'Why is the Vibe Search feature not available?',
    a: 'Our AI-powered Vibe Search feature is temporarily hidden while we improve it. It will be back soon with better results.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email us at hello@mebira.pro. We aim to respond within 24–48 hours.',
  },
];

export default function HelpPage() {
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

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Help Center</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Find answers to common questions about Mebira. Can&apos;t find what you&apos;re looking for?{' '}
            <a href="mailto:hello@mebira.pro" className="text-sky-600 hover:underline font-medium">
              Email us
            </a>.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm group"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none">
                <span className="font-semibold text-slate-900 text-sm">{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5">
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Contact card */}
        <div className="mt-10 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl p-8 text-center text-white shadow-lg shadow-sky-200/60">
          <h2 className="text-xl font-extrabold mb-2">Still need help?</h2>
          <p className="text-sky-100 text-sm mb-5">
            Our team is available Monday–Friday, 9 am–6 pm UTC.
          </p>
          <a
            href="mailto:hello@mebira.pro"
            className="inline-block px-6 py-2.5 bg-white text-sky-600 rounded-full text-sm font-bold hover:bg-sky-50 transition-colors"
          >
            Email hello@mebira.pro
          </a>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
          {' · '}
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          {' · '}
          <Link href="/" className="hover:text-slate-600">Home</Link>
        </p>
      </main>
    </div>
  );
}
