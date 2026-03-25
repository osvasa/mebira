'use client';

import { useState, useEffect, useCallback } from 'react';
// import { useRef } from 'react'; // uncomment when re-enabling file upload
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  ArrowLeft,
  X,
  Video,
  Sparkles,
  Loader2,
  CheckCircle2,
  // LinkIcon,   // uncomment when re-enabling file upload tab
  // FileVideo,  // uncomment when re-enabling file upload tab
  AlertCircle,
  PenLine,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PostCategory } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { EXPEDIA_URL } from '@/lib/agoda';

// type VideoInputMode = 'url' | 'file'; // uncomment when re-enabling file upload

export default function CreatePostPage() {
  const router = useRouter();
  const supabase = createClient();
  // const fileInputRef = useRef<HTMLInputElement>(null); // uncomment when re-enabling file upload

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // "Post as creator" mode (admin only)
  const [postingAsId, setPostingAsId] = useState<string | null>(null);
  const [postingAsName, setPostingAsName] = useState<string | null>(null);

  // Video
  // const [videoInputMode, setVideoInputMode] = useState<VideoInputMode>('url'); // uncomment when re-enabling file upload
  const [videoUrl, setVideoUrl] = useState('');
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [, setVideoPlatform] = useState<string | null>(null);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [, setUploadProgress] = useState<number>(0);

  // AI-generated fields (editable by user)
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('destination');
  const [expediaUrl, setExpediaUrl] = useState('');
  const [startingPrice, setStartingPrice] = useState<number | null>(null);

  // File upload: user-provided place name — uncomment when re-enabling file upload
  // const [fileLocation, setFileLocation] = useState('');

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Auth check on mount + "post as" check ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/login?redirect=/create');
      } else {
        setUserId(data.user.id);

        // Check if admin is posting as another creator
        const storedId = localStorage.getItem('posting_as_user_id');
        const storedName = localStorage.getItem('posting_as_name');
        if (storedId && storedName) {
          setPostingAsId(storedId);
          setPostingAsName(storedName);
        }
      }
      setAuthChecked(true);
    });
  }, [router, supabase.auth]);

  // ── Auto-set Expedia link from location ──
  const buildExpediaLink = useCallback((loc: string) => {
    if (!loc.trim()) return;
    setExpediaUrl(EXPEDIA_URL);
  }, []);

  // ── AI generation (auto-triggered after video process) ──
  const runAiGenerate = useCallback(async (sourceUrl: string, platform: string | null, locationHint?: string) => {
    console.log('[create] runAiGenerate called with:', sourceUrl, platform, 'locationHint:', locationHint);
    setAiGenerating(true);
    try {
      console.log('[create] fetching /api/ai/generate-post...');
      const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl, platform, locationHint: locationHint || undefined }),
      });
      console.log('[create] AI response status:', res.status);
      const data = await res.json();
      console.log('[create] AI response data:', JSON.stringify(data));
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.category) setSelectedCategory(data.category);
      if (data.location) {
        setLocation(data.location);
        // Use Expedia URL from AI response, fallback to default
        if (data.expediaUrl) {
          setExpediaUrl(data.expediaUrl);
        } else {
          buildExpediaLink(data.location);
        }
      }
      if (data.startingPrice != null) {
        setStartingPrice(data.startingPrice);
      }
      setAiGenerated(true);
      console.log('[create] AI generation complete, aiGenerated=true');
    } catch (err) {
      console.error('[create] AI generation error:', err);
    } finally {
      setAiGenerating(false);
    }
  }, [buildExpediaLink]);

  // ── Process video from URL ──
  const handleProcessVideo = async () => {
    if (!videoUrl.trim()) return;
    setVideoProcessing(true);
    setVideoError(null);
    try {
      const res = await fetch('/api/video/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVideoError(data.error || 'Failed to process video. Check the URL and try again.');
        return;
      }
      console.log('[create] video processed OK, url:', data.url, 'platform:', data.platform, 'thumbnail:', data.thumbnail_url);
      setProcessedVideoUrl(data.url);
      setThumbnailUrl(data.thumbnail_url || null);
      setVideoPlatform(data.platform);
      console.log('[create] triggering AI generation...');
      runAiGenerate(videoUrl.trim(), data.platform);
    } catch (err) {
      console.error('[create] video process error:', err);
      setVideoError(`Network error: ${err instanceof Error ? err.message : 'Could not reach server'}`);
    } finally {
      setVideoProcessing(false);
    }
  };

  // ── Upload video file via presigned R2 URL (bypasses Vercel 4.5MB limit) ──
  // Commented out — uncomment when re-enabling file upload
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setVideoError(`"${file.name}" is not a video file. Please select an MP4, MOV, or WebM file.`);
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setVideoError(`File is ${Math.round(file.size / 1024 / 1024)}MB. Maximum size is 100MB.`);
      return;
    }
    setVideoProcessing(true);
    setVideoError(null);
    setUploadProgress(0);
    try {
      // Step 1: Get presigned upload URL from our API
      const presignRes = await fetch('/api/video/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        setVideoError(data.error || `Failed to prepare upload (${presignRes.status})`);
        setVideoProcessing(false);
        return;
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // Step 2: Upload file directly to R2 via XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });

      // Step 3: Use the public URL
      console.log('[create] file upload complete, publicUrl:', publicUrl);
      setUploadProgress(100);
      setProcessedVideoUrl(publicUrl);
      setVideoPlatform('upload');
      console.log('[create] triggering AI generation for file upload');
      runAiGenerate(file.name, 'upload');
    } catch (err) {
      setVideoError(`Upload failed: ${err instanceof Error ? err.message : 'Network error. Check your connection and try again.'}`);
    } finally {
      setVideoProcessing(false);
    }
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !processedVideoUrl) return;

    setSubmitting(true);
    setSubmitError(null);

    const effectiveUserId = postingAsId || userId;

    try {
      const { error } = await supabase.from('posts').insert({
        user_id: effectiveUserId,
        title: title.trim() || 'Travel Recommendation',
        description: description.trim(),
        photo_url: thumbnailUrl || null,
        video_url: processedVideoUrl,
        location: location.trim() || 'Unknown',
        category: selectedCategory,
        expedia_url: expediaUrl || null,
        starting_price: startingPrice,
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      // Clear "post as" state and redirect
      if (postingAsId) {
        localStorage.removeItem('posting_as_user_id');
        localStorage.removeItem('posting_as_name');
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch {
      setSubmitError('Failed to publish post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset video and all AI fields
  const handleRemoveVideo = () => {
    setProcessedVideoUrl(null);
    setThumbnailUrl(null);
    setVideoPlatform(null);
    setUploadProgress(0);
    setAiGenerated(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedCategory('destination');
    setExpediaUrl('');
    setStartingPrice(null);
  };

  // ── Loading state ──
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    );
  }

  const canSubmit = processedVideoUrl && !submitting && !aiGenerating;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to feed
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Share a Recommendation</h1>
          <p className="text-slate-500 text-sm mt-1">
            Paste your video link and we&apos;ll handle the rest with AI.
          </p>
        </div>

        {/* "Posting as" banner for admin */}
        {postingAsName && (
          <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-5">
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-bold text-violet-800">
                Posting as <span className="text-violet-600">{postingAsName}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('posting_as_user_id');
                localStorage.removeItem('posting_as_name');
                setPostingAsId(null);
                setPostingAsName(null);
              }}
              className="text-xs text-violet-500 hover:text-violet-700 font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Video Input ── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-slate-900 mb-1">
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-500" />
                Your Video
              </span>
            </label>
            <p className="text-xs text-slate-400 mb-4">
              Paste a TikTok link and AI will generate your post
            </p>

            {/* URL input */}
            {!processedVideoUrl && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste your TikTok link here"
                  className="input flex-1 font-mono text-xs"
                  disabled={videoProcessing}
                />
                <button
                  type="button"
                  onClick={handleProcessVideo}
                  disabled={videoProcessing || !videoUrl.trim()}
                  className="px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {videoProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Go
                    </>
                  )}
                </button>
              </div>
            )}

            {/* File upload mode — hidden for now, TikTok URL only
            {videoInputMode === 'file' && !processedVideoUrl && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Where is this? <span className="text-slate-400 font-normal">(hotel, restaurant, destination)</span>
                  </label>
                  <input
                    type="text"
                    value={fileLocation}
                    onChange={(e) => setFileLocation(e.target.value)}
                    placeholder="e.g. Four Seasons Bali, Nobu Malibu, Santorini"
                    className="input text-sm"
                    disabled={videoProcessing}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                {videoProcessing ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-sky-200 rounded-xl bg-sky-50/30">
                    <Upload className="w-8 h-8 text-sky-500 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Uploading video… {uploadProgress}%</p>
                    <div className="w-48 h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Uploading directly to storage</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl hover:border-sky-300 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <FileVideo className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-600">
                      Click to select a video file
                    </p>
                    <p className="text-xs text-slate-400 mt-1">MP4, MOV, WebM up to 100MB</p>
                  </button>
                )}
              </div>
            )}
            */}

            {/* Error */}
            {videoError && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-600">{videoError}</p>
              </div>
            )}

            {/* Video preview */}
            {processedVideoUrl && (
              <div>
                <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[400px] bg-black mx-auto w-fit">
                  <video
                    src={processedVideoUrl}
                    autoPlay
                    muted
                    playsInline
                    loop
                    className="h-full w-auto mx-auto"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <p className="text-xs text-teal-600 font-medium">
                    Video ready
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── AI status ── */}
          {aiGenerating && (
            <div className="bg-gradient-to-r from-violet-50 to-sky-50 border border-violet-100 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900">AI is analyzing your content…</p>
                  <p className="text-xs text-slate-500 mt-0.5">Extracting metadata and generating post details</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Editable AI-generated fields ── */}
          {aiGenerated && !aiGenerating && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <p className="text-sm font-bold text-slate-900">AI-Generated Details</p>
                <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">editable</span>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  className="input text-sm"
                  placeholder="e.g. Stunning Rooftop Pool in Bali"
                />
                <p className="text-[10px] text-slate-400 mt-0.5 text-right">{title.length}/60</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  className="input resize-none text-sm"
                  placeholder="First-person description of your experience…"
                />
                <p className="text-[10px] text-slate-400 mt-0.5 text-right">{description.length}/200</p>
              </div>

              {/* Location + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      buildExpediaLink(e.target.value);
                    }}
                    className="input text-sm"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as PostCategory)}
                    className="input text-sm"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="destination">Destination</option>
                    <option value="flight">Flight</option>
                    <option value="activity">Activity</option>
                    <option value="cruise">Cruise</option>
                  </select>
                </div>
              </div>

              {/* Expedia link */}
              {expediaUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                  <p className="text-[10px] text-teal-600 font-medium">Expedia booking link auto-generated</p>
                </div>
              )}
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-600">{submitError}</p>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex gap-3 pb-8">
            <Link
              href="/"
              className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-2 flex-grow-[2] py-3 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:from-sky-600 hover:to-teal-600 transition-all shadow-md shadow-sky-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
