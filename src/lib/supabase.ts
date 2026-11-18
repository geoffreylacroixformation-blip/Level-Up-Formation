import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
} else {
  console.warn('⚠️ Variables d\'environnement Supabase non configurées');
}

export const supabase = _supabase;

// Helpers de type pour les tables Supabase
export type Profile = {
  id: string;
  email: string;
  role: string;
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
  user_id: string;
  course_slug: string;
  progress: number | null;
  completed: boolean;
  purchased_at: string;
};

export type Progression = {
  user_id: string;
  courses_id: string;
  module_id: string;
  completed: boolean | null;
  quiz_score: number | null;
};

// Gestionnaires d'erreurs centralisés
function handleDbError(error: unknown, context: string): null {
  const message = error instanceof Error ? error.message : 'Erreur inconnue';
  console.error(`❌ [DB] ${context}: ${message}`);
  return null;
}

function handleDbErrorArray<T>(error: unknown, context: string): T[] {
  const message = error instanceof Error ? error.message : 'Erreur inconnue';
  console.error(`❌ [DB] ${context}: ${message}`);
  return [] as T[];
}

/** Retourne le client Supabase ou null */
function getClient(): ReturnType<typeof createClient> | null {
  if (!_supabase) {
    console.warn('⚠️ Client Supabase non initialisé');
  }
  return _supabase;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const client = getClient();
  if (!client) return null;
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return handleDbError(error, `getProfile(${userId})`);
  return data as Profile | null;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const client = getClient();
  if (!client) return null;
  const { data, error } = await client
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return handleDbError(error, `getCourseBySlug(${slug})`);
  return data as Course | null;
}

export async function getAllCourses(): Promise<Course[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from('courses')
    .select('*')
    .order('level', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return handleDbErrorArray<Course>(error, 'getAllCourses');
  return data as Course[];
}

export async function getUserCourses(userId: string): Promise<UserCourse[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from('users_courses')
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });
  if (error) return handleDbErrorArray<UserCourse>(error, `getUserCourses(${userId})`);
  return data as UserCourse[];
}

export async function hasPurchasedCourse(userId: string, courseSlug: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const { data, error } = await client
    .from('users_courses')
    .select('id')
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
    .maybeSingle();
  if (error) return handleDbError(error, `hasPurchasedCourse(${userId}, ${courseSlug})`) ? true : false;
  return !!data;
}

export async function updateUserProgress(
  userId: string,
  courseSlug: string,
  progress: number
): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const { error } = await client
    .from('users_courses')
    .upsert(
      { user_id: userId, course_slug: courseSlug, progress },
      { onConflict: 'user_id,course_slug' }
    );
  if (error) {
    console.error(`❌ [DB] updateUserProgress: ${error.message}`);
    return false;
  }
  return true;
}

export async function createProfile(userId: string, email: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const { data: existing, error: existingError } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (existingError) {
    console.error(`❌ [DB] createProfile (check): ${existingError.message}`);
    return false;
  }
  if (existing) return true;

  const { error } = await client
    .from('profiles')
    .insert({ id: userId, email, role: 'user' });
  if (error) {
    console.error(`❌ [DB] createProfile: ${error.message}`);
    return false;
  }
  return true;
}

export async function setAdminRole(userId: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  const { error } = await client
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);
  if (error) {
    console.error(`❌ [DB] setAdminRole: ${error.message}`);
    return false;
  }
  return true;
}
