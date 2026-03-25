import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

async function isAdmin() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return false;
  return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// Service role client — bypasses RLS for reading click_tracking
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — click tracking data for admin dashboard
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = createServiceClient();

  // Get all clicks
  const { data: clicks, error } = await supabase
    .from('click_tracking')
    .select('*')
    .order('clicked_at', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get creator avatars
  const creatorIds = Array.from(new Set((clicks ?? []).map((c) => c.creator_id).filter(Boolean)));
  let avatarMap: Record<string, string | null> = {};
  if (creatorIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, avatar')
      .in('id', creatorIds);
    avatarMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.avatar]));
  }

  return NextResponse.json({ clicks: clicks ?? [], avatarMap });
}
