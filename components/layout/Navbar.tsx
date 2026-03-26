'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  PlusCircle,
  Menu,
  X,
  Compass,
  Building2,
  Home,
  Castle,
  Briefcase,
  Map,
  KeyRound,
  HardHat,
  LayoutGrid,
  User,
  Settings,
  LogOut,
  Shield,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

const categories: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'all',         label: 'All',          Icon: LayoutGrid },
  { id: 'apartment',   label: 'Apartments',   Icon: Building2 },
  { id: 'house',       label: 'Houses',       Icon: Home },
  { id: 'villa',       label: 'Villas',       Icon: Castle },
  { id: 'commercial',  label: 'Commercial',   Icon: Briefcase },
  { id: 'land',        label: 'Land',         Icon: Map },
  { id: 'rental',      label: 'Rentals',      Icon: KeyRound },
  { id: 'preconstruction', label: 'Pre-construction', Icon: HardHat },
];

interface NavbarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function Navbar({ activeCategory = 'all', onCategoryChange }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Auth state
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<{ username: string; avatar: string | null } | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = authUser?.email && adminEmail && authUser.email === adminEmail;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setAuthUser({ id: data.user.id, email: data.user.email ?? '' });
      const { data: userData } = await supabase
        .from('users')
        .select('username, avatar')
        .eq('id', data.user.id)
        .maybeSingle();
      if (userData) setProfile(userData);
    });
  }, [supabase]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarOpen) return;
    function handler(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [avatarOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    setAvatarOpen(false);
    router.push('/');
    router.refresh();
  }

  const avatarUrl = profile?.avatar || (authUser ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username ?? 'U')}&background=0ea5e9&color=fff&size=80` : null);

  return (
    <header className="sticky top-0 z-50 bg-white/96 backdrop-blur-md border-b border-slate-100 shadow-sm shadow-slate-100/60">

      {/* Main nav row */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          <Logo className="flex-shrink-0" />

          {/* Search */}
          <div className="flex-1 max-w-sm mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchValue.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                  }
                }}
                placeholder="Destinations, hotels, restaurants..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Desktop right nav */}
          <nav className="hidden sm:flex items-center gap-1 ml-auto">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#2D9B4E] hover:bg-[#258442] rounded-full transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>

            {authUser ? (
              <>
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#2D9B4E] hover:bg-[#258442] text-white rounded-full text-sm font-semibold transition-all shadow-sm ml-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post
                </Link>

                {/* Avatar dropdown */}
                <div ref={avatarRef} className="relative ml-2">
                  <button
                    onClick={() => setAvatarOpen((v) => !v)}
                    className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-100 hover:ring-sky-200 transition-all"
                  >
                    <img
                      src={avatarUrl!}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {avatarOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
                      <Link
                        href={`/profile/${profile?.username ?? ''}`}
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setAvatarOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-violet-500" />
                          Admin
                        </Link>
                      )}
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors ml-1"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border"
                  style={{ backgroundColor: 'transparent', borderColor: '#C8102E', color: '#000000' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C8102E'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000000'; }}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Enter Code
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden ml-auto p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Category filter row */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto scrollbar-hide">
            {categories.map(({ id, label, Icon }) => {
              const active = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => onCategoryChange?.(id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          <Link
            href="/explore"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Compass className="w-4 h-4 text-sky-500" />
            Explore
          </Link>

          {authUser ? (
            <>
              <Link
                href="/create"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PlusCircle className="w-4 h-4 text-sky-500" />
                Create Post
              </Link>
              <Link
                href={`/profile/${profile?.username ?? ''}`}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4 text-sky-500" />
                My Profile
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 text-violet-500" />
                  Admin
                </Link>
              )}
              <hr className="border-slate-100 my-2" />
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Ticket className="w-4 h-4" style={{ color: '#C8102E' }} />
                <span style={{ color: '#000000' }}>Enter Code</span>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
