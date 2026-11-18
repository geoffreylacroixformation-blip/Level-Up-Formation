// supabase/functions/stripe-webhook/index.ts
// Webhook Stripe — sécurisé avec vérification de signature
import { serve } from 'jsr:@supabase/functions-js/edge-runtime@2';
import Stripe from 'npm:stripe@14.25.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
  typescript: true,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature, Authorization',
};

/**
 * Mapping price_id Stripe → cours.
 * À remplir avec les price_ids réels (mode test) quand les produits Stripe seront créés.
 */
const PRICE_MAPPING: Record<string, { course_slug: string; level: number }> = {
  // Exemple (à remplacer par les vrais price_id Stripe) :
  // 'price_test_abc123': { course_slug: 'systèmes', level: 1 },
  // 'price_test_def456': { course_slug: 'réseaux', level: 2 },
};

function log(level: string, message: string, data?: unknown) {
  const prefix = '[stripe-webhook]';
  if (data) {
    console[level](`${prefix} ${level.toUpperCase()}: ${message}`, data);
  } else {
    console[level](`${prefix} ${level.toUpperCase()}: ${message}`);
  }
}

serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      log('error', 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant');
      return new Response(
        JSON.stringify({ error: 'Configuration manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier la signature Stripe (sécurisé)
    const signature = req.headers.get('stripe-signature') || '';
    if (!signature) {
      log('warn', 'En-tête stripe-signature manquant');
      return new Response(
        JSON.stringify({ error: 'Manque stripe-signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      log('error', `Signature Stripe invalide: ${message}`);
      return new Response(
        JSON.stringify({ error: 'Signature invalide', details: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('info', `Événement reçu: ${event.type}`);

    // Gestion des événements Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const priceId = session.line_items?.data[0]?.price?.id;
        const customerEmail = session.customer_email || '';
        const userId = session.metadata?.user_id;

        log('info', `checkout.session.completed`, {
          priceId,
          customer_email: customerEmail,
          user_id: userId,
          mode: session.mode,
        });

        // Récupérer le mapping du prix
        const mapping = PRICE_MAPPING[priceId || ''];

        if (!mapping) {
          log('warn', `Prix Stripe inconnu: ${priceId}. Ajoutez-le dans PRICE_MAPPING.`);
          break;
        }

        // Trouver ou créer le profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', customerEmail)
          .maybeSingle();

        if (profileError) {
          log('error', `Erreur lors de la recherche du profil: ${profileError.message}`);
          break;
        }

        if (!profile) {
          // Créer le profil automatiquement
          log('info', `Création du profil pour: ${customerEmail}`);
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: customerEmail,
              role: 'user',
            })
            .select()
            .single();

          if (insertError) {
            log('error', `Erreur création profil: ${insertError.message}`);
            break;
          }

          // Enregistrer l'achat
          await supabase.from('users_courses').upsert(
            {
              user_id: newProfile.id,
              course_slug: mapping.course_slug,
              progress: 0,
              completed: false,
              purchased_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,course_slug' }
          );
          log('info', `Cours "${mapping.course_slug}" attribué à ${customerEmail}`);
        } else {
          // Enregistrer l'achat
          await supabase.from('users_courses').upsert(
            {
              user_id: profile.id,
              course_slug: mapping.course_slug,
              progress: 0,
              completed: false,
              purchased_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,course_slug' }
          );
          log('info', `Cours "${mapping.course_slug}" attribué à ${customerEmail}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        log('info', `Paiement facture réussi: ${invoice.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        log('error', `Paiement échoué: ${pi.id} — ${pi.last_payment_error?.message || 'raison inconnue'}`);
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        log('info', `Paiement réussi: ${pi.id} — ${pi.amount} ${pi.currency}`);
        break;
      }

      default:
        log('info', `Événement non géré: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    log('error', `Erreur interne: ${message}`);
    return new Response(
      JSON.stringify({ error: 'Erreur interne', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
