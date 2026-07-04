import { courses } from '../../../../../lib/courses';
import type { APIRoute } from 'astro';

export const DELETE: APIRoute = async ({ params, request }) => {
  const slug = params.slug;
  
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug requis' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const courseIndex = courses.findIndex((c: any) => c.slug === slug);
  
  if (courseIndex === -1) {
    return new Response(JSON.stringify({ error: 'Cours non trouvé' }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: `Cours ${slug} marqué pour suppression` 
  }), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};