-- Hand-written companion: Drizzle has no schema representation for
-- Supabase Storage buckets. supabase/config.toml declares this bucket for
-- local dev reset parity; this migration provisions it on remote.
--
-- Uploads and reads go through signed URLs minted server-side by the service
-- role, so no storage.objects RLS policies are needed for the admin flow.

INSERT INTO storage.buckets (id, name, public)
  VALUES ('lesson-audio', 'lesson-audio', false)
  ON CONFLICT (id) DO NOTHING;
