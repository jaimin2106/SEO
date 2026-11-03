import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

// ----------------------------------------------------------------
// Stripe webhook HMAC-SHA256 signature verification
// Uses the Web Crypto API (native in Deno) — no Stripe SDK needed.
// Mirrors the official Stripe verification algorithm exactly.
// ----------------------------------------------------------------
async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): Promise<{ valid: boolean; event: Record<string, unknown> | null; error?: string }> {
  // Parse the Stripe-Signature header: "t=<timestamp>,v1=<sig>[,v0=<legacy>]"
  const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.trim().split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const expectedSig = parts['v1'];

  if (!timestamp || !expectedSig) {
    return { valid: false, event: null, error: 'Missing t or v1 in Stripe-Signature header.' };
  }

  // Replay attack protection: reject events older than 5 minutes
  const timeDiff = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (timeDiff > 300) {
    return { valid: false, event: null, error: `Webhook timestamp too old (${Math.round(timeDiff)}s). Possible replay attack.` };
  }

  // Compute HMAC-SHA256 over "<timestamp>.<payload>"
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const computedSig = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison to prevent timing attacks
  if (computedSig.length !== expectedSig.length || computedSig !== expectedSig) {
    return { valid: false, event: null, error: 'Signature mismatch.' };
  }

  // Signature valid — safe to parse payload
  try {
    const event = JSON.parse(payload) as Record<string, unknown>;
    return { valid: true, event };
  } catch {
    return { valid: false, event: null, error: 'Failed to parse JSON payload after signature validation.' };
  }
}

export default {
  async fetch(req: Request) {
    // Only accept POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

    // If the webhook secret is not configured, block all requests
    if (!webhookSecret) {
      console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set. Rejecting request.');
      return new Response('Webhook secret not configured.', { status: 500 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing Stripe-Signature header.', { status: 400 });
    }

    // Read raw body (must be the unmodified bytes for HMAC to match)
    const bodyText = await req.text();

    // Verify signature
    const { valid, event, error: sigError } = await verifyStripeSignature(bodyText, signature, webhookSecret);
    if (!valid) {
      console.warn('[stripe-webhook] Signature verification failed:', sigError);
      return new Response(`Webhook Error: ${sigError}`, { status: 400 });
    }

    // Admin client — bypasses RLS for subscription writes
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
      switch ((event as { type: string }).type) {
        // ── Checkout completed — subscription activated ──────────
        case 'checkout.session.completed': {
          const session = (event as { data: { object: Record<string, unknown> } }).data.object;
          const userId = session.client_reference_id as string | null;

          if (!userId) {
            console.error('[stripe-webhook] checkout.session.completed missing client_reference_id — cannot link subscription to user.');
            break;
          }

          const planType = _resolvePlanType(session.metadata as Record<string, string> | null);

          const { error } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id:                userId,
              stripe_customer_id:     session.customer as string,
              stripe_subscription_id: session.subscription as string,
              plan_type:              planType,
              status:                 'active',
              current_period_end:     null, // updated by subscription.updated event
            }, { onConflict: 'user_id' });

          if (error) {
            console.error('[stripe-webhook] Error upserting subscription:', error.message);
            break;
          }

          // Update the user's tier in public.users
          const tierMap: Record<string, string> = { PRO: 'pro', SCALE: 'scale', FREE: 'free' };
          const tier = tierMap[planType] ?? 'free';

          await supabaseAdmin
            .from('users')
            .update({ tier, subscription_tier: planType })
            .eq('id', userId);

          console.log(`[stripe-webhook] Subscription activated for user ${userId}, plan: ${planType}`);
          break;
        }

        // ── Subscription updated (e.g. period renewed) ───────────
        case 'customer.subscription.updated': {
          const subscription = (event as { data: { object: Record<string, unknown> } }).data.object;

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status as string,
              current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end as boolean,
            })
            .eq('stripe_subscription_id', subscription.id as string);

          break;
        }

        // ── Subscription cancelled ───────────────────────────────
        case 'customer.subscription.deleted': {
          const subscription = (event as { data: { object: Record<string, unknown> } }).data.object;

          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id as string)
            .select('user_id')
            .single();

          // Downgrade the user's tier back to free
          if (sub?.user_id) {
            await supabaseAdmin
              .from('users')
              .update({ tier: 'free', subscription_tier: 'FREE' })
              .eq('id', sub.user_id);
          }

          console.log(`[stripe-webhook] Subscription canceled: ${subscription.id}`);
          break;
        }

        default:
          console.log(`[stripe-webhook] Unhandled event type: ${(event as { type: string }).type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[stripe-webhook] Unhandled error:', msg);
      return new Response(`Webhook Error: ${msg}`, { status: 400 });
    }
  },
};

// ----------------------------------------------------------------
// Resolve plan type from Stripe session metadata
// Expects metadata.plan_type = 'PRO' | 'SCALE'
// ----------------------------------------------------------------
function _resolvePlanType(metadata: Record<string, string> | null): 'FREE' | 'PRO' | 'SCALE' {
  const raw = metadata?.plan_type?.toUpperCase();
  if (raw === 'PRO') return 'PRO';
  if (raw === 'SCALE') return 'SCALE';
  return 'FREE';
}
