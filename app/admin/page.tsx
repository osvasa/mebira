'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Plus,
  ExternalLink,
  ArrowLeft,
  Ticket,
  Users,
  Clock,
  Bot,
  PenLine,
  Trash2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  MousePointerClick,
  Video,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { createClient } from '@/lib/supabase/client';

interface InviteRequest {
  id: string;
  full_name: string;
  tiktok_profile: string;
  content_type: string;
  travel_style: string | null;
  status: string;
  created_at: string;
}

interface InviteCode {
  id: string;
  code: string;
  creator_name: string;
  tiktok_profile: string | null;
  content_type: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

interface Creator {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string;
  followers: number;
  created_at: string;
  post_count: number;
}

interface CreatorPost {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  created_at: string;
  photo_url: string | null;
  expedia_url: string | null;
}

interface ClickRecord {
  id: string;
  post_id: string;
  creator_id: string;
  creator_username: string | null;
  post_title: string | null;
  post_location: string | null;
  ip_address: string | null;
  clicked_at: string;
  expedia_url: string | null;
}

type TabId = 'requests' | 'codes' | 'creators' | 'ai-creators' | 'earnings' | 'generate-video';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabId>('requests');
  const [requestFilter, setRequestFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Data
  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [aiCreators, setAiCreators] = useState<Creator[]>([]);
  const [clicks, setClicks] = useState<ClickRecord[]>([]);
  const [clickAvatars, setClickAvatars] = useState<Record<string, string | null>>({});
  const [loadingData, setLoadingData] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Generate code form
  const [showGenerate, setShowGenerate] = useState(false);
  const [genName, setGenName] = useState('');
  const [genTiktok, setGenTiktok] = useState('');
  const [genContentType, setGenContentType] = useState('travel');
  const [genLoading, setGenLoading] = useState(false);

  // AI Creator form
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiUsername, setAiUsername] = useState('');
  const [aiBio, setAiBio] = useState('');
  const [aiAvatar, setAiAvatar] = useState('');
  const [aiFormLoading, setAiFormLoading] = useState(false);
  const [aiFormError, setAiFormError] = useState<string | null>(null);

  // Expanded creator posts
  const [expandedCreatorId, setExpandedCreatorId] = useState<string | null>(null);
  const [creatorPosts, setCreatorPosts] = useState<Record<string, CreatorPost[]>>({});
  const [postsLoading, setPostsLoading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Generate video form
  const [vidPropertyName, setVidPropertyName] = useState('');
  const [vidLocation, setVidLocation] = useState('');
  const [vidCategory, setVidCategory] = useState('apartment');
  const [vidStyle, setVidStyle] = useState('luxury-escape');
  const [vidImage, setVidImage] = useState<File | null>(null);
  const [vidGenerating, setVidGenerating] = useState(false);
  const [vidProgress, setVidProgress] = useState('');
  const [vidResult, setVidResult] = useState<{
    id: string; title: string; description: string; location: string;
    category: string; videoUrl: string; style?: string;
  } | null>(null);
  const [vidError, setVidError] = useState<string | null>(null);

  // Edit post modal
  const [editingPost, setEditingPost] = useState<CreatorPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editExpediaUrl, setEditExpediaUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (!data.user?.email || data.user.email !== adminEmail) {
        router.push('/');
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    });
  }, [supabase, router]);

  // Fetch functions
  const fetchRequests = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch(`/api/admin/invite-requests?status=${requestFilter}`);
    const data = await res.json();
    setRequests(data.requests ?? []);
    setLoadingData(false);
  }, [requestFilter]);

  const fetchCodes = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch('/api/admin/invite-codes');
    const data = await res.json();
    setCodes(data.codes ?? []);
    setLoadingData(false);
  }, []);

  const fetchCreators = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch('/api/admin/creators?type=real');
    const data = await res.json();
    setCreators(data.creators ?? []);
    setLoadingData(false);
  }, []);

  const fetchAiCreators = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch('/api/admin/creators?type=ai');
    const data = await res.json();
    setAiCreators(data.creators ?? []);
    setLoadingData(false);
  }, []);

  const fetchClicks = useCallback(async () => {
    setLoadingData(true);
    const res = await fetch('/api/admin/clicks');
    const data = await res.json();
    setClicks(data.clicks ?? []);
    setClickAvatars(data.avatarMap ?? {});
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'requests') fetchRequests();
    else if (activeTab === 'codes') fetchCodes();
    else if (activeTab === 'creators') fetchCreators();
    else if (activeTab === 'ai-creators') fetchAiCreators();
    else if (activeTab === 'earnings') fetchClicks();
  }, [isAdmin, activeTab, requestFilter, fetchRequests, fetchCodes, fetchCreators, fetchAiCreators, fetchClicks]);

  async function handleAction(requestId: string, action: 'approve' | 'reject') {
    setActionLoading(requestId);
    const res = await fetch('/api/admin/invite-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action }),
    });
    const data = await res.json();
    if (data.code) {
      setGeneratedCode(data.code);
      setTimeout(() => setGeneratedCode(null), 10000);
    }
    setActionLoading(null);
    fetchRequests();
  }

  async function handleGenerateCode() {
    if (!genName.trim()) return;
    setGenLoading(true);
    const res = await fetch('/api/admin/invite-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorName: genName.trim(),
        tiktokProfile: genTiktok.trim() || null,
        contentType: genContentType,
      }),
    });
    const data = await res.json();
    if (data.code) {
      setCopiedCode(data.code.code);
      await navigator.clipboard.writeText(data.code.code);
      setTimeout(() => setCopiedCode(null), 3000);
    }
    setGenLoading(false);
    setShowGenerate(false);
    setGenName('');
    setGenTiktok('');
    fetchCodes();
  }

  async function handleCreateAiCreator() {
    if (!aiUsername.trim()) return;
    setAiFormLoading(true);
    setAiFormError(null);
    const res = await fetch('/api/admin/creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: aiUsername.trim(),
        bio: aiBio.trim(),
        avatar: aiAvatar.trim() || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAiFormError(data.error || 'Failed to create AI realtor');
      setAiFormLoading(false);
      return;
    }
    setAiFormLoading(false);
    setShowAiForm(false);
    setAiUsername('');
    setAiBio('');
    setAiAvatar('');
    fetchAiCreators();
  }

  function handlePostAs(creator: Creator) {
    localStorage.setItem('posting_as_user_id', creator.id);
    localStorage.setItem('posting_as_name', creator.username);
    router.push('/create');
  }

  async function toggleCreatorPosts(creatorId: string) {
    if (expandedCreatorId === creatorId) {
      setExpandedCreatorId(null);
      return;
    }
    setExpandedCreatorId(creatorId);
    if (creatorPosts[creatorId]) return; // already loaded
    setPostsLoading(true);
    const res = await fetch(`/api/admin/posts?user_id=${creatorId}`);
    const data = await res.json();
    setCreatorPosts((prev) => ({ ...prev, [creatorId]: data.posts ?? [] }));
    setPostsLoading(false);
  }

  async function handleDeletePost(postId: string, creatorId: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeletingPostId(postId);
    const res = await fetch('/api/admin/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      setCreatorPosts((prev) => ({
        ...prev,
        [creatorId]: (prev[creatorId] ?? []).filter((p) => p.id !== postId),
      }));
      // Update post count in creators/aiCreators lists
      setCreators((prev) => prev.map((c) => c.id === creatorId ? { ...c, post_count: c.post_count - 1 } : c));
      setAiCreators((prev) => prev.map((c) => c.id === creatorId ? { ...c, post_count: c.post_count - 1 } : c));
    }
    setDeletingPostId(null);
  }

  function openEditPost(post: CreatorPost) {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.description || '');
    setEditLocation(post.location);
    setEditCategory(post.category);
    setEditExpediaUrl(post.expedia_url || '');
  }

  async function handleEditPostSave() {
    if (!editingPost) return;
    setEditSaving(true);
    const res = await fetch('/api/admin/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: editingPost.id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        location: editLocation.trim(),
        category: editCategory,
        expedia_url: editExpediaUrl.trim() || null,
      }),
    });
    if (res.ok) {
      // Update local state
      const updatedPost = {
        ...editingPost,
        title: editTitle.trim(),
        description: editDescription.trim(),
        location: editLocation.trim(),
        category: editCategory,
        expedia_url: editExpediaUrl.trim() || null,
      };
      setCreatorPosts((prev) => {
        const updated: Record<string, CreatorPost[]> = {};
        for (const [key, posts] of Object.entries(prev)) {
          updated[key] = posts.map((p) => p.id === editingPost.id ? updatedPost : p);
        }
        return updated;
      });
      setEditingPost(null);
    }
    setEditSaving(false);
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#C8102E] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs: { id: TabId; label: string; Icon: typeof Users }[] = [
    { id: 'requests', label: 'Requests', Icon: Users },
    { id: 'codes', label: 'Codes', Icon: Ticket },
    { id: 'creators', label: 'Realtors', Icon: PenLine },
    { id: 'ai-creators', label: 'AI Realtors', Icon: Bot },
    { id: 'earnings', label: 'Earnings', Icon: DollarSign },
    { id: 'generate-video', label: 'Generate Video', Icon: Video },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to feed
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8102E] flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-400 font-medium">Manage realtors, invites, and codes</p>
            </div>
          </div>
        </div>

        {/* Generated code banner */}
        {generatedCode && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-800">
                Code generated: <span className="font-mono">{generatedCode}</span>
              </span>
            </div>
            <button onClick={() => copyCode(generatedCode)} className="text-emerald-600 hover:text-emerald-800">
              {copiedCode === generatedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-200 mb-6 overflow-x-auto scrollbar-hide">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold -mb-px transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'text-sky-600 border-b-2 border-sky-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* REQUESTS TAB                                  */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'requests' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              {(['pending', 'approved', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setRequestFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    requestFilter === s
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No {requestFilter} requests.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{req.full_name}</p>
                        <a
                          href={req.tiktok_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 mt-0.5"
                        >
                          {req.tiktok_profile}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">{req.content_type}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(req.created_at)}
                          </span>
                        </div>
                        {req.travel_style && (
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{req.travel_style}</p>
                        )}
                      </div>

                      {requestFilter === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAction(req.id, 'approve')}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* CODES TAB                                     */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'codes' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{codes.length} total codes</p>
              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-semibold hover:bg-sky-600 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Generate Code
              </button>
            </div>

            {showGenerate && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-3 shadow-sm">
                <p className="text-sm font-bold text-slate-900">Generate New Invite Code</p>
                <input
                  type="text"
                  value={genName}
                  onChange={(e) => setGenName(e.target.value)}
                  placeholder="Realtor name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={genTiktok}
                  onChange={(e) => setGenTiktok(e.target.value)}
                  placeholder="TikTok profile URL (optional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select
                  value={genContentType}
                  onChange={(e) => setGenContentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="hotels">Hotels</option>
                  <option value="restaurants">Restaurants</option>
                  <option value="destinations">Destinations</option>
                  <option value="flights">Flights</option>
                  <option value="travel">Travel (General)</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowGenerate(false)}
                    className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateCode}
                    disabled={genLoading || !genName.trim()}
                    className="flex-1 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {genLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Generate
                  </button>
                </div>
              </div>
            )}

            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : codes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No invite codes yet.
              </div>
            ) : (
              <div className="space-y-2">
                {codes.map((code) => (
                  <div key={code.id} className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">{code.code}</span>
                        {code.used ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Used</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {code.creator_name} &middot; {code.content_type} &middot; {formatDate(code.created_at)}
                      </p>
                    </div>
                    {!code.used && (
                      <button
                        onClick={() => copyCode(code.code)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        {copiedCode === code.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCode === code.code ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* CREATORS TAB                                  */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'creators' && (
          <>
            <p className="text-sm text-slate-500 mb-4">{creators.length} realtors signed up via invite code</p>

            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : creators.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No realtors have signed up yet.
              </div>
            ) : (
              <div className="space-y-3">
                {creators.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <img
                        src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=0ea5e9&color=fff&size=80`}
                        alt={c.username}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/profile/${c.username}`}
                          className="font-bold text-sm text-slate-900 hover:text-sky-600 transition-colors"
                        >
                          {c.username}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{c.post_count} posts</span>
                          <span>{c.followers} followers</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(c.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCreatorPosts(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        {expandedCreatorId === c.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        Posts
                      </button>
                      <button
                        onClick={() => handlePostAs(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8102E] text-white rounded-lg text-xs font-semibold hover:bg-[#a80d25] transition-colors flex-shrink-0"
                      >
                        <PenLine className="w-3 h-3" />
                        Post as
                      </button>
                    </div>
                    {expandedCreatorId === c.id && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                        {postsLoading && !creatorPosts[c.id] ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                          </div>
                        ) : (creatorPosts[c.id] ?? []).length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-3">No posts</p>
                        ) : (
                          <div className="space-y-2">
                            {(creatorPosts[c.id] ?? []).map((p) => (
                              <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                                  <p className="text-xs text-slate-400">{p.location} &middot; {p.category} &middot; {formatDate(p.created_at)}</p>
                                </div>
                                <button
                                  onClick={() => openEditPost(p)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#C8102E] hover:text-[#a80d25] hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <PenLine className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePost(p.id, c.id)}
                                  disabled={deletingPostId === p.id}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {deletingPostId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* AI CREATORS TAB                               */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'ai-creators' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{aiCreators.length} AI / seed creators</p>
              <button
                onClick={() => setShowAiForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8102E] text-white rounded-lg text-xs font-semibold hover:bg-[#a80d25] transition-colors"
              >
                <Plus className="w-3 h-3" />
                New AI Realtor
              </button>
            </div>

            {showAiForm && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-3 shadow-sm">
                <p className="text-sm font-bold text-slate-900">Create AI Realtor Profile</p>
                {aiFormError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{aiFormError}</p>
                )}
                <input
                  type="text"
                  value={aiUsername}
                  onChange={(e) => setAiUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <textarea
                  rows={2}
                  value={aiBio}
                  onChange={(e) => setAiBio(e.target.value)}
                  placeholder="Bio (optional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
                <input
                  type="text"
                  value={aiAvatar}
                  onChange={(e) => setAiAvatar(e.target.value)}
                  placeholder="Avatar URL (optional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowAiForm(false); setAiFormError(null); }}
                    className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAiCreator}
                    disabled={aiFormLoading || !aiUsername.trim()}
                    className="flex-1 py-2 bg-[#C8102E] text-white rounded-xl text-sm font-semibold hover:bg-[#a80d25] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {aiFormLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Create
                  </button>
                </div>
              </div>
            )}

            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : aiCreators.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No AI realtors yet.
              </div>
            ) : (
              <div className="space-y-3">
                {aiCreators.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <img
                        src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=8b5cf6&color=fff&size=80`}
                        alt={c.username}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/profile/${c.username}`}
                          className="font-bold text-sm text-slate-900 hover:text-violet-600 transition-colors"
                        >
                          {c.username}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{c.post_count} posts</span>
                          <span>{c.followers} followers</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(c.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCreatorPosts(c.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        {expandedCreatorId === c.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        Posts
                      </button>
                      <button
                        onClick={() => handlePostAs(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8102E] text-white rounded-lg text-xs font-semibold hover:bg-[#a80d25] transition-colors flex-shrink-0"
                      >
                        <PenLine className="w-3 h-3" />
                        Post as
                      </button>
                    </div>
                    {expandedCreatorId === c.id && (
                      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                        {postsLoading && !creatorPosts[c.id] ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                          </div>
                        ) : (creatorPosts[c.id] ?? []).length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-3">No posts</p>
                        ) : (
                          <div className="space-y-2">
                            {(creatorPosts[c.id] ?? []).map((p) => (
                              <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                                  <p className="text-xs text-slate-400">{p.location} &middot; {p.category} &middot; {formatDate(p.created_at)}</p>
                                </div>
                                <button
                                  onClick={() => openEditPost(p)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#C8102E] hover:text-[#a80d25] hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <PenLine className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePost(p.id, c.id)}
                                  disabled={deletingPostId === p.id}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {deletingPostId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {/* ══════════════════════════════════════════════ */}
        {/* EARNINGS TAB                                  */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'earnings' && (
          <>
            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : (
              <EarningsTab clicks={clicks} avatarMap={clickAvatars} formatDate={formatDate} />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* GENERATE VIDEO TAB                            */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'generate-video' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" style={{ color: '#C8102E' }} />
                Generate Travel Video
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Upload a hero image and Runway AI generates a cinematic 10-second travel video, then auto-posts it.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Property Name</label>
                  <input
                    type="text"
                    value={vidPropertyName}
                    onChange={(e) => setVidPropertyName(e.target.value)}
                    placeholder="e.g. Four Seasons Bora Bora"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={vidLocation}
                    onChange={(e) => setVidLocation(e.target.value)}
                    placeholder="e.g. Bora Bora, French Polynesia"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={vidCategory}
                      onChange={(e) => setVidCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none bg-white"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                      <option value="rental">Rental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Style</label>
                    <select
                      value={vidStyle}
                      onChange={(e) => setVidStyle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none bg-white"
                    >
                      <option value="luxury-escape">Luxury Escape</option>
                      <option value="adventure-vibe">Adventure Vibe</option>
                      <option value="hidden-gem">Hidden Gem</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-colors">
                    <div className="flex flex-col items-center gap-1">
                      <Video className="w-6 h-6 text-slate-400" />
                      <span className="text-sm text-slate-500">{vidImage ? vidImage.name : 'Click to upload image'}</span>
                      <span className="text-xs text-slate-400">JPG or PNG — one image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setVidImage(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>

                <button
                  onClick={async () => {
                    if (!vidPropertyName || !vidLocation || !vidImage) {
                      setVidError('Please fill in all fields and upload an image.');
                      return;
                    }
                    setVidGenerating(true);
                    setVidError(null);
                    setVidResult(null);
                    setVidProgress('Step 1/5 — Uploading image...');

                    try {
                      const steps = [
                        { delay: 5000, msg: 'Step 2/5 — Runway is generating your video...' },
                        { delay: 30000, msg: 'Step 2/5 — Still generating (Runway takes ~60s)...' },
                        { delay: 90000, msg: 'Step 3/5 — Uploading video to cloud...' },
                        { delay: 120000, msg: 'Step 4/5 — Generating post details...' },
                        { delay: 150000, msg: 'Step 5/5 — Creating post...' },
                      ];
                      const timers = steps.map(({ delay, msg }) =>
                        setTimeout(() => setVidProgress(msg), delay)
                      );

                      const fd = new FormData();
                      fd.append('propertyName', vidPropertyName);
                      fd.append('location', vidLocation);
                      fd.append('category', vidCategory);
                      fd.append('style', vidStyle);
                      fd.append('image', vidImage);

                      const res = await fetch('/api/admin/generate-video', {
                        method: 'POST',
                        body: fd,
                      });

                      timers.forEach(clearTimeout);
                      const text = await res.text();
                      let data;
                      try { data = JSON.parse(text); } catch { throw new Error(`Invalid response (${res.status}): ${text.substring(0, 300)}`); }
                      if (!res.ok) throw new Error(data.error || 'Generation failed');

                      setVidResult(data.post);
                      setVidProgress('');
                      setVidPropertyName('');
                      setVidLocation('');
                      setVidImage(null);
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : 'Unknown error';
                      setVidError(msg);
                      setVidProgress('');
                    } finally {
                      setVidGenerating(false);
                    }
                  }}
                  disabled={vidGenerating}
                  className="w-full py-3 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#C8102E' }}
                >
                  {vidGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      Generate Video
                    </>
                  )}
                </button>

                {vidGenerating && vidProgress && (
                  <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-200 rounded-xl">
                    <div className="w-5 h-5 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-sky-800">{vidProgress}</p>
                      <p className="text-xs text-sky-500 mt-0.5">Runway AI generates cinematic video from your image, then we upload and post it.</p>
                    </div>
                  </div>
                )}

                {vidError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{vidError}</p>
                  </div>
                )}

                {vidResult && (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-800">Video generated and posted!</span>
                    </div>
                    <div className="space-y-1.5 text-sm text-slate-700">
                      <p><span className="font-semibold">Title:</span> {vidResult.title}</p>
                      <p><span className="font-semibold">Location:</span> {vidResult.location}</p>
                      <p><span className="font-semibold">Category:</span> {vidResult.category}</p>
                      {vidResult.style && <p><span className="font-semibold">Style:</span> {vidResult.style}</p>}
                      <p className="text-xs text-slate-500 mt-2">{vidResult.description}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <a
                        href={`/post/${vidResult.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Post
                      </a>
                      <a
                        href={vidResult.videoUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Watch Video
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Post Modal ── */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditingPost(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Edit Post</p>
              <button onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                  <option value="rental">Rental</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Expedia URL</label>
                <input value={editExpediaUrl} onChange={(e) => setEditExpediaUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditingPost(null)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={handleEditPostSave} disabled={editSaving || !editTitle.trim()} className="flex-1 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {editSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Earnings Tab Component ──
function EarningsTab({
  clicks,
  avatarMap,
  formatDate,
}: {
  clicks: ClickRecord[];
  avatarMap: Record<string, string | null>;
  formatDate: (iso: string) => string;
}) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Group by creator
  const creatorMap = new Map<
    string,
    { username: string; creatorId: string; totalClicks: number; monthClicks: number; posts: Map<string, { title: string; clicks: number }> }
  >();

  clicks.forEach((c) => {
    const key = c.creator_id || 'unknown';
    if (!creatorMap.has(key)) {
      creatorMap.set(key, {
        username: c.creator_username || 'Unknown',
        creatorId: c.creator_id,
        totalClicks: 0,
        monthClicks: 0,
        posts: new Map(),
      });
    }
    const entry = creatorMap.get(key)!;
    entry.totalClicks++;
    if (new Date(c.clicked_at) >= monthStart) entry.monthClicks++;
    if (c.post_id && c.post_title) {
      const postEntry = entry.posts.get(c.post_id) || { title: c.post_title, clicks: 0 };
      postEntry.clicks++;
      entry.posts.set(c.post_id, postEntry);
    }
  });

  const creatorList = Array.from(creatorMap.values()).sort((a, b) => b.totalClicks - a.totalClicks);

  return (
    <div className="space-y-6">
      {/* Note */}
      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-100">
        Track which realtors are driving traffic. Cross-reference with your Expedia affiliate dashboard to match completed bookings.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-slate-900">{clicks.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Total Clicks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-slate-900">
            {clicks.filter((c) => new Date(c.clicked_at) >= monthStart).length}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">This Month</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-slate-900">{creatorMap.size}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Active Realtors</p>
        </div>
      </div>

      {/* Creator breakdown */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">By Realtor</h3>
        {creatorList.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No clicks tracked yet.</p>
        ) : (
          <div className="space-y-3">
            {creatorList.map((c) => {
              const avatar = avatarMap[c.creatorId] || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=0ea5e9&color=fff&size=80`;
              const topPosts = Array.from(c.posts.values()).sort((a, b) => b.clicks - a.clicks).slice(0, 3);
              return (
                <div key={c.creatorId} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={avatar} alt={c.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/profile/${c.username}`} className="font-bold text-sm text-slate-900 hover:text-sky-600 transition-colors">
                        {c.username}
                      </Link>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {c.totalClicks} total</span>
                        <span>{c.monthClicks} this month</span>
                      </div>
                    </div>
                  </div>
                  {topPosts.length > 0 && (
                    <div className="mt-3 pl-13 space-y-1">
                      {topPosts.map((p, i) => (
                        <p key={i} className="text-xs text-slate-500 pl-[52px]">
                          {p.title} — <span className="font-semibold text-slate-700">{p.clicks} clicks</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full click log */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Click Log</h3>
        {clicks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No clicks tracked yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Date</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Creator</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Post</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.slice(0, 100).map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{formatDate(c.clicked_at)}</td>
                      <td className="px-4 py-2 font-medium text-slate-700">{c.creator_username || '—'}</td>
                      <td className="px-4 py-2 text-slate-700 max-w-[200px] truncate">{c.post_title || '—'}</td>
                      <td className="px-4 py-2 text-slate-500">{c.post_location || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {clicks.length > 100 && (
              <p className="text-xs text-slate-400 text-center py-2 border-t border-slate-100">
                Showing first 100 of {clicks.length} clicks
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
