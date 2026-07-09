-- ============================================================
-- Migration: Unify schema — migrate cours->courses, progression->users_courses
-- ============================================================

-- 1. Migrate data from old 'cours' table to 'courses' if courses is empty
INSERT INTO courses (id, slug, title, description, level, price, image, modules, stripe_product_id, stripe_price_id, created_at, updated_at)
SELECT 
  COALESCE((SELECT id FROM courses LIMIT 1, gen_random_uuid()), gen_random_uuid()),
  slug,
  titre,
  NULL,
  CASE niveau 
    WHEN 'LVL1' THEN 1 
    WHEN 'LVL2' THEN 2 
    WHEN 'LVL3' THEN 3 
    ELSE 1 
  END,
  prix::numeric,
  NULL,
  COALESCE(modules, '[]'::jsonb),
  NULL,
  NULL,
  created_at,
  created_at
FROM cours
WHERE NOT EXISTS (SELECT 1 FROM courses LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

-- 2. Migrate data from old 'progression' table to 'users_courses'
INSERT INTO users_courses (user_id, course_slug, progress, completed, purchased_at)
SELECT 
  p.user_id,
  c.slug,
  0,
  p.completed,
  NOW()
FROM progression p
LEFT JOIN courses c ON c.id = p.cours_id
WHERE c.slug IS NOT NULL
ON CONFLICT (user_id, course_slug) DO NOTHING;

-- 3. Drop old tables (safe to drop if data migrated)
DROP TABLE IF EXISTS progression;
DROP TABLE IF EXISTS cours;

-- 4. Add RLS policies for courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses visibles par tous" ON courses FOR SELECT USING (true);
CREATE POLICY "Admins manage courses" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Add RLS for users_courses
ALTER TABLE users_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own enrollments" ON users_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own enrollments" ON users_courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all enrollments" ON users_courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Add RLS for courses_modules
ALTER TABLE courses_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules visibles par tous" ON courses_modules FOR SELECT USING (true);
CREATE POLICY "Admins manage modules" ON courses_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
