/**
 * src/seo/schemas.ts
 * ─────────────────────────────────────────────────────────────
 * All JSON-LD schema objects for seohubanalyzer.com
 * Import the ones you need and pass them to <MetaTags schema={…} />
 * ─────────────────────────────────────────────────────────────
 */

import { SITE_URL, siteUrl } from "@/lib/siteConfig";
const LOGO_URL = siteUrl("/apple-touch-icon.png");

// ─── 1. Organization ─────────────────────────────────────────
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SEO Hub Analyzer",
  alternateName: "SEO Hub",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 200,
    height: 60,
  },
  description:
    "SEO Hub Analyzer is an AI-powered website intelligence platform that scans any URL and delivers clear, actionable SEO reports covering technical issues, performance, and Core Web Vitals.",
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@seohubanalyzer.com",
    availableLanguage: ["English"],
  },
};
// ─── 2. WebSite (with SearchAction) ──────────────────────────
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SEO Hub Analyzer",
  url: SITE_URL,
  description:
    "AI-powered SEO analysis tool — scan any website, identify technical issues, and get actionable fix recommendations in seconds.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ─── 3. SoftwareApplication (Homepage) ───────────────────────
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SEO Hub Analyzer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "An AI-powered SEO analysis platform that crawls websites, identifies technical SEO issues, measures Core Web Vitals, and delivers prioritized remediation guidance.",
  screenshot: `${SITE_URL}/og/screenshot.png`,
  featureList: [
    "Technical SEO audit",
    "Core Web Vitals analysis",
    "On-page optimization checks",
    "Crawlability & robots.txt validation",
    "AI-generated fix recommendations",
    "PDF report export",
    "Mobile & desktop preview",
    "Historical tracking",
  ],
  softwareVersion: "2.0",
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      description: "5 lifetime reports, partial report access, mobile & desktop preview.",
    },
    {
      "@type": "Offer",
      name: "Pro Plan",
      price: "29",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "29",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
      description: "50 reports/month, full forensic SEO analysis, AI remediation prompts, PDF export.",
    },
    {
      "@type": "Offer",
      name: "Scale Plan",
      price: "99",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "99",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
      description: "100 reports/month, white-label PDFs, team workspace, priority support.",
    },
  ],
};

// ─── 4. Blog List Page (BreadcrumbList) ──────────────────────
export const blogBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}/blog`,
    },
  ],
};

// ─── 5. Blog Article Factory ─────────────────────────────────
export function buildArticleSchema({
  title,
  description,
  slug,
  publishedAt,
  modifiedAt,
  authorName = "SEO Hub Analyzer Team",
  imageUrl,
  schemaType = "BlogPosting",
}: {
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
  modifiedAt?: string;
  authorName?: string;
  imageUrl?: string;
  schemaType?: "Article" | "BlogPosting";
}) {
  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: title,
    description: description ?? "",
    url: `${SITE_URL}/blog/${slug}`,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(modifiedAt ? { dateModified: modifiedAt } : {}),
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "SEO Hub Analyzer",
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    ...(imageUrl ? { image: imageUrl } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
  };
}

// ─── 6. FAQ Schema Factory ────────────────────────────────────
export function buildFaqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };
}
