'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const initRan = useRef(false);

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Prevent double-run in React StrictMode (tokens are single-use)
    if (initRan.current) return;
    initRan.current = true;

    async function initSession() {
      // Read all possible token sources before clearing the URL
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type');
      const code = url.searchParams.get('code');

      const hash = window.location.hash.substring(1);
      const hashParams = hash ? new URLSearchParams(hash) : null;
      const accessToken = hashParams?.get('access_token');
      const refreshToken = hashParams?.get('refresh_token');

      // Clean URL (remove tokens from address bar)
      if (tokenHash || code || hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Flow 1: token_hash + type (Supabase PKCE / email OTP)
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'recovery',
        });
        if (error) {
          console.error('[reset-password] verifyOtp error:', error.message);
          setSessionError('This reset link has expired or already been used. Please request a new one.');
          return;
        }
        setSessionReady(true);
        return;
      }

      // Flow 2: code exchange (PKCE via callback redirect)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('[reset-password] code exchange error:', error.message);
          setSessionError('This reset link has expired or already been used. Please request a new one.');
          return;
        }
        setSessionReady(true);
        return;
      }

      // Flow 3: hash fragment tokens (implicit flow)
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error('[reset-password] setSession error:', error.message);
          setSessionError('This reset link has expired or already been used. Please request a new one.');
          return;
        }
        setSessionReady(true);
        return;
      }

      // Flow 4: session already exists (user navigated here after callback)
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setSessionReady(true);
        return;
      }

      setSessionError('No valid reset link found. Please request a new password reset.');
    }

    initSession();
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  }

  // ── Success ──
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Password updated</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Your password has been reset successfully. Redirecting you to sign in…
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-sky-100"
          >
            Sign in now
          </Link>
        </div>
      </div>
    );
  }

  // ── Session error (expired/invalid link) ──
  if (sessionError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Link expired</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">{sessionError}</p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-sky-100"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading session ──
  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    );
  }

  // ── Password form ──
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Set new password</h1>
        <p className="text-slate-500 text-sm mb-8">
          Enter your new password below.
        </p>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/auth/login" className="text-sky-600 font-bold hover:text-sky-800 transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
