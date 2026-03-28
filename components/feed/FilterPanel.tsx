'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { PostCategory } from '@/lib/types';

export interface Filters {
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;   // null = Any
  bathrooms: number | null;  // null = Any
  categories: PostCategory[];
  location: string;
}

export const emptyFilters: Filters = {
  minPrice: '',
  maxPrice: '',
  bedrooms: null,
  bathrooms: null,
  categories: [],
  location: '',
};

export function isFiltersEmpty(f: Filters): boolean {
  return (
    !f.minPrice &&
    !f.maxPrice &&
    f.bedrooms === null &&
    f.bathrooms === null &&
    f.categories.length === 0 &&
    !f.location
  );
}

interface FilterPanelProps {
  open: boolean;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}

const bedroomOptions = [
  { label: 'Any', value: null },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '5+', value: 5 },
] as const;

const bathroomOptions = [
  { label: 'Any', value: null },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
] as const;

const categoryOptions: { id: PostCategory; label: string }[] = [
  { id: 'house', label: 'Houses' },
  { id: 'apartment', label: 'Apartments' },
  { id: 'villa', label: 'Villas' },
  { id: 'rental', label: 'Rentals' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'preconstruction', label: 'Pre-construction' },
  { id: 'land', label: 'Land' },
];

export function FilterPanel({ open, filters, onApply, onClose }: FilterPanelProps) {
  const [draft, setDraft] = useState<Filters>(filters);

  // Sync draft when panel opens
  const [lastOpen, setLastOpen] = useState(false);
  if (open && !lastOpen) {
    setDraft(filters);
  }
  if (open !== lastOpen) setLastOpen(open);

  if (!open) return null;

  const toggleCategory = (cat: PostCategory) => {
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(cat)
        ? d.categories.filter((c) => c !== cat)
        : [...d.categories, cat],
    }));
  };

  const handleClear = () => {
    setDraft({ ...emptyFilters });
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const pillBase = 'px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border';
  const pillActive = 'bg-[#2D9B4E] text-white border-[#2D9B4E]';
  const pillInactive = 'bg-white text-slate-600 border-slate-200 hover:border-slate-300';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-[70] h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Price Range */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Price Range</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={draft.minPrice}
                onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
                placeholder="$0"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9B4E]/40 focus:border-transparent"
              />
              <span className="text-slate-400 self-center">—</span>
              <input
                type="text"
                value={draft.maxPrice}
                onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
                placeholder="Any"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9B4E]/40 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Bedrooms</p>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, bedrooms: value }))}
                  className={`${pillBase} ${draft.bedrooms === value ? pillActive : pillInactive}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Bathrooms</p>
            <div className="flex flex-wrap gap-2">
              {bathroomOptions.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, bathrooms: value }))}
                  className={`${pillBase} ${draft.bathrooms === value ? pillActive : pillInactive}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Property Type</p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCategory(id)}
                  className={`${pillBase} ${draft.categories.includes(id) ? pillActive : pillInactive}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Location</p>
            <input
              type="text"
              value={draft.location}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
              placeholder="City or neighborhood"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9B4E]/40 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-2.5 border border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 bg-[#2D9B4E] text-white rounded-xl text-sm font-bold hover:bg-[#258442] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
