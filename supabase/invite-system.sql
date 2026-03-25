-- INVITE SYSTEM TABLES
-- Run this in Supabase SQL Editor

-- 1. Invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  creator_name TEXT NOT NULL,
  tiktok_profile TEXT,
  content_type TEXT DEFAULT 'travel',
  created_by_admin BOOLEAN DEFAULT true,
  used BOOLEAN DEFAULT false,
  used_by_user_id UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Invite requests table
CREATE TABLE IF NOT EXISTS invite_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  tiktok_profile TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'travel',
  travel_style TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  invite_code_id UUID REFERENCES invite_codes(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add profile_complete column to users table (for setup flow)
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;

-- 4. Enable RLS
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for invite_codes
CREATE POLICY "Anyone can validate invite codes" ON invite_codes
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage invite codes" ON invite_codes
  FOR ALL USING (true);

-- 6. RLS policies for invite_requests
CREATE POLICY "Anyone can create invite requests" ON invite_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage invite requests" ON invite_requests
  FOR ALL USING (true);

-- 7. Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_requests_status ON invite_requests(status);
