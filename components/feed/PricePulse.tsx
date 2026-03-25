import { ExternalLink, Clock } from 'lucide-react';
import { pricePulseDeals, type PriceDeal } from '@/lib/pricePulseData';

function DealCard({ deal }: { deal: PriceDeal }) {
  return (
    <a
      href={deal.expediaUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center gap-3 group"
    >
      {/* Photo */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={deal.image}
          alt={deal.hotelName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
          {deal.hotelName}
        </p>
        <p className="text-xs text-slate-400 truncate">{deal.destination}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="inline-flex items-center text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
            ↓ {deal.discount}% off
          </span>
          <span className="text-xs font-bold text-slate-900">{deal.nowPrice}</span>
          <span className="text-xs text-slate-400 line-through">{deal.wasPrice}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
          <span className="text-[10px] text-amber-500 font-semibold">
            Expires in {deal.expiresIn}
          </span>
        </div>
      </div>
    </a>
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
          <h3 className="font-extrabold text-slate-900 text-sm">Price Pulse</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
            Live
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Live deals</span>
      </div>

      {/* Deals */}
      <div className="space-y-4">
        {pricePulseDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Prices update hourly</span>
        <a
          href="https://mebira.pro"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1 text-xs text-sky-600 font-bold hover:text-sky-800 transition-colors"
        >
          All deals
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
