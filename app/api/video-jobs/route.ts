import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { photo_urls, listing } = body as { photo_urls?: string[]; listing?: Record<string, unknown> };

    if (!photo_urls || !Array.isArray(photo_urls) || photo_urls.length < 3 || photo_urls.length > 10) {
      return NextResponse.json(
        { error: 'Provide between 3 and 10 photo URLs.' },
        { status: 400 },
      );
    }

    if (!listing || typeof listing !== 'object') {
      return NextResponse.json(
        { error: 'A listing object is required.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('video_jobs')
      .insert({
        user_id: user.id,
        listing,
        photo_urls,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[video-jobs] insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ job_id: data.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing job id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
