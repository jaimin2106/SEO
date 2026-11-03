#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * ─────────────────────────────────────────────────────────────
 * Build-time sitemap generator for SEO Hub Analyzer (Vite React SPA)
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *   # or hook it into package.json:
 *   "build": "node scripts/generate-sitemap.mjs && vite build"
 *
 * Dynamically fetches published blog slugs from Supabase and appends
 * them to the sitemap so individual blog posts are indexable.
 * ─────────────────────────────────────────────────────────────
 */

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const OUTPUT_PATH = resolve(PROJECT_ROOT, "dist/sitemap.xml");
const ROBOTS_SOURCE_PATH = resolve(PROJECT_ROOT, "public/robots.txt");
const ROBOTS_OUTPUT_PATH = resolve(PROJECT_ROOT, "dist/robots.txt");
const TODAY = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const env = { ...loadEnv("production", PROJECT_ROOT, ""), ...process.env };
const isProductionContext = !env.CONTEXT || env.CONTEXT === "production";
const deployUrl = isProductionContext
  ? env.VITE_APP_URL || env.URL
  : env.DEPLOY_PRIME_URL || env.URL;
const BASE_URL = (deployUrl || "http://localhost:8080").replace(/\/$/, "");
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

// ─── Static Route Table ────────────────────────────────────────
const staticRoutes = [
  // Homepage — highest priority
  { path: "/",               changefreq: "weekly",  priority: 1.0 },

  // Platform & Core
  { path: "/overview",       changefreq: "monthly", priority: 0.9 },
  { path: "/capabilities",   changefreq: "monthly", priority: 0.9 },
  { path: "/workflow",       changefreq: "monthly", priority: 0.8 },
  { path: "/pricing",        changefreq: "monthly", priority: 0.8 },
  { path: "/about",          changefreq: "monthly", priority: 0.7 },

  // Resources
  { path: "/docs",           changefreq: "weekly",  priority: 0.8 },
  { path: "/api-reference",  changefreq: "monthly", priority: 0.7 },
  { path: "/case-studies",   changefreq: "monthly", priority: 0.8 },
  { path: "/sample-report",  changefreq: "monthly", priority: 0.8 },
  { path: "/blog",           changefreq: "weekly",  priority: 0.8 },
  { path: "/support",        changefreq: "monthly", priority: 0.6 },

  // Legal
  { path: "/privacy",        changefreq: "yearly",  priority: 0.3 },
  { path: "/terms",          changefreq: "yearly",  priority: 0.3 },
];

// ─── Fetch dynamic blog URLs ───────────────────────────────────
async function fetchBlogRoutes() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("⚠️  Supabase env vars missing — skipping dynamic blog URLs.");
    return [];
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from("blogs")
      .select("slug, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.warn("⚠️  Supabase query error — skipping blog URLs:", error.message);
      return [];
    }

    return (data ?? []).map((post) => ({
      path: `/blog/${post.slug}`,
      changefreq: "monthly",
      priority: 0.7,
      lastmod: post.published_at
        ? new Date(post.published_at).toISOString().split("T")[0]
        : TODAY,
    }));
  } catch (err) {
    console.warn("⚠️  Failed to connect to Supabase — skipping blog URLs:", err.message);
    return [];
  }
}

// ─── XML Builder ──────────────────────────────────────────────
function buildUrlEntry({ path, changefreq, priority, lastmod }) {
  const baseUrl = BASE_URL.replace(/\/$/, "");
  const loc = `${baseUrl}${path}`;
  const mod = lastmod ?? TODAY;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

function buildSitemap(routes) {
  const entries = routes.map(buildUrlEntry).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries}
</urlset>`;
}

// ─── Main ─────────────────────────────────────────────────────
const blogRoutes = await fetchBlogRoutes();
const allRoutes = [...staticRoutes, ...blogRoutes];
const xml = buildSitemap(allRoutes);
mkdirSync(resolve(PROJECT_ROOT, "dist"), { recursive: true });
writeFileSync(OUTPUT_PATH, xml, "utf8");
const robots = readFileSync(ROBOTS_SOURCE_PATH, "utf8")
  .replace(/^Sitemap:\s*.*\r?\n?/gim, "")
  .trimEnd();
writeFileSync(ROBOTS_OUTPUT_PATH, `${robots}\n\nSitemap: ${BASE_URL}/sitemap.xml\n`, "utf8");

console.log(`✅ sitemap.xml generated → ${OUTPUT_PATH}`);
console.log(`   ${staticRoutes.length} static URLs + ${blogRoutes.length} blog URLs = ${allRoutes.length} total | lastmod: ${TODAY}`);
