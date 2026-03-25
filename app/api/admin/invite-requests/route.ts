import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

async function isAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return false;
  return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// GET — list all invite requests
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? 'pending';

  const { data, error } = await supabase
    .from('invite_requests')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data });
}

// POST — approve or reject a request
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { requestId, action } = body;

  if (!requestId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = await createClient();

  if (action === 'reject') {
    await supabase
      .from('invite_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);
    return NextResponse.json({ success: true });
  }

  // Approve: generate invite code
  const { data: request } = await supabase
    .from('invite_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const code = `OSVASA-${randomBytes(3).toString('hex').toUpperCase()}`;

  const { data: inviteCode, error: codeError } = await supabase
    .from('invite_codes')
    .insert({
      code,
      creator_name: request.full_name,
      tiktok_profile: request.tiktok_profile,
      content_type: request.content_type,
      created_by_admin: true,
    })
    .select('id')
    .single();

  if (codeError) {
    return NextResponse.json({ error: codeError.message }, { status: 500 });
  }

  await supabase
    .from('invite_requests')
    .update({ status: 'approved', invite_code_id: inviteCode.id })
    .eq('id', requestId);

  return NextResponse.json({ success: true, code });
}
