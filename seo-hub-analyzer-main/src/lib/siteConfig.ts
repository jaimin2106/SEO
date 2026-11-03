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

/** Use a production override when configured, otherwise respect the active origin. */
export const SITE_URL: string = (
  import.meta.env.VITE_APP_URL ||
  (typeof window === "undefined" ? "" : window.location.origin)
).replace(/\/$/, "");

/** Helper: build an absolute URL from a path */
export const siteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
