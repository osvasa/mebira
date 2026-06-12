-- Comments table for post discussions
-- Referenced by: components/post/CommentsSection.tsx, app/post/[id]/page.tsx

CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL,
  user_id    uuid NOT NULL,
  text       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);

-- Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone (even logged out) can read all comments
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

-- Only authenticated users can insert a comment, and only as themselves
CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update only their own comments (in case we add edit later)
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
