-- CLICK TRACKING TABLE
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  creator_username TEXT,
  post_title TEXT,
  post_location TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  agoda_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_click_tracking_creator ON click_tracking(creator_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_clicked_at ON click_tracking(clicked_at);

ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to insert (the API route runs with user's session)
CREATE POLICY "Authenticated users can insert clicks" ON click_tracking
  FOR INSERT WITH CHECK (true);

-- Admin can read all clicks
CREATE POLICY "Admin can read clicks" ON click_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'osvasasite@proton.me')
  );

-- Also allow anonymous inserts (visitors who aren't logged in clicking Go There)
CREATE POLICY "Anyone can insert clicks" ON click_tracking
  FOR INSERT WITH CHECK (true);
