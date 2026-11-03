/**
 * src/seo/MetaTags.tsx
 * ─────────────────────────────────────────────────────────────
 * Reusable per-page meta tag injector.
 * Drop this at the top of any page component.
 *
 * Uses plain DOM manipulation (no react-helmet dependency needed).
 * For a Vite React SPA, this is the most lightweight approach.
 *
 * Usage:
 *   <MetaTags
 *     title="Free Online Form Builder – Formiz"
 *     description="Build beautiful forms in minutes…"
 *     canonical="https://formiz.in/pricing"
 *     ogImage="https://formiz.in/og/pricing.png"
 *   />
 * ─────────────────────────────────────────────────────────────
 */
import { useEffect } from "react";

export interface MetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  noIndex?: boolean;
  /** Inline JSON-LD schema object(s) — pass array for multiple schemas */
  schema?: object | object[];
}

export const BRAND_NAME = "SEO Hub Analyzer";
const DEFAULT_OG_IMAGE = "/apple-touch-icon.png";
const TWITTER_HANDLE = "";

const MetaTags = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  schema,
}: MetaTagsProps) => {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────────
    document.title = title;

    // ── Helper: upsert <meta> ──────────────────────────────
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const attr = selector.startsWith('meta[name')
          ? "name"
          : selector.startsWith('meta[property')
          ? "property"
          : "name";
        const val = selector.match(/["']([^"']+)["']/)?.[1] ?? "";
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // ── Helper: upsert <link> ──────────────────────────────
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ── Helper: inject JSON-LD ─────────────────────────────
    const injectSchema = (schemas: object[]) => {
      // Remove previous script tags injected by this component
      document
        .querySelectorAll('script[data-seo="true"]')
        .forEach((s) => s.remove());

      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo", "true");
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
      });
    };

    // ── Core meta ──────────────────────────────────────────
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="author"]', BRAND_NAME);

    if (noIndex) {
      setMeta('meta[name="robots"]', "noindex, nofollow");
    } else {
      setMeta('meta[name="robots"]', "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    }

    // ── Canonical ──────────────────────────────────────────
    if (canonical) setLink("canonical", canonical);

    // ── Open Graph ─────────────────────────────────────────
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:image:width"]', "1200");
    setMeta('meta[property="og:image:height"]', "630");
    setMeta('meta[property="og:site_name"]', BRAND_NAME);
    if (canonical) setMeta('meta[property="og:url"]', canonical);

    // ── Twitter Card ───────────────────────────────────────
    setMeta('meta[name="twitter:card"]', twitterCard);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage);
    if (TWITTER_HANDLE) {
      setMeta('meta[name="twitter:site"]', TWITTER_HANDLE);
    }

    // ── JSON-LD ────────────────────────────────────────────
    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      injectSchema(schemas);
    }

    // Cleanup: restore title on unmount (optional)
    return () => {
      document
        .querySelectorAll('script[data-seo="true"]')
        .forEach((s) => s.remove());
    };
  }, [title, description, canonical, ogImage, ogType, twitterCard, noIndex, schema]);

  // Renders nothing — side-effect only
  return null;
};

export default MetaTags;
