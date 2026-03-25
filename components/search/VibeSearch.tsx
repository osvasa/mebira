'use client';

import { useState, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';

const VIBE_CHIPS = [
  'quiet beach, great sunsets',
  'luxury overwater villa',
  'hidden temples & local food',
  'romantic cliffside dining',
  'off-the-beaten-path adventure',
];

export interface VibeMatch {
  postId: string;
  reason: string;
  score: number;
}

interface VibeSearchProps {
  onResults: (matches: VibeMatch[], summary: string) => void;
  onClear: () => void;
  isActive: boolean;
  summary: string;
}

export function VibeSearch({ onResults, onClear, isActive, summary }: VibeSearchProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(
    async (vibe: string) => {
      if (!vibe.trim()) return;
      setLoading(true);
      try {
        const res = await fetch('/api/vibe-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vibe }),
        });
        const data = await res.json();
        onResults(data.matches ?? [], data.summary ?? '');
      } catch (err) {
        console.error('Vibe search error:', err);
        onResults([], '');
      } finally {
        setLoading(false);
      }
    },
    [onResults]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(value);
  };

  const handleChip = (chip: string) => {
    setValue(chip);
    search(chip);
  };

  const handleClear = () => {
    setValue('');
    onClear();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Vibe Search</span>
          <span className="text-[10px] font-extrabold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
            AI
          </span>
        </div>
        {isActive && !loading && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="px-4 pb-3">
        <div
          className={`flex items-center bg-slate-50 border rounded-xl overflow-hidden transition-all ${
            isActive
              ? 'border-violet-300 ring-2 ring-violet-100 bg-white'
              : 'border-slate-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 focus-within:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-400 ml-3.5 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe your dream trip vibe…"
            className="flex-1 px-3 py-3 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="m-1.5 p-2 bg-gradient-to-br from-violet-500 to-sky-500 text-white rounded-lg disabled:opacity-40 hover:from-violet-600 hover:to-sky-600 active:scale-95 transition-all flex-shrink-0 shadow-sm shadow-violet-200"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="px-5 pb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <p className="text-xs text-violet-500 font-semibold">Reading your vibe…</p>
        </div>
      )}

      {/* Active summary */}
      {isActive && !loading && summary && (
        <div className="px-5 pb-3">
          <p className="text-xs font-bold text-violet-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {summary}
          </p>
        </div>
      )}

      {/* Suggestion chips */}
      {!isActive && !loading && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          <span className="text-[10px] font-semibold text-slate-400 self-center mr-1">Try:</span>
          {VIBE_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              className="text-xs text-slate-500 bg-slate-50 hover:bg-violet-50 hover:text-violet-600 border border-slate-200 hover:border-violet-200 px-3 py-1.5 rounded-full transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
