import { Plane, Hotel, Home, Package, Ticket, Car } from 'lucide-react';

const EXPEDIA = 'https://expedia.com/affiliates/osvasa/socialtravel';

const categories = [
  { label: 'Hotels',           href: EXPEDIA, icon: Hotel },
  { label: 'Flights',          href: EXPEDIA, icon: Plane },
  { label: 'Homes & Apts',     href: EXPEDIA, icon: Home },
  { label: 'Bundle & Save',    href: EXPEDIA, icon: Package },
  { label: 'Activities',       href: EXPEDIA, icon: Ticket },
  { label: 'Airport Transfer', href: EXPEDIA, icon: Car },
];

export function BookingCategories() {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
      {categories.map((cat) => (
        <a
          key={cat.label}
          href={cat.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1.5 flex-shrink-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-colors"
        >
          <cat.icon className="w-3.5 h-3.5" />
          {cat.label}
        </a>
      ))}
    </div>
  );
}
