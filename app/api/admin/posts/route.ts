import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function isAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return false;
  return data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// GET — list posts for a specific user
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, description, location, category, created_at, photo_url, expedia_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

// PATCH — update a post by ID (admin)
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { postId, title, description, location, category, expedia_url, price, bedrooms, bathrooms, size_sqft, property_features } = body;

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 });
  }

  const admin = getAdminSupabase();
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (category !== undefined) updateData.category = category;
  if (expedia_url !== undefined) updateData.expedia_url = expedia_url;
  if (price !== undefined) updateData.price = price;
  if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
  if (bathrooms !== undefined) updateData.bathrooms = bathrooms;
  if (size_sqft !== undefined) updateData.size_sqft = size_sqft;
  if (property_features !== undefined) updateData.property_features = property_features;

  const { error } = await admin
    .from('posts')
    .update(updateData)
    .eq('id', postId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — delete a post by ID
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { postId } = body;

  if (!postId) {
    return NextResponse.json({ error: 'postId required' }, { status: 400 });
  }

  const admin = getAdminSupabase();
  const { error } = await admin
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
