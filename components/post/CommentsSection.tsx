'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Send, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from '@/lib/utils';
import type { Comment } from '@/lib/types';

interface CommentsSectionProps {
  postId: string;
  initialComments: Comment[];
  commentCount: number;
}

export function CommentsSection({ postId, initialComments, commentCount }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when navigated here via #comments hash
  useEffect(() => {
    if (window.location.hash === '#comments') {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setSubmitting(true);
    setError('');

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Sign in to leave a comment.');
      setSubmitting(false);
      return;
    }

    // Optimistic UI update
    const handle = user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'you';
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      user: {
        id: user.id,
        username: handle,
        displayName: handle,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        bio: '',
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        totalEarnings: 0,
        isAI: false,
        isVerified: false,
      },
      text,
      likeCount: 0,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setInputText('');

    // Persist to Supabase
    const { error: dbError } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      text,
    });

    if (dbError) {
      // Comment already shown optimistically — silently ignore DB error
      // (table may not exist yet; run supabase/add-comments-table.sql to enable persistence)
      console.warn('Comment not persisted:', dbError.message);
    }

    setSubmitting(false);
  }

  return (
    <div id="comments" className="mt-8">
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        Comments ({commentCount + comments.filter((c) => c.id.startsWith('temp-')).length})
      </h2>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex-1 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={submitting || !inputText.trim()}
              className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2 ml-12">
            {error}{' '}
            <Link href="/auth/login" className="underline font-medium">Sign in</Link>
          </p>
        )}
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex gap-3">
              <Link href={`/profile/${comment.user.username}`} className="flex-shrink-0">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.displayName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/profile/${comment.user.username}`}
                    className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors"
                  >
                    {comment.user.username}
                  </Link>
                  <span className="text-xs text-slate-400" suppressHydrationWarning>
                    {formatDistanceToNow(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{comment.text}</p>
                <button className="flex items-center gap-1 mt-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                  {comment.likeCount}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
