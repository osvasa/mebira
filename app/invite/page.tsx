'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Send, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Target, DollarSign, Globe } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

const CONTENT_TYPES = [
  { value: 'hotels', label: 'Hotels' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'destinations', label: 'Destinations' },
  { value: 'flights', label: 'Flights' },
  { value: 'activities', label: 'Activities' },
  { value: 'cruises', label: 'Cruises' },
  { value: 'travel', label: 'Travel (General)' },
];

export default function InvitePage() {
  const [fullName, setFullName] = useState('');
  const [tiktokProfile, setTiktokProfile] = useState('');
  const [contentType, setContentType] = useState('travel');
  const [travelStyle, setTravelStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; tiktokProfile?: string }>({});

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const errors: { fullName?: string; tiktokProfile?: string } = {};
    if (!fullName.trim()) errors.fullName = 'This field is required';
    if (!tiktokProfile.trim()) errors.tiktokProfile = 'This field is required';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('invite_requests')
        .insert({
          full_name: fullName.trim(),
          tiktok_profile: tiktokProfile.trim(),
          content_type: contentType,
          travel_style: travelStyle.trim() || null,
          status: 'pending',
        });

      if (insertError) {
        setError('Failed to submit request. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Request submitted!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            We&apos;ll review your profile and if selected, you&apos;ll receive your personal invite code via TikTok DM.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-sky-100"
          >
            Back to Mebira
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left hero */}
      <div className="hidden lg:flex relative w-[45%] flex-col">
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=85"
          alt="Travel creator"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/80 via-sky-800/50 to-transparent" />
        <div className="relative flex flex-col justify-between h-full p-12">
          <Logo />
          <div className="space-y-6">
            <h2 className="text-white text-3xl font-extrabold leading-tight drop-shadow">
              Join the world&apos;s most exclusive travel creator community
            </h2>
            <div className="space-y-4">
              {[
                { Icon: Target, text: 'Quality over quantity — every creator is hand-selected' },
                { Icon: DollarSign, text: 'Earn real commissions from your travel recommendations' },
                { Icon: Globe, text: 'Connect with a curated community of travel creators' },
              ].map((item) => (
                <div key={item.text} className="flex gap-3">
                  <item.Icon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-sky-100 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-[#C8102E] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Request an Invite</h1>
          </div>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Mebira is an invite-only platform for quality travel creators. Tell us about yourself and we&apos;ll review your profile.
          </p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setFieldErrors((prev) => ({ ...prev, fullName: undefined })); }}
                placeholder="Jane Smith"
                className={`input${fieldErrors.fullName ? ' !border-red-400' : ''}`}
              />
              {fieldErrors.fullName && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">TikTok Profile URL</label>
              <input
                type="url"
                value={tiktokProfile}
                onChange={(e) => { setTiktokProfile(e.target.value); setFieldErrors((prev) => ({ ...prev, tiktokProfile: undefined })); }}
                placeholder="https://www.tiktok.com/@yourhandle"
                className={`input${fieldErrors.tiktokProfile ? ' !border-red-400' : ''}`}
              />
              {fieldErrors.tiktokProfile ? <p className="text-[11px] text-red-500 mt-1">{fieldErrors.tiktokProfile}</p> : <p className="text-[11px] text-slate-400 mt-1">We&apos;ll review your content to ensure quality</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="input bg-white"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Travel Style <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                placeholder="Luxury hotels, budget backpacking, food tours, adventure travel..."
                maxLength={300}
                className="input resize-none"
              />
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
              <p className="text-xs text-sky-700 leading-relaxed">
                <Send className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                If selected, you will receive your personal invite code via <strong>TikTok DM</strong>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#C8102E] to-teal-500 hover:from-sky-500 hover:to-teal-600 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-sky-100 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an invite code?{' '}
            <Link href="/auth/signup" className="text-sky-600 font-bold hover:text-sky-800 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
