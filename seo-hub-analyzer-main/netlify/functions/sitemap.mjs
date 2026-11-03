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

// Static routes that always appear in the sitemap
const STATIC_ROUTES = [
  { path: "/",              changefreq: "weekly",  priority: 1.0 },
  { path: "/overview",      changefreq: "monthly", priority: 0.9 },
  { path: "/capabilities",  changefreq: "monthly", priority: 0.9 },
  { path: "/workflow",      changefreq: "monthly", priority: 0.8 },
  { path: "/pricing",       changefreq: "monthly", priority: 0.8 },
  { path: "/about",         changefreq: "monthly", priority: 0.7 },
  { path: "/docs",          changefreq: "weekly",  priority: 0.8 },
  { path: "/api-reference", changefreq: "monthly", priority: 0.7 },
  { path: "/case-studies",  changefreq: "monthly", priority: 0.8 },
  { path: "/sample-report", changefreq: "monthly", priority: 0.8 },
  { path: "/blog",          changefreq: "weekly",  priority: 0.8 },
  { path: "/support",       changefreq: "monthly", priority: 0.6 },
  { path: "/privacy",       changefreq: "yearly",  priority: 0.3 },
  { path: "/terms",         changefreq: "yearly",  priority: 0.3 },
];

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
      const { data } = await supabase
        .from("blogs")
        .select("slug, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      blogRoutes = (data ?? []).map((post) => ({
        path: `/blog/${post.slug}`,
        changefreq: "monthly",
        priority: 0.7,
        lastmod: post.published_at
          ? new Date(post.published_at).toISOString().split("T")[0]
          : undefined,
      }));
    } catch (err) {
      console.warn("[sitemap] Supabase error — serving static routes only:", err.message);
    }
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
