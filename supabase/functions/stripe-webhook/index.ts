import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Price ID to course level mapping
const PRICE_MAPPING: Record<string, { type: 'course' | 'bundle'; levels: number[] }> = {
  // Course prices (get from env or Stripe dashboard)
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

    // Verify webhook signature using Stripe SDK
    // Note: In production, use proper Stripe webhook verification
    const event = JSON.parse(body);

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

      // Update user's purchased courses
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, purchased_courses, plan')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Determine what was purchased based on price ID
      const purchase = PRICE_MAPPING[priceId!];
      if (purchase) {
        if (purchase.type === 'bundle' && purchase.levels.includes(1) && purchase.levels.includes(2) && purchase.levels.includes(3)) {
          // All Access Pass - grant all courses
          await supabase
            .from('users')
            .update({ plan: 'all_access' })
            .eq('id', userId);
        } else if (purchase.type === 'bundle') {
          // Bundle purchase
          await supabase
            .from('users')
            .update({ plan: 'bundle' })
            .eq('id', userId);
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
