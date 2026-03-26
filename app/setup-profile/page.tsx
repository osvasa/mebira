'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

export default function SetupProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/auth/login');
        return;
      }
      setUserId(data.user.id);

      // Check if already set up
      const { data: userData } = await supabase
        .from('users')
        .select('username, profile_complete')
        .eq('id', data.user.id)
        .maybeSingle();

      if (userData?.profile_complete) {
        router.push(`/profile/${userData.username}`);
        return;
      }

      if (userData?.username) setUsername(userData.username);
    });
  }, [supabase, router]);

  async function uploadImage(file: File, folder: 'avatars' | 'covers'): Promise<string | null> {
    const presignRes = await fetch('/api/upload/image-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
    });
    if (!presignRes.ok) return null;
    const { uploadUrl, publicUrl, error } = await presignRes.json();
    if (error || !uploadUrl) return null;

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) return null;
    return publicUrl;
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleComplete() {
    if (!userId) return;
    setError('');
    setSaving(true);

    try {
      let avatarUrl: string | null = null;
      let coverUrl: string | null = null;

      if (avatarFile) {
        setUploading('Uploading profile photo...');
        avatarUrl = await uploadImage(avatarFile, 'avatars');
        if (!avatarUrl) { setError('Failed to upload profile photo.'); setSaving(false); setUploading(''); return; }
      }

      if (coverFile) {
        setUploading('Uploading cover image...');
        coverUrl = await uploadImage(coverFile, 'covers');
        if (!coverUrl) { setError('Failed to upload cover image.'); setSaving(false); setUploading(''); return; }
      }

      setUploading('Saving profile...');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {
        bio: bio.trim(),
        profile_complete: true,
      };
      if (avatarUrl) updates.avatar = avatarUrl;
      if (coverUrl) updates.cover_image = coverUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (updateError) {
        setError('Failed to save profile. Please try again.');
        setSaving(false);
        setUploading('');
        return;
      }

      router.push(`/profile/${username}`);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
      setUploading('');
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#C8102E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Set up your profile</h1>
          <p className="text-slate-500 text-sm">Make a great first impression on the community</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Cover image area */}
          <div
            className="relative h-32 cursor-pointer group"
            style={{ background: coverPreview ? undefined : 'linear-gradient(135deg, #C8102E 0%, #14b8a6 100%)' }}
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Camera className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">
                  {coverPreview ? 'Change Cover' : 'Add Cover Photo'}
                </span>
              </div>
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
          </div>

          {/* Avatar */}
          <div className="px-6 -mt-10 relative z-10">
            <div
              className="relative w-20 h-20 rounded-2xl bg-slate-200 ring-4 ring-white shadow-lg overflow-hidden cursor-pointer group"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#C8102E] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>
          </div>

          {/* Bio */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself and your travel style..."
                maxLength={160}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <p className="text-[10px] text-slate-400 mt-0.5 text-right">{bio.length}/160</p>
            </div>

            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D9B4E] hover:bg-[#258442] text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-green-100 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploading || 'Saving...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Setup
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          You can always update these later from your profile page.
        </p>
      </div>
    </div>
  );
}
