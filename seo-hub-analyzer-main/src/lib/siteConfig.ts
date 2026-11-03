/**
 * src/lib/siteConfig.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for site-wide URL config.
 * All SEO canonical/schema URLs and MetaTags pull from here.
 *
 * To change the domain:
 *   Netlify → Site settings → Environment variables → VITE_APP_URL
 * No code changes needed — everything updates on next deploy.
 * ─────────────────────────────────────────────────────────────
 */

/** Hardcoded canonical production URL — always correct for this Netlify site. */
const CANONICAL_URL = "https://seo-hub-jaimin.netlify.app";

/** The active site URL. Trailing slash stripped. */
export const SITE_URL: string = (
  import.meta.env.VITE_APP_URL ?? CANONICAL_URL
).replace(/\/$/, "");

/** Helper: build an absolute URL from a path */
export const siteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
