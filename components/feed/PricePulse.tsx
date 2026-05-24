import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTrend {
  id: string;
  market: string;
  avgPrice: string;
  change: number;
  image: string;
}

const marketTrends: MarketTrend[] = [
  {
    id: 'm1',
    market: 'Miami, Florida',
    avgPrice: 'Avg $850/sqft',
    change: 12,
    image: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=200&q=80',
  },
  {
    id: 'm2',
    market: 'Dubai Marina',
    avgPrice: 'Avg $650/sqft',
    change: -5,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200&q=80',
  },
  {
    id: 'm3',
    market: 'Barcelona, Spain',
    avgPrice: 'Avg $450/sqft',
    change: 8,
    image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=200&q=80',
  },
  {
    id: 'm4',
    market: 'Lisbon, Portugal',
    avgPrice: 'Avg $380/sqft',
    change: 15,
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=200&q=80',
  },
  {
    id: 'm5',
    market: 'New York City',
    avgPrice: 'Avg $1,200/sqft',
    change: -2,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200&q=80',
  },
];

function TrendCard({ trend }: { trend: MarketTrend }) {
  const isUp = trend.change > 0;
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={trend.image}
          alt={trend.market}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {trend.market}
        </p>
        <p className="text-xs text-slate-400">{trend.avgPrice}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-1.5 py-0.5 rounded-full ${
            isUp
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
              : 'text-red-700 bg-red-50 border border-red-100'
          }`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? '↑' : '↓'} {Math.abs(trend.change)}%
          </span>
          <span className="text-[10px] text-slate-400">this month</span>
        </div>
      </div>
    </div>
  );
}

export function PricePulse() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="relative block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">Market Pulse</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
            Live
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Market trends</span>
      </div>

      {/* Trends */}
      <div className="space-y-4">
        {marketTrends.map((trend) => (
          <TrendCard key={trend.id} trend={trend} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Updated today</span>
        <Link
          href="/explore"
          className="flex items-center gap-1 text-xs text-sky-600 font-bold hover:text-sky-800 transition-colors"
        >
          Explore Markets
          <TrendingUp className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
