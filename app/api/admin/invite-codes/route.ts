import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

async function isAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return false;
  return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// GET — list all invite codes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}

// POST — generate a new invite code manually
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { creatorName, tiktokProfile, contentType } = body;

  if (!creatorName) {
    return NextResponse.json({ error: 'Realtor name is required' }, { status: 400 });
  }

  const code = `MEBIRA-${randomBytes(3).toString('hex').toUpperCase()}`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      creator_name: creatorName,
      tiktok_profile: tiktokProfile || null,
      content_type: contentType || 'travel',
      created_by_admin: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data });
}
