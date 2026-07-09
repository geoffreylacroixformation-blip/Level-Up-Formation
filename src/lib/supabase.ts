import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase environment variables not configured');
}

export const supabase = _supabase;

export type Profile = {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: number;
  price: number;
  image: string | null;
  modules: any[];
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
};

export type UserCourse = {
  id: string;
  user_id: string;
  course_slug: string;
  progress: number | null;
  completed: boolean;
  purchased_at: string;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const client = supabase;
  if (!client) return null;
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const client = supabase;
  if (!client) return null;
  const { data, error } = await client
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return null;
  return data as Course;
}

export async function getAllCourses(): Promise<Course[]> {
  const client = supabase;
  if (!client) return [];
  const { data, error } = await client
    .from('courses')
    .select('*')
    .order('level', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return [];
  return data as Course[];
}

export async function getUserCourses(userId: string): Promise<UserCourse[]> {
  const client = supabase;
  if (!client) return [];
  const { data, error } = await client
    .from('users_courses')
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });
  if (error) return [];
  return data as UserCourse[];
}

export async function hasPurchasedCourse(userId: string, courseSlug: string): Promise<boolean> {
  const client = supabase;
  if (!client) return false;
  const { data, error } = await client
    .from('users_courses')
    .select('id')
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
    .single();
  if (error) return false;
  return !!data;
}

export async function updateUserProgress(
  userId: string,
  courseSlug: string,
  progress: number
): Promise<boolean> {
  const client = supabase;
  if (!client) return false;
  const { error } = await client
    .from('users_courses')
    .upsert(
      { user_id: userId, course_slug: courseSlug, progress },
      { onConflict: 'user_id,course_slug' }
    );
  return !error;
}

export async function createProfile(userId: string, email: string): Promise<boolean> {
  const client = supabase;
  if (!client) return false;
  const { data: existing } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();
  if (existing) return true;

  const { error } = await client
    .from('profiles')
    .insert({ id: userId, email, role: 'user' });
  return !error;
}

export async function setAdminRole(userId: string): Promise<boolean> {
  const client = supabase;
  if (!client) return false;
  const { error } = await client
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);
  return !error;
}
