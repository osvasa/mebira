'use client';

import { useEffect, useState, useRef } from 'react';
import { Sparkles, Loader2, Bot, TrendingUp, Camera, DollarSign, MapPin, type LucideIcon } from 'lucide-react';
import { PostCategory } from '@/lib/types';

export interface CoachDraft {
  title: string;
  description: string;
  category: PostCategory;
  location: string;
  price: string;
  hasImage: boolean;
  tags: string[];
}

const tipIconMap: Record<string, LucideIcon> = {
  '📸': Camera,
  '💰': DollarSign,
  '📍': MapPin,
};

interface CoachTip {
  type: 'success' | 'suggestion' | 'opportunity';
  icon: string;
  title: string;
  detail: string;
}

const TIP_STYLES = {
  success:     { bg: 'bg-emerald-50', border: 'border-emerald-100', title: 'text-emerald-800', detail: 'text-emerald-600', dot: 'bg-emerald-400' },
  suggestion:  { bg: 'bg-sky-50',     border: 'border-sky-100',     title: 'text-sky-800',     detail: 'text-sky-600',     dot: 'bg-sky-400'     },
  opportunity: { bg: 'bg-amber-50',   border: 'border-amber-100',   title: 'text-amber-800',   detail: 'text-amber-600',   dot: 'bg-amber-400'   },
};

const PLACEHOLDER_TIPS: CoachTip[] = [
  { type: 'suggestion',  icon: '📸', title: 'Add a stunning photo',    detail: 'Posts with photos get 8× more engagement — lead with your best shot.' },
  { type: 'opportunity', icon: '💰', title: 'Include a price range',   detail: 'Posts with pricing boost booking clicks by 40%.' },
  { type: 'suggestion',  icon: '📍', title: 'Be specific with location', detail: 'Exact locations build 2× more trust with your followers.' },
];

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 18;
  const strokeDash = (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#56C1FF' : '#f59e0b';

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle
          cx="22" cy="22" r="18"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-black text-slate-900 leading-none">{score}</span>
      </div>
    </div>
  );
}

export function CreatorCoach({ draft }: { draft: CoachDraft }) {
  const [tips, setTips] = useState<CoachTip[]>(PLACEHOLDER_TIPS);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const prevDraftRef = useRef('');

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (serialized === prevDraftRef.current) return;
    // Wait until there's something meaningful to analyze
    if (!draft.title && !draft.description && !draft.location) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      prevDraftRef.current = serialized;
      setLoading(true);
      try {
        const res = await fetch('/api/creator-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        });
        const data = await res.json();
        if (data.tips?.length) {
          setTips(data.tips);
          setScore(data.overallScore ?? 0);
          setHasAnalyzed(true);
        }
      } catch (err) {
        console.error('Coach error:', err);
      } finally {
        setLoading(false);
      }
    }, 1600);

    return () => clearTimeout(debounceRef.current);
  }, [draft]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 via-sky-50 to-teal-50 border-b border-violet-100/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-200">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 text-sm leading-tight">AI Creator Coach</p>
              <p className="text-[10px] text-violet-500 font-semibold">Powered by Claude Opus</p>
            </div>
          </div>
          {hasAnalyzed && !loading && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <ScoreRing score={score} />
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 leading-tight">Post</p>
                <p className="text-[10px] font-bold text-slate-500">Score</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips body */}
      <div className="p-4 space-y-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-sky-100 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Analyzing your draft…</p>
          </div>
        ) : (
          tips.map((tip, idx) => {
            const s = TIP_STYLES[tip.type];
            return (
              <div
                key={idx}
                className={`flex gap-3 p-3.5 rounded-xl border transition-all ${s.bg} ${s.border}`}
              >
                <div className="flex-shrink-0 mt-0.5">{(() => { const IconComp = tipIconMap[tip.icon]; return IconComp ? <IconComp className="w-4 h-4" /> : <span className="text-lg leading-none">{tip.icon}</span>; })()}</div>
                <div className="min-w-0">
                  <p className={`text-xs font-extrabold leading-tight ${s.title}`}>{tip.title}</p>
                  <p className={`text-xs mt-1 leading-relaxed ${s.detail}`}>{tip.detail}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Engagement preview */}
      {hasAnalyzed && !loading && score >= 60 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-emerald-700">
              Looking strong! This post has good earning potential.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-violet-400" />
        <span className="text-[10px] text-slate-400 font-medium">
          {hasAnalyzed ? 'Tips update as you write' : 'Start writing to get personalized tips'}
        </span>
      </div>
    </div>
  );
}
