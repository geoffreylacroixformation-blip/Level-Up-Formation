-- ============================================================
-- Migration: Backfill profiles for existing auth.users
-- ============================================================

-- Create profiles for all existing users that don't have one yet
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
ON CONFLICT (email) DO NOTHING;
