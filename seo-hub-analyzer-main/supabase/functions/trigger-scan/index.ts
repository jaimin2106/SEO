import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ----------------------------------------------------------------
// URL validation — only allow http/https, reject localhost/IPs
// ----------------------------------------------------------------
function validateUrl(raw: string): { valid: boolean; normalized: string; error?: string } {
  try {
    const withProtocol = raw.startsWith('http://') || raw.startsWith('https://')
      ? raw
      : `https://${raw}`;
    const parsed = new URL(withProtocol);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, normalized: '', error: 'Only http and https URLs are allowed.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and private ranges
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blocked.includes(hostname)) {
      return { valid: false, normalized: '', error: 'Scanning local addresses is not permitted.' };
    }

    // Block private IPv4 ranges
    const privateRanges = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./];
    if (privateRanges.some(r => r.test(hostname))) {
      return { valid: false, normalized: '', error: 'Scanning private network addresses is not permitted.' };
    }

    return { valid: true, normalized: parsed.href };
  } catch {
    return { valid: false, normalized: '', error: 'Invalid URL format.' };
  }
}

export default {
  async fetch(req: Request) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Method guard
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the caller's auth token — RLS applies, so we never have elevated privileges here.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    try {
      // ── 1. Parse body ──────────────────────────────────────────
      let body: { url?: string };
      try {
        body = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 2. Authenticate ────────────────────────────────────────
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 3. Validate URL ────────────────────────────────────────
      const { url } = body;
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'URL is required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (url.length > 2048) {
        return new Response(JSON.stringify({ error: 'URL is too long.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const validation = validateUrl(url.trim());
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── 4. Rate limiting — tiered concurrency per user ─────────
      // Use service-role client to read user tier without RLS interference
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      const { data: userRow } = await serviceClient
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single();

      // Concurrency limits by tier
      const CONCURRENCY_LIMITS: Record<string, number> = {
        scale: 10,
        pro:   5,
        free:  2,
      };
      const userTier = userRow?.tier ?? 'free';
      const concurrencyLimit = CONCURRENCY_LIMITS[userTier] ?? 2;

      const { count: activeCount } = await supabase
        .from('scan_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['queued', 'fetching', 'rendering', 'analyzing']);

      if ((activeCount ?? 0) >= concurrencyLimit) {
        return new Response(
          JSON.stringify({
            error: `You have reached your concurrent scan limit (${concurrencyLimit} for ${userTier} plan). Please wait for a scan to finish.`,
            active_count: activeCount,
            limit: concurrencyLimit,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // ── 5. Credit check + atomic deduction ────────────────────
      const { data: creditResult, error: creditError } = await supabase.rpc('deduct_credit', {
        p_user_id: user.id,
        p_reason: 'scan',
      });

      if (creditError) {
        console.error('[trigger-scan] deduct_credit RPC error:', creditError.message);
        return new Response(JSON.stringify({ error: 'Failed to process credit. Please try again.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!creditResult?.success) {
        return new Response(
          JSON.stringify({
            error: creditResult?.error ?? 'Insufficient credits.',
            credits_remaining: creditResult?.credits_remaining ?? 0,
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // ── 6. Insert scan job (credit already deducted) ──────────
      const { data: job, error: insertError } = await supabase
        .from('scan_jobs')
        .insert({
          url: validation.normalized,
          user_id: user.id,
          status: 'queued',
          progress: 0,
        })
        .select()
        .single();

      if (insertError) {
        // Refund the credit if the job insert fails
        console.error('[trigger-scan] Job insert failed, refunding credit:', insertError.message);
        await supabase.rpc('admin_grant_credits', { p_user_id: user.id, p_delta: 1, p_reason: 'scan_failed_refund' })
          .then(() => {/* fire-and-forget */});
        return new Response(JSON.stringify({ error: 'Failed to queue scan. Your credit has been refunded.' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          job,
          credits_remaining: creditResult.credits_remaining,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[trigger-scan] Unhandled error:', msg);
      return new Response(JSON.stringify({ error: 'Internal server error.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
