'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

function VerifyResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const supabase = createClient();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    // Step 1: Verify OTP to establish session
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'magiclink',
    });

    if (verifyError) {
      if (verifyError.message.includes('expired') || verifyError.message.includes('Token')) {
        setError('Code expired or invalid. Please request a new one.');
      } else {
        setError(verifyError.message);
      }
      setLoading(false);
      return;
    }

    // Step 2: Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Success — go to home feed logged in
    router.push('/');
    router.refresh();
  }

  if (!email) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <p className="text-slate-500 text-sm mb-6">No email provided. Please start the reset process again.</p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-sky-100"
        >
          Go to forgot password
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Enter code</h1>
      <p className="text-slate-500 text-sm mb-8">
        We sent a 6-digit code to{' '}
        <span className="font-semibold text-slate-700">{email}</span>.
        Enter it below with your new password.
      </p>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OTP Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="code">
            Verification Code
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="input pl-10 text-center tracking-[0.3em] text-lg font-mono"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              className="input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="input pl-10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-sky-100 disabled:opacity-60 mt-1"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        <Link href="/auth/forgot-password" className="text-sky-600 font-bold hover:text-sky-800 transition-colors">
          Request a new code
        </Link>
      </p>
    </div>
  );
}

export default function VerifyResetPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <Suspense fallback={null}>
        <VerifyResetForm />
      </Suspense>
    </div>
  );
}
