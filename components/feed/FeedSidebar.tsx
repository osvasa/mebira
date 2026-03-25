import Link from 'next/link';
import { TrendingUp, BadgeCheck, Bot } from 'lucide-react';
import { TrendingDestination, User } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { PricePulse } from '@/components/feed/PricePulse';

interface FeedSidebarProps {
  trendingDestinations: TrendingDestination[];
  suggestedUsers: User[];
}

export function FeedSidebar({ trendingDestinations, suggestedUsers }: FeedSidebarProps) {
  return (
    <aside className="space-y-5">

      {/* ── Invite banner ── */}
      <div className="rounded-2xl p-5 text-white shadow-lg" style={{ backgroundColor: '#C8102E' }}>
        <div className="mb-2">
          <h3 className="font-bold text-sm">Discover Properties Around the World</h3>
        </div>
        <p className="text-xs text-white/80 leading-relaxed mb-3.5">
          Explore apartments, villas, and homes shared by real estate professionals.
        </p>
        <Link
          href="/invite"
          className="inline-block px-4 py-2 bg-white rounded-full text-xs font-bold hover:bg-slate-50 transition-colors"
          style={{ color: '#C8102E' }}
        >
          Request an Invite →
        </Link>
      </div>

      {/* ── Hot Listings ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-sky-500" />
          <h3 className="font-bold text-slate-900 text-sm">Hot Listings</h3>
        </div>
        <div className="space-y-3">
          {trendingDestinations.map((dest, idx) => (
            <Link
              key={dest.id}
              href={`/search?q=${encodeURIComponent(dest.name.split(',')[0].trim())}&source=trending`}
              className="flex items-center gap-3 group"
            >
              <span className="text-xs font-bold text-slate-300 w-4 text-center flex-shrink-0">
                {idx + 1}
              </span>
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                  {dest.name}
                </p>
                <p className="text-xs text-slate-400">{formatNumber(dest.postCount)} posts</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Suggested Creators ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Suggested Creators</h3>
        <div className="space-y-2.5">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="relative h-[70px] rounded-xl overflow-hidden group"
            >
              {/* Background: cover photo or avatar blurred */}
              <img
                src={user.coverImage ?? user.avatar}
                alt=""
                className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500"
              />
              {/* Dark gradient from left */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

              {/* Content overlay */}
              <div className="relative h-full flex items-center gap-3 px-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
                  />
                  {user.isAI && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center ring-1 ring-white">
                      <Bot className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </div>

                {/* Name + followers */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/profile/${user.username}`}
                      className="text-sm font-bold text-white truncate hover:underline"
                    >
                      {user.displayName}
                    </Link>
                    {user.isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-sky-300 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-white/65 mt-0.5">
                    {formatNumber(user.followerCount)} followers
                  </p>
                </div>

                {/* Follow button */}
                <button className="flex-shrink-0 px-3 py-1.5 text-xs font-bold text-white border border-white/50 rounded-full hover:bg-white/20 transition-colors">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Price Pulse ── */}
      <PricePulse />

      {/* ── Popular Tags ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[
            '#miami', '#dubai', '#barcelona', '#lisbon', '#nyc',
            '#luxury', '#apartments', '#villas', '#forsale', '#rental',
          ].map((tag) => (
            <Link
              key={tag}
              href={`/explore?q=${encodeURIComponent(tag.slice(1))}`}
              className="text-xs text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full hover:bg-sky-100 transition-colors font-medium"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="text-xs text-slate-400 leading-relaxed px-1 space-y-1">
        <p>
          © 2025 Mebira ·{' '}
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          {' · '}
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          {' · '}
          <Link href="/help" className="hover:text-slate-600 transition-colors">Help</Link>
        </p>
        <p>Traveling through a traveler&apos;s post supports the traveler who shared it.</p>
      </div>
    </aside>
  );
}
