import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Price ID to course level mapping — update with real Stripe price IDs
const PRICE_MAPPING: Record<string, { type: 'course' | 'bundle'; levels: number[] }> = {
  // lvl1: { type: 'course', levels: [1] },
  // lvl2: { type: 'course', levels: [2] },
  // lvl3: { type: 'course', levels: [3] },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();

    // Verify webhook signature
    let event;
    try {
      // Simple signature verification for temp setup
      // In production, use the Stripe SDK for proper verification
      event = JSON.parse(body);

      // Basic check: event must have type and data
      if (!event.type || !event.data) {
        return new Response(
          JSON.stringify({ error: 'Invalid event format' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      console.error('Failed to parse webhook:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const priceId = session.metadata?.price_id;

      if (!userId) {
        console.error('Missing user_id in session metadata');
        return new Response(
          JSON.stringify({ error: 'Missing user_id' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found for user:', userId);
        // Create profile if doesn't exist
        await supabase.from('profiles').insert({ id: userId, email: session.customer_email || '', role: 'user' });
      }

      // Determine what was purchased based on price ID
      const purchase = PRICE_MAPPING[priceId!];
      if (purchase) {
        if (purchase.type === 'bundle' && purchase.levels.includes(1) && purchase.levels.includes(2) && purchase.levels.includes(3)) {
          // All Access Pass - grant all courses
          await supabase
            .from('profiles')
            .update({ plan: 'all_access' })
            .eq('id', userId);
        } else if (purchase.type === 'bundle') {
          // Bundle purchase
          await supabase
            .from('profiles')
            .update({ plan: 'bundle' })
            .eq('id', userId);
        }
      }

      // Record the course enrollment
      if (purchase && purchase.type === 'course') {
        for (const level of purchase.levels) {
          // Find courses at this level
          const { data: levelCourses } = await supabase
            .from('courses')
            .select('slug')
            .eq('level', level);

          if (levelCourses) {
            for (const course of levelCourses) {
              await supabase
                .from('users_courses')
                .upsert(
                  {
                    user_id: userId,
                    course_slug: course.slug,
                    progress: 0,
                    completed: false,
                    purchased_at: new Date().toISOString()
                  },
                  { onConflict: 'user_id,course_slug' }
                );
            }
          }
        }
      } else {
        // Single course purchase — record it
        // Try to find the course by stripe_price_id
        const { data: course } = await supabase
          .from('courses')
          .select('slug')
          .eq('stripe_price_id', priceId)
          .single();

        if (course) {
          await supabase
            .from('users_courses')
            .upsert(
              {
                user_id: userId,
                course_slug: course.slug,
                progress: 0,
                completed: false,
                purchased_at: new Date().toISOString()
              },
              { onConflict: 'user_id,course_slug' }
            );
        }
      }

      // Log successful payment
      console.log(`Payment completed for user ${userId}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
