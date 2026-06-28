import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  purchased_courses: string[];
  badges: string[];
  created_at: string;
};

export type Progress = {
  user_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  quiz_score: number | null;
};

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as User;
}

export async function getUserProgress(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) return [];
  return data as Progress[];
}

export async function hasPurchasedCourse(userId: string, courseId: string): Promise<boolean> {
  const user = await getUser(userId);
  if (!user) return false;
  return user.purchased_courses?.includes(courseId) || false;
}

export async function isModuleCompleted(userId: string, courseId: string, moduleId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('progress')
    .select('completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('module_id', moduleId)
    .single();

  if (error) return false;
  return data?.completed || false;
}
