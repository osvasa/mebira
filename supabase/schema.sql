-- Mebira Database Schema
-- Run in the Supabase SQL Editor: https://supabase.com/dashboard/project/dmwlqseijbodocrxmhwu/sql

-- ============================================================
-- MIGRATION (run once on existing databases before seed.sql)
-- ============================================================
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
-- ALTER TABLE public.posts ALTER COLUMN user_id DROP NOT NULL;
-- ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
-- ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  avatar      TEXT,
  bio         TEXT DEFAULT '',
  followers   INTEGER DEFAULT 0,
  earnings    NUMERIC(10, 2) DEFAULT 0.00,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are publicly viewable"
  ON public.users FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own record"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  photo_url      TEXT,
  location       TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('apartment', 'house', 'villa', 'commercial', 'land', 'rental')),
  agoda_hotel_id TEXT,
  likes          INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are publicly viewable"
  ON public.posts FOR SELECT USING (TRUE);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are publicly viewable"
  ON public.likes FOR SELECT USING (TRUE);

CREATE POLICY "Users can like posts"
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Keep posts.likes count in sync
CREATE OR REPLACE FUNCTION sync_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_post_likes_trigger ON public.likes;
CREATE TRIGGER sync_post_likes_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION sync_post_likes();

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are publicly viewable"
  ON public.follows FOR SELECT USING (TRUE);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Keep users.followers count in sync
CREATE OR REPLACE FUNCTION sync_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users SET followers = followers + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users SET followers = GREATEST(followers - 1, 0) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_follower_count_trigger ON public.follows;
CREATE TRIGGER sync_follower_count_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION sync_follower_count();

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id           UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert bookings"
  ON public.bookings FOR INSERT WITH CHECK (TRUE);

-- Keep users.earnings in sync when a booking is recorded
CREATE OR REPLACE FUNCTION sync_user_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Credit earnings to the post's creator
    UPDATE public.users
    SET earnings = earnings + NEW.commission_amount
    WHERE id = (SELECT user_id FROM public.posts WHERE id = NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_user_earnings_trigger ON public.bookings;
CREATE TRIGGER sync_user_earnings_trigger
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION sync_user_earnings();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_user_id   ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created   ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id   ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id   ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_bookings_post_id  ON public.bookings(post_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id  ON public.bookings(user_id);
