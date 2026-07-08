import { courses } from '../../../../lib/courses';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(courses), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
