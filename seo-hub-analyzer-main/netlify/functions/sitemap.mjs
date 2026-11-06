/**
 * netlify/functions/sitemap.mjs
 * ─────────────────────────────────────────────────────────────
 * Dynamic sitemap generator served as a Netlify serverless function.
 *
 * Route: GET /sitemap.xml  →  /.netlify/functions/sitemap
 * (Redirect configured in netlify.toml)
 *
 * - Automatically picks up the hosted URL from Netlify env vars
 * - Fetches all published blog posts from Supabase at request time
 * - No rebuild needed — Google always gets fresh content
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import {
  fetchPublishedBlogRoutes,
  STATIC_ROUTES,
} from "./sitemap-data.mjs";

function buildUrlEntry(baseUrl, { path, changefreq, priority, lastmod }) {
  const today = new Date().toISOString().split("T")[0];
  return `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${lastmod ?? today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

export const handler = async (event) => {
  // ── 1. Determine the base URL ────────────────────────────────
  // VITE_APP_URL can be set in Netlify → Site settings → Env vars
  // to move to a custom domain without code changes.
  const isProductionContext = !process.env.CONTEXT || process.env.CONTEXT === "production";
  const deployUrl = isProductionContext
    ? process.env.VITE_APP_URL || process.env.URL
    : process.env.DEPLOY_PRIME_URL || process.env.URL;
  const baseUrl = (deployUrl || "").replace(/\/$/, "");

  if (!baseUrl) {
    return { statusCode: 500, body: "Site URL is not configured." };
  }

  // ── 2. Fetch dynamic blog routes from Supabase ──────────────
  let blogRoutes = [];
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      blogRoutes = await fetchPublishedBlogRoutes(supabase);
    } catch (err) {
      console.error("[sitemap] Could not fetch all published blogs:", err.message);
      return {
        statusCode: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: "Could not generate a complete sitemap.",
      };
    }
  } else {
    console.error("[sitemap] Supabase environment variables are not configured.");
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Sitemap source is not configured.",
    };
  }

  // ── 3. Build XML ─────────────────────────────────────────────
  const allRoutes = [...STATIC_ROUTES, ...blogRoutes];
  const entries = allRoutes.map((r) => buildUrlEntry(baseUrl, r)).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries}
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache for 1 hour at CDN, 5 min at browser — fresh but not hammering Supabase
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
    body: xml,
  };
};
