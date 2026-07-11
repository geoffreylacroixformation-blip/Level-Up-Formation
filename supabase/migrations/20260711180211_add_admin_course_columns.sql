/*
# Add missing columns to courses table for admin CRUD

## Summary
The admin dashboard needs to create, modify, and delete courses with rich metadata
(bilingual titles/descriptions, category, tags, competences, target audience,
prerequisites, duration, image URL). The current `courses` table only has
basic columns (id, slug, title, niveau, prix, description, modules, etc.).
This migration adds the missing columns so the admin can store full course data.

## Changes
1. New columns on `courses`:
   - `title_en` (text) — English title
   - `description_en` (text) — English short description
   - `long_description` (text) — French long description
   - `long_description_en` (text) — English long description
   - `level` (integer) — numeric level (1, 2, 3) to complement existing `niveau` text
   - `price` (numeric) — decimal price to complement existing `prix` integer
   - `image` (text) — course image URL
   - `category` (text) — course category
   - `tags` (jsonb, default '[]') — array of tags
   - `competences` (jsonb, default '[]') — array of skills
   - `public_cible` (text) — target audience
   - `prerequis` (text) — prerequisites
   - `duree_heures` (integer) — total duration in hours
   - `updated_at` (timestamptz, default now()) — last modification timestamp

2. Backfill: set `level` from `niveau` and `price` from `prix` for existing rows.

3. Trigger: auto-update `updated_at` on row modification.

## Security
No RLS policy changes — existing policies already cover admin CRUD via is_admin check.
*/

-- Add missing columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS long_description text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS long_description_en text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level integer;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price numeric(10,2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS competences jsonb DEFAULT '[]'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS public_cible text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequis text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duree_heures integer;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill level from niveau and price from prix
UPDATE courses SET level = 1 WHERE niveau = 'LVL1' AND level IS NULL;
UPDATE courses SET level = 2 WHERE niveau = 'LVL2' AND level IS NULL;
UPDATE courses SET level = 3 WHERE niveau = 'LVL3' AND level IS NULL;
UPDATE courses SET price = prix WHERE price IS NULL AND prix IS NOT NULL;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS courses_updated_at ON courses;
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();