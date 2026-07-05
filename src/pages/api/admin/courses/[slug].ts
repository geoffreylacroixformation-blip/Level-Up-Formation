import { courses } from '../../../../lib/courses';
import type { APIRoute } from 'astro';

export const getStaticPaths = async () => [];

export const DELETE: APIRoute = async ({ params, request }) => {
  const slug = params.slug;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug requis' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- Auth check ---
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Configuration erreur' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?select=role&email=eq.${encodeURIComponent('jo@levelup-formation.fr')}`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!profileRes.ok) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const profileData = await profileRes.json();
    if (profileData.length === 0 || profileData[0].role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Accès interdit' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Erreur de vérification' }), { 
      status: 500,
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
