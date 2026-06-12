-- Video generation jobs table.
-- A row is inserted when a user requests a listing video from photos.
-- A rendering worker picks up queued rows, produces the video, and updates status.

CREATE TABLE IF NOT EXISTS video_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued', 'rendering', 'done', 'failed')),
  listing       jsonb NOT NULL,
  photo_urls    text[] NOT NULL,
  video_url     text,
  thumbnail_url text,
  error         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz
);

CREATE INDEX IF NOT EXISTS video_jobs_status_created_idx
  ON video_jobs (status, created_at);

ALTER TABLE video_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own jobs"
  ON video_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own jobs"
  ON video_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
