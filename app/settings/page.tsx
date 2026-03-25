'use client';

import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to feed
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Settings</h1>
            <p className="text-xs text-slate-400 font-medium">Coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <p className="text-slate-400 text-sm">Account settings will be available here soon.</p>
        </div>
      </div>
    </div>
  );
}
