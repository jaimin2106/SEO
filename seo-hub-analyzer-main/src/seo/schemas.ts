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
    width: 180,
    height: 180,
  },
  description:
    "SEO Hub Analyzer is an AI-powered website intelligence platform that scans any URL and delivers clear, actionable SEO reports covering technical issues, performance, and Core Web Vitals.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@seohubanalyzer.com",
    availableLanguage: ["English"],
  },
};
// ─── 2. WebSite ──────────────────────────────────────────────
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SEO Hub Analyzer",
  url: SITE_URL,
  description:
    "AI-assisted website SEO analysis for technical issues, on-page signals and available page performance data.",
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
    "An AI-assisted website SEO analyzer for technical checks, on-page signals, PageSpeed Insights lab results and actionable recommendations.",
  featureList: [
    "Technical SEO audit",
    "Page title and meta description checks",
    "Heading, link and image alt analysis",
    "Canonical, robots and structured data checks",
    "PageSpeed Insights Lighthouse lab performance results",
    "AI-assisted recommendations",
    "PDF report exports",
    "Mobile and desktop analysis",
  ],
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      description: "Free website SEO analysis plan.",
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
      description: "Website SEO analysis subscription.",
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
      description: "Website SEO analysis subscription for teams.",
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
