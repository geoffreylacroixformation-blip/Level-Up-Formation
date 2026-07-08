import { courses } from '../../../../lib/courses';
import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

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

  // --- Find course in catalog ---
  const courseIndex = courses.findIndex((c: any) => c.slug === slug);

  if (courseIndex === -1) {
    return new Response(JSON.stringify({ error: 'Cours non trouvé dans le catalogue' }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const course = courses[courseIndex];
  const results = { 
    success: true, 
    course: slug,
    deleted: { files: [], supabase: null, catalog: false },
    errors: [] as string[]
  };

  // --- 1. Delete local files from public/uploads ---
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      if (file.startsWith(`${slug}-`)) {
        const filePath = path.join(uploadDir, file);
        try {
          fs.unlinkSync(filePath);
          results.deleted.files.push(file);
        } catch (e: any) {
          results.errors.push(`Erreur suppression fichier ${file}: ${e.message}`);
        }
      }
    }
  }

  // --- 2. Delete from Supabase ---
  if (supabaseUrl && supabaseAnonKey) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const apiKey = serviceKey || supabaseAnonKey;

    // Delete from courses table (if exists)
    try {
      const courseRes = await fetch(`${supabaseUrl}/rest/v1/courses?slug=eq.${encodeURIComponent(slug)}&select=id`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${serviceKey || supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        if (courseData.length > 0) {
          const deleteRes = await fetch(
            `${supabaseUrl}/rest/v1/courses?id=eq.${courseData[0].id}`,
            {
              method: 'DELETE',
              headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${serviceKey || supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              }
            }
          );
          if (deleteRes.ok) {
            const deleted = await deleteRes.json();
            results.deleted.supabase = { table: 'courses', ids: deleted.map((d: any) => d.id) };
          } else {
            results.errors.push(`Erreur suppression Supabase courses: ${deleteRes.status}`);
          }
        }
      }
    } catch (e: any) {
      results.errors.push(`Erreur Supabase courses: ${e.message}`);
    }

    // Delete related modules from courses_modules table
    try {
      const moduleRes = await fetch(`${supabaseUrl}/rest/v1/courses_modules?course_slug=eq.${encodeURIComponent(slug)}&select=id`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${serviceKey || supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (moduleRes.ok) {
        const modules = await moduleRes.json();
        if (modules.length > 0) {
          const ids = modules.map((m: any) => m.id).join(',');
          const deleteRes = await fetch(
            `${supabaseUrl}/rest/v1/courses_modules?id=in.(${ids})`,
            {
              method: 'DELETE',
              headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${serviceKey || supabaseAnonKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if (deleteRes.ok) {
            results.deleted.supabase.modules = modules.map((m: any) => m.id);
          }
        }
      }
    } catch (e: any) {
      // Module table might not exist - that's fine
    }

    // Delete from users_courses (enrollments)
    try {
      const enrollRes = await fetch(`${supabaseUrl}/rest/v1/users_courses?course_slug=eq.${encodeURIComponent(slug)}&select=id`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${serviceKey || supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (enrollRes.ok) {
        const enrollments = await enrollRes.json();
        if (enrollments.length > 0) {
          const ids = enrollments.map((e: any) => e.id).join(',');
          await fetch(
            `${supabaseUrl}/rest/v1/users_courses?id=in.(${ids})`,
            {
              method: 'DELETE',
              headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${serviceKey || supabaseAnonKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          results.deleted.supabase.enrollments = enrollments.length;
        }
      }
    } catch (e: any) {
      // Table might not exist
    }

    // Delete Stripe product and price (if course was monetized)
    try {
      if (course.stripe_product_id) {
        // Delete Stripe price(s) first
        const pricesRes = await fetch(`https://api.stripe.com/v1/prices?product=${encodeURIComponent(course.stripe_product_id)}`, {
          headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY || ''}` }
        });
        if (pricesRes.ok) {
          const prices = await pricesRes.json();
          for (const price of prices.data || []) {
            await fetch(`https://api.stripe.com/v1/prices/${price.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY || ''}` }
            });
          }
        }
        // Delete Stripe product
        await fetch(`https://api.stripe.com/v1/products/${course.stripe_product_id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY || ''}` }
        });
        results.deleted.stripe = { product: course.stripe_product_id };
      }
    } catch (e: any) {
      // Stripe might not be configured
    }
  }

  // --- 3. Remove from courses.ts catalog ---
  // Read the file, filter out the course, write back
  try {
    const coursesFile = path.join(process.cwd(), 'src', 'lib', 'courses.ts');
    let content = fs.readFileSync(coursesFile, 'utf-8');
    const lines = content.split('\n');
    
    // Find the course block by slug using brace counting
    let startLine = -1;
    let endLine = -1;
    let braceCount = 0;
    let inCourseBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line contains the target slug
      if (line.includes(`slug: '${slug}'`) || line.includes(`slug: "${slug}"`)) {
        startLine = i;
        inCourseBlock = true;
      }
      
      if (inCourseBlock) {
        // Count braces in this line
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        // When braces are balanced back to 0, we've found the end
        if (inCourseBlock && braceCount === 0) {
          endLine = i;
          break;
        }
      }
    }
    
    if (startLine !== -1 && endLine !== -1) {
      // Remove trailing comma from previous line if present
      const beforeBlock = lines.slice(0, startLine).join('\n');
      const afterBlock = lines.slice(endLine + 1).join('\n');
      
      // Remove trailing comma from the line before the block
      const cleanBefore = beforeBlock.replace(/,\s*$/, '');
      
      content = cleanBefore + '\n' + afterBlock;
      fs.writeFileSync(coursesFile, content, 'utf-8');
      results.deleted.catalog = true;
    }
  } catch (e: any) {
    results.errors.push(`Erreur mise à jour catalogue: ${e.message}`);
  }

  return new Response(JSON.stringify(results), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
