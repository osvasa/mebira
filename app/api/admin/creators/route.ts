import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

async function isAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return false;
  return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// GET — list creators (real or AI)
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'real';

  // Get IDs of users who signed up via invite code
  const { data: usedCodes } = await supabase
    .from('invite_codes')
    .select('used_by_user_id')
    .eq('used', true)
    .not('used_by_user_id', 'is', null);

  const realCreatorIds = new Set(
    (usedCodes ?? []).map((c) => c.used_by_user_id).filter(Boolean)
  );

  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, email, avatar, bio, followers, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get post counts per user
  const { data: posts } = await supabase.from('posts').select('user_id');
  const countMap: Record<string, number> = {};
  (posts ?? []).forEach((p) => {
    countMap[p.user_id] = (countMap[p.user_id] || 0) + 1;
  });

  // Filter: real = signed up via invite code, ai = everyone else
  const filtered = (users ?? [])
    .filter((u) => (type === 'real' ? realCreatorIds.has(u.id) : !realCreatorIds.has(u.id)))
    .map((u) => ({
      ...u,
      post_count: countMap[u.id] || 0,
    }));

  return NextResponse.json({ creators: filtered });
}

// POST — create AI creator profile
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { username, bio, avatar } = body;

  if (!username?.trim()) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const id = randomUUID();
  const email = `${username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')}@ai.mebira.local`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      id,
      email,
      username: username.trim(),
      avatar: avatar?.trim() || null,
      bio: bio?.trim() || '',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ creator: data });
}
