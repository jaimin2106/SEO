import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default {
  async fetch(req: Request) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const ctx = { supabase, supabaseAdmin };

    try {
      const { job_id } = await req.json();

      if (!job_id) {
        return new Response(JSON.stringify({ error: "job_id is required" }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Authenticate user
      const { data: { user }, error: authError } = await ctx.supabase.auth.getUser();

      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if user has access to this report
      const { data: report, error: reportError } = await ctx.supabase
        .from('reports')
        .select('id, website_id, pdf_url')
        .eq('job_id', job_id)
        .single();

      if (reportError || !report) {
        return new Response(JSON.stringify({ error: "Report not found or access denied" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If PDF already exists, return it
      if (report.pdf_url) {
        return new Response(JSON.stringify({ success: true, pdf_url: report.pdf_url }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate PDF (Mock implementation)
      // In production, this would call a headless browser service (e.g. Browserless)
      // which renders the report UI and generates a PDF buffer.
      
      const mockPdfBuffer = new Uint8Array([/* pdf binary data */]);
      const fileName = `${job_id}.pdf`;

      // Upload to Supabase Storage using Admin client to bypass RLS for service operations
      const { data: uploadData, error: uploadError } = await ctx.supabaseAdmin
        .storage
        .from('report_exports')
        .upload(fileName, mockPdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error("Storage upload error", uploadError);
        throw uploadError;
      }

      // Get signed URL
      const { data: { signedUrl }, error: signedUrlError } = await ctx.supabaseAdmin
        .storage
        .from('report_exports')
        .createSignedUrl(fileName, 60 * 60 * 24); // 24 hours

      if (signedUrlError) {
        throw signedUrlError;
      }

      // Update report record with PDF URL
      await ctx.supabase
        .from('reports')
        .update({ pdf_url: signedUrl })
        .eq('id', report.id);

      return new Response(JSON.stringify({ success: true, pdf_url: signedUrl }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("Generate-pdf error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};
