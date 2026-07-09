-- ============================================================
-- Migration: Remove user_id from profiles (with RLS policies)
-- ============================================================

-- Drop policies that depend on user_id
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Now remove the column
ALTER TABLE profiles DROP COLUMN user_id;
