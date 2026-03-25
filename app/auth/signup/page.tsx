'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AtSign, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Ticket, Target, DollarSign, Plane } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function mapError(msg: string): string {
  if (msg.includes('User already registered') || msg.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (msg.includes('Password should be at least'))
    return 'Password must be at least 6 characters.';
  if (msg.includes('Unable to validate email'))
    return 'Please enter a valid email address.';
  if (msg.includes('Too many requests'))
    return 'Too many attempts. Please wait a moment and try again.';
  return msg;
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  // Step: 'code-entry' → 'signup-form'
  const [step, setStep] = useState<'code-entry' | 'signup-form'>('code-entry');

  // Invite code validation
  const [inviteCode, setInviteCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [validCodeId, setValidCodeId] = useState('');

  // Signup form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleValidateCode() {
    setCodeError('');
    const code = inviteCode.trim().toUpperCase();
    if (!code) { setCodeError('Please enter your invite code.'); return; }

    setCodeLoading(true);
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('id, code, creator_name, used')
        .eq('code', code)
        .maybeSingle();

      if (error || !data) {
        setCodeError('Invalid invite code. Please check and try again.');
        setCodeLoading(false);
        return;
      }

      if (data.used) {
        setCodeError('This invite code has already been used.');
        setCodeLoading(false);
        return;
      }

      setCreatorName(data.creator_name);
      setValidCodeId(data.id);
      setStep('signup-form');
    } catch {
      setCodeError('Something went wrong. Please try again.');
    } finally {
      setCodeLoading(false);
    }
  }

  function validate(): string {
    if (!USERNAME_RE.test(username))
      return 'Username must be 3-20 characters: letters, numbers, or underscores only.';
    if (!email.trim())
      return 'Please enter your email.';
    if (password.length < 6)
      return 'Password must be at least 6 characters.';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: creatorName,
          username,
          bio: '',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/setup-profile`,
      },
    });

    if (signUpError) {
      setError(mapError(signUpError.message));
      setLoading(false);
      return;
    }

    // Mark invite code as used
    if (data.user) {
      await supabase
        .from('invite_codes')
        .update({
          used: true,
          used_by_user_id: data.user.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', validCodeId);
    }

    // If session is immediately active (no email confirm), go to setup
    if (data.session) {
      router.push('/setup-profile');
      router.refresh();
      return;
    }

    // Auto-sign in if possible
    if (data.user && !data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError) {
        router.push('/setup-profile');
        router.refresh();
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            We sent a confirmation link to <span className="font-semibold text-slate-700">{email}</span>.
            Click it to activate your account and set up your profile.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-sky-100"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left hero */}
      <div className="hidden lg:flex relative w-[45%] flex-col">
        <img src={HERO_IMAGE} alt="Tokyo at night" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/75 via-sky-800/50 to-transparent" />
        <div className="relative flex flex-col justify-between h-full p-12">
          <Logo />
          <div className="space-y-7">
            {[
              { Icon: Target, title: 'Invite-only platform', desc: 'Every creator is hand-selected for quality content.' },
              { Icon: DollarSign, title: 'Earn affiliate commissions', desc: 'Get paid when your followers book through your links.' },
              { Icon: Plane, title: 'Join top travel creators', desc: 'Be part of an exclusive community of travel influencers.' },
            ].map((perk) => (
              <div key={perk.title} className="flex gap-4">
                <perk.Icon className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold text-sm">{perk.title}</p>
                  <p className="text-sky-200 text-xs mt-0.5 leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          {/* STEP 1: Enter code */}
          {step === 'code-entry' && (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Enter your invite code</h1>
              <p className="text-slate-500 text-sm mb-6">Paste the code you received via TikTok DM</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Invite Code</label>
                  <div className="relative">
                    <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setCodeError(''); }}
                      placeholder="OSVASA-XXXXXX"
                      className={`input pl-10 font-mono tracking-wider text-center uppercase${codeError ? ' !border-red-400' : ''}`}
                      maxLength={20}
                    />
                  </div>
                  {codeError && <p className="text-[11px] text-red-500 mt-1">{codeError}</p>}
                </div>

                <button
                  onClick={handleValidateCode}
                  disabled={codeLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-sky-100 disabled:opacity-60"
                >
                  {codeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {codeLoading ? 'Validating...' : 'Continue'}
                </button>

                <Link
                  href="/invite"
                  className="block w-full py-2 text-sm text-center transition-colors"
                  style={{ color: '#56C1FF' }}
                >
                  Don&apos;t have a code? Request an invite &rarr;
                </Link>
              </div>
            </>
          )}

          {/* STEP 3: Signup form */}
          {step === 'signup-form' && (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-800">Welcome, {creatorName}!</span>
                </div>
                <p className="text-xs text-emerald-600">We&apos;ve been expecting you. Set up your account below.</p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="jane_travels"
                      maxLength={20}
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Letters, numbers, underscores &middot; 3-20 chars</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
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
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-sky-100 disabled:opacity-60 mt-1"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-slate-600 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-slate-600 hover:underline">Privacy Policy</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
