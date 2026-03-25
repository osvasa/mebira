'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, BadgeCheck, Bot, DollarSign, Grid3X3, Bookmark, Loader2, X as XIcon, Camera, Pencil } from 'lucide-react';
import { ShareMenu } from '@/components/ui/ShareMenu';
import { Navbar } from '@/components/layout/Navbar';
import { formatNumber } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { User, Post, PostCategory } from '@/lib/types';

interface ProfileClientProps {
  user: User;
  posts: Post[];
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export function ProfileClient({ user, posts, postCount, followerCount: initialFollowerCount, followingCount }: ProfileClientProps) {
  console.log('[ProfileClient] posts received:', posts.length, posts.map(p => p.id));
  const supabase = createClient();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit profile modal
  const [editOpen, setEditOpen] = useState(false);
  const [editBio, setEditBio] = useState(user.bio);
  const [saving, setSaving] = useState(false);

  // Live state for profile display (updates after edit)
  const [displayBio, setDisplayBio] = useState(user.bio);
  const [displayAvatar, setDisplayAvatar] = useState(user.avatar);
  const [displayCover, setDisplayCover] = useState(user.coverImage ?? '');

  // Upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Edit post modal
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostDesc, setEditPostDesc] = useState('');
  const [editPostLocation, setEditPostLocation] = useState('');
  const [editPostCategory, setEditPostCategory] = useState('');
  const [editPostExpediaUrl, setEditPostExpediaUrl] = useState('');
  const [editPostSaving, setEditPostSaving] = useState(false);
  const [localPosts, setLocalPosts] = useState(posts);

  const isOwner = currentUserId === user.id;

  // Get current user + check follow status
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setCurrentUserId(data.user.id);

      // Check if currently following
      const { data: followRow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', data.user.id)
        .eq('following_id', user.id)
        .maybeSingle();

      if (followRow) setIsFollowing(true);
    });
  }, [supabase, user.id]);

  // Auto-dismiss upload error
  useEffect(() => {
    if (!uploadError) return;
    const t = setTimeout(() => setUploadError(null), 5000);
    return () => clearTimeout(t);
  }, [uploadError]);

  // ── Upload helper ──
  async function uploadImage(file: File, folder: 'avatars' | 'covers'): Promise<string | null> {
    const presignRes = await fetch('/api/upload/image-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
    });
    if (!presignRes.ok) {
      setUploadError('Failed to get upload URL. Please try again.');
      return null;
    }
    const { uploadUrl, publicUrl, error } = await presignRes.json();
    if (error || !uploadUrl) {
      setUploadError(error || 'Failed to get upload URL.');
      return null;
    }

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) {
      setUploadError('Failed to upload image. Please try again.');
      return null;
    }

    return publicUrl;
  }

  // ── Avatar upload ──
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;
    setUploadError(null);
    setAvatarUploading(true);

    try {
      const url = await uploadImage(file, 'avatars');
      if (url) {
        const { data, error } = await supabase
          .from('users')
          .update({ avatar: url })
          .eq('id', currentUserId)
          .select('avatar')
          .single();
        if (error) {
          console.error('[avatar] Supabase update error:', error);
          setUploadError('Failed to save profile photo: ' + error.message);
        } else if (!data) {
          console.error('[avatar] No row updated — RLS may have blocked it');
          setUploadError('Could not update profile photo. Please log in again.');
        } else {
          setDisplayAvatar(url);
        }
      }
    } catch (err) {
      console.error('[avatar] Unexpected error:', err);
      setUploadError('Something went wrong uploading your photo.');
    }
    setAvatarUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  }

  // ── Cover upload ──
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;
    setUploadError(null);
    setCoverUploading(true);

    try {
      const url = await uploadImage(file, 'covers');
      if (url) {
        const { data, error } = await supabase
          .from('users')
          .update({ cover_image_url: url })
          .eq('id', currentUserId)
          .select('cover_image_url')
          .single();
        if (error) {
          console.error('[cover] Supabase update error:', error);
          setUploadError('Failed to save cover image: ' + error.message);
        } else if (!data) {
          console.error('[cover] No row updated — RLS may have blocked it');
          setUploadError('Could not update cover image. Please log in again.');
        } else {
          setDisplayCover(url);
        }
      }
    } catch (err) {
      console.error('[cover] Unexpected error:', err);
      setUploadError('Something went wrong uploading your cover image.');
    }
    setCoverUploading(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  async function handleFollow() {
    if (!currentUserId || followLoading) return;
    setFollowLoading(true);

    if (isFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', user.id);
      if (!error) {
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: user.id });
      if (!error) {
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    }
    setFollowLoading(false);
  }

  async function handleEditSave() {
    if (!currentUserId) return;
    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ bio: editBio.trim() })
      .eq('id', currentUserId);
    if (!error) {
      setDisplayBio(editBio.trim());
      setEditOpen(false);
    }
    setSaving(false);
  }

  function openPostEdit(post: Post) {
    setEditPostId(post.id);
    setEditPostTitle(post.title);
    setEditPostDesc(post.description);
    setEditPostLocation(post.location);
    setEditPostCategory(post.category);
    setEditPostExpediaUrl(post.expediaUrl || '');
  }

  async function handlePostEditSave() {
    if (!editPostId) return;
    setEditPostSaving(true);
    const res = await fetch('/api/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: editPostId,
        title: editPostTitle.trim(),
        description: editPostDesc.trim(),
        location: editPostLocation.trim(),
        category: editPostCategory,
        expedia_url: editPostExpediaUrl.trim() || null,
      }),
    });
    if (res.ok) {
      setLocalPosts((prev) =>
        prev.map((p) =>
          p.id === editPostId
            ? { ...p, title: editPostTitle.trim(), description: editPostDesc.trim(), location: editPostLocation.trim(), category: editPostCategory as PostCategory, expediaUrl: editPostExpediaUrl.trim() || p.expediaUrl }
            : p
        )
      );
      setEditPostId(null);
    }
    setEditPostSaving(false);
  }

  return (
    <div className="bg-slate-50">
      <Navbar />

      {/* Upload error toast */}
      {uploadError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3 max-w-md">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-white/80 hover:text-white">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cover image */}
      <div
        className="relative h-40 sm:h-52 md:h-64 overflow-hidden"
        onClick={() => isOwner && coverInputRef.current?.click()}
      >
        <img
          src={displayCover || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        {isOwner && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity cursor-pointer ${coverUploading ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
            <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              {coverUploading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
              <span className="text-white text-sm font-semibold">
                {coverUploading ? 'Uploading…' : 'Change Cover'}
              </span>
            </div>
          </div>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0 w-fit">
              <img
                src={displayAvatar}
                alt={user.displayName}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-xl ${isOwner ? 'cursor-pointer' : ''}`}
                onClick={() => isOwner && avatarInputRef.current?.click()}
              />
              {isOwner ? (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-sky-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-md hover:bg-sky-600 transition-colors"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  )}
                </button>
              ) : user.isAI ? (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <Bot className="w-4 h-4 text-white" />
                </span>
              ) : null}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isOwner ? (
                <button
                  onClick={() => setEditOpen(true)}
                  className="px-4 sm:px-5 py-2 border border-slate-200 text-slate-700 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Edit Profile
                </button>
              ) : currentUserId ? (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 sm:px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    isFollowing
                      ? 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-700'
                      : 'bg-gradient-to-r from-sky-500 to-teal-500 text-white hover:from-sky-600 hover:to-teal-600 shadow-sm'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 sm:px-5 py-2 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-full text-sm font-bold hover:from-sky-600 hover:to-teal-600 transition-all shadow-sm"
                >
                  Follow
                </Link>
              )}
              <ShareMenu
                path={`/profile/${user.username}`}
                title={`${user.displayName} on Osvasa`}
              />
            </div>
          </div>

          {/* Name + meta */}
          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">{user.displayName}</h1>
              {user.isVerified && <BadgeCheck className="w-6 h-6 text-sky-500" />}
              {user.isAI && (
                <span className="text-xs font-bold bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full">
                  AI Creator
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm">@{user.username}</p>
            {user.location && (
              <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </div>
            )}
            {displayBio && (
              <p className="mt-3 text-slate-700 text-sm leading-relaxed max-w-xl">{displayBio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-5 pb-5 border-b border-slate-100">
            <div className="text-center">
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">{formatNumber(postCount)}</p>
              <p className="text-xs text-slate-500 font-medium">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                {formatNumber(followerCount)}
              </p>
              <p className="text-xs text-slate-500 font-medium">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                {formatNumber(followingCount)}
              </p>
              <p className="text-xs text-slate-500 font-medium">Following</p>
            </div>
            {isOwner && (
              <div className="ml-auto bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-100 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                    ${user.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <p className="text-xs text-teal-600 font-semibold mt-0.5">Affiliate Earnings</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-200 mb-6">
          <button className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-sky-600 border-b-2 border-sky-500 -mb-px">
            <Grid3X3 className="w-4 h-4" />
            Posts
          </button>
          {isOwner && (
            <button className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              <Bookmark className="w-4 h-4" />
              Saved
            </button>
          )}
        </div>

        {/* Posts grid */}
        {localPosts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pb-12">
            {localPosts.map((post) => {
              const hasVideo = post.videoUrl?.includes('r2.dev');

              return (
                <div key={post.id} className="relative group">
                  <Link href={`/post/${post.id}`}>
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : hasVideo ? (
                        <video
                          src={`${post.videoUrl}#t=0.001`}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                          onLoadedMetadata={(e) => { (e.currentTarget as HTMLVideoElement).currentTime = 0.001; }}
                        />
                      ) : null}
                      {/* Location overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-2 px-2 rounded-b-xl">
                        <p className="text-white font-semibold text-xs drop-shadow truncate">{post.location}</p>
                      </div>
                    </div>
                  </Link>
                  {isOwner && (
                    <button
                      onClick={() => openPostEdit(post)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">No posts yet.</p>
            {isOwner && (
              <Link
                href="/create"
                className="inline-block mt-3 px-5 py-2.5 bg-sky-500 text-white rounded-full text-sm font-bold hover:bg-sky-600 transition-colors"
              >
                Create your first post
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Profile modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Bio</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={160}
                placeholder="Tell people about yourself..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <p className="text-[10px] text-slate-400 mt-0.5 text-right">{editBio.length}/160</p>
            </div>

            <p className="text-xs text-slate-400">Tap your profile photo or cover image to change them.</p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Post modal ── */}
      {editPostId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditPostId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Post</h3>
              <button onClick={() => setEditPostId(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                <input value={editPostTitle} onChange={(e) => setEditPostTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <textarea rows={3} value={editPostDesc} onChange={(e) => setEditPostDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                <input value={editPostLocation} onChange={(e) => setEditPostLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                <select value={editPostCategory} onChange={(e) => setEditPostCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="hotel">Hotel</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="destination">Destination</option>
                  <option value="flight">Flight</option>
                  <option value="activity">Activity</option>
                  <option value="cruise">Cruise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Expedia URL</label>
                <input value={editPostExpediaUrl} onChange={(e) => setEditPostExpediaUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditPostId(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handlePostEditSave} disabled={editPostSaving || !editPostTitle.trim()} className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {editPostSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
