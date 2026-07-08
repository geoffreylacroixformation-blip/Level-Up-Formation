-- ============================================================
-- Migration: Remove redundant user_id column from profiles
-- ============================================================

-- The profiles table has a user_id column that was added manually
-- in the Supabase dashboard but is redundant because 'id' already
-- references auth.users(id). This caused INSERT failures when
-- clients only set 'id' (not 'user_id').

-- Drop the redundant column
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles DROP COLUMN user_id;
    END IF;
END $$;
