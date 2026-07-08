-- ============================================================
-- Migration: Add admin, courses, and enrollment tables
-- ============================================================

-- 1. profiles table (for admin role management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (needed for auth verification)
CREATE POLICY "Profiles visibles par tous" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Only admins can insert/update profiles (for setting roles)
CREATE POLICY "Admins manage profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. courses table (admin course catalog)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level IN (1, 2, 3)),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  modules JSONB DEFAULT '[]'::jsonb,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Everyone can read courses
CREATE POLICY "Courses visibles par tous" ON courses
  FOR SELECT USING (true);

-- Only admins can manage courses
CREATE POLICY "Admins manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. courses_modules table (module details for courses)
CREATE TABLE IF NOT EXISTS courses_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL REFERENCES courses(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  content TEXT,
  quiz JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE courses_modules ENABLE ROW LEVEL SECURITY;

-- Everyone can read modules
CREATE POLICY "Modules visibles par tous" ON courses_modules
  FOR SELECT USING (true);

-- Only admins can manage modules
CREATE POLICY "Admins manage modules" ON courses_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. users_courses table (enrollments)
CREATE TABLE IF NOT EXISTS users_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL REFERENCES courses(slug) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_slug)
);

ALTER TABLE users_courses ENABLE ROW LEVEL SECURITY;

-- Users can read their own enrollments
CREATE POLICY "Users read own enrollments" ON users_courses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own enrollments
CREATE POLICY "Users update own enrollments" ON users_courses
  FOR UPDATE USING (auth.uid() = user_id);

-- Only admins can manage enrollments
CREATE POLICY "Admins manage enrollments" ON users_courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- 6. Trigger for updated_at on courses
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

-- 7. Seed: create admin profile for jo@levelup-formation.fr
-- Note: This requires the user to exist in auth.users first
-- The admin must set their role manually after creating the account
-- OR use the Supabase dashboard to set role = 'admin' for their profile
