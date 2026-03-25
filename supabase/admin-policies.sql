-- ADMIN RLS POLICIES
-- Run this in Supabase SQL Editor AFTER invite-system.sql
-- These allow the admin to create posts for other users and create AI creator profiles

-- 1. Admin can insert posts for any user (for "Post as creator" feature)
CREATE POLICY "Admin can create posts for any user"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'osvasasite@proton.me')
  );

-- 2. Admin can insert users (for creating AI creator profiles)
CREATE POLICY "Admin can create users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'osvasasite@proton.me')
  );

-- 3. Admin can update any user (for managing AI creator profiles)
CREATE POLICY "Admin can update any user"
  ON public.users FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'osvasasite@proton.me')
  );
