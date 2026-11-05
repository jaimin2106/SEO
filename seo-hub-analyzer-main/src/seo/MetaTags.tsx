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
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
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
  ogTitle = title,
  ogDescription = description,
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterTitle = ogTitle,
  twitterDescription = ogDescription,
  twitterImage = ogImage,
  noIndex = false,
  noFollow = noIndex,
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

    const robots = `${noIndex ? "noindex" : "index"}, ${noFollow ? "nofollow" : "follow"}`;
    setMeta('meta[name="robots"]', noIndex ? robots : `${robots}, max-snippet:-1, max-image-preview:large, max-video-preview:-1`);

    // ── Canonical ──────────────────────────────────────────
    if (canonical) setLink("canonical", canonical);

    // ── Open Graph ─────────────────────────────────────────
    setMeta('meta[property="og:title"]', ogTitle);
    setMeta('meta[property="og:description"]', ogDescription);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:site_name"]', BRAND_NAME);
    if (canonical) setMeta('meta[property="og:url"]', canonical);

    // ── Twitter Card ───────────────────────────────────────
    setMeta('meta[name="twitter:card"]', twitterCard);
    setMeta('meta[name="twitter:title"]', twitterTitle);
    setMeta('meta[name="twitter:description"]', twitterDescription);
    setMeta('meta[name="twitter:image"]', twitterImage);
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
  }, [title, description, canonical, ogImage, ogTitle, ogDescription, ogType, twitterCard, twitterTitle, twitterDescription, twitterImage, noIndex, noFollow, schema]);

  // Renders nothing — side-effect only
  return null;
};

export default MetaTags;
