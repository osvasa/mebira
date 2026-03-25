import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { user_id, title, description, photo_url, video_url, location, category, expedia_url, photo_urls, price, bedrooms, bathrooms, size_sqft, property_features } = body;

    if (!title || !location || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user_id matches the authenticated user (or is admin)
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isAdmin = user.email === adminEmail;
    if (user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Cannot create post for another user' }, { status: 403 });
    }

    // Use service role key to bypass RLS
    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminClient
      .from('posts')
      .insert({
        user_id,
        title,
        description: description || '',
        photo_url: photo_url || null,
        video_url: video_url || null,
        location,
        category,
        expedia_url: expedia_url || null,
        ...(photo_urls && photo_urls.length > 0 ? { photo_urls } : {}),
        ...(price ? { price } : {}),
        ...(bedrooms != null ? { bedrooms } : {}),
        ...(bathrooms != null ? { bathrooms } : {}),
        ...(size_sqft != null ? { size_sqft } : {}),
        ...(property_features && property_features.length > 0 ? { property_features } : {}),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
