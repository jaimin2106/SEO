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
import {
  fetchPublishedBlogRoutes,
  STATIC_ROUTES,
} from "../netlify/functions/sitemap-data.mjs";

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

// ─── Fetch dynamic blog URLs ───────────────────────────────────
async function fetchBlogRoutes() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("⚠️  Supabase env vars missing — generated sitemap will contain static routes only.");
    return [];
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return fetchPublishedBlogRoutes(supabase);
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
const allRoutes = [...STATIC_ROUTES, ...blogRoutes];
const xml = buildSitemap(allRoutes);
mkdirSync(resolve(PROJECT_ROOT, "dist"), { recursive: true });
writeFileSync(OUTPUT_PATH, xml, "utf8");
const robots = readFileSync(ROBOTS_SOURCE_PATH, "utf8")
  .replace(/^Sitemap:\s*.*\r?\n?/gim, "")
  .trimEnd();
writeFileSync(ROBOTS_OUTPUT_PATH, `${robots}\n\nSitemap: ${BASE_URL}/sitemap.xml\n`, "utf8");

console.log(`✅ sitemap.xml generated → ${OUTPUT_PATH}`);
console.log(`   ${STATIC_ROUTES.length} static URLs + ${blogRoutes.length} blog URLs = ${allRoutes.length} total | lastmod: ${TODAY}`);
