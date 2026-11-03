/**
 * src/seo/pageMeta.ts
 * ─────────────────────────────────────────────────────────────
 * Centralized page-level meta config for all seohubanalyzer.com pages.
 * Each entry maps to one <MetaTags /> invocation.
 *
 * Title:        max 60 chars
 * Description:  max 160 chars
 * ─────────────────────────────────────────────────────────────
 */

import { SITE_URL } from "@/lib/siteConfig";
const BASE = SITE_URL;

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  ogImage?: string;
  ogType?: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  // ── Homepage ────────────────────────────────────────────────
  home: {
    title: "SEO Hub Analyzer — AI-Powered Website SEO Analysis Tool",
    description:
      "Scan any website and get a clear, actionable SEO report. Fix technical issues, improve rankings, and boost performance — free.",
    canonical: `${BASE}/`,
    keywords: [
      "SEO analyzer",
      "website SEO audit",
      "technical SEO tool",
      "free SEO checker",
      "on-page SEO analysis",
      "Core Web Vitals checker",
      "SEO report generator",
    ],
    ogImage: `${BASE}/og/home.png`,
  },

  // ── Pricing ─────────────────────────────────────────────────
  pricing: {
    title: "SEO Hub Analyzer Pricing — Free, Pro & Scale Plans",
    description:
      "Start free with 5 lifetime reports. Upgrade to Pro or Scale for unlimited forensic SEO analysis, PDF exports, and AI remediation prompts.",
    canonical: `${BASE}/pricing`,
    keywords: [
      "SEO analyzer pricing",
      "SEO audit tool cost",
      "free SEO analysis plan",
      "Pro SEO plan",
      "SEO Hub Analyzer plans",
    ],
    ogImage: `${BASE}/og/pricing.png`,
  },

  // ── Blog (hub) ───────────────────────────────────────────────
  blog: {
    title: "SEO Blog — Technical SEO Insights & Performance Tips",
    description:
      "Expert guides on technical SEO, Core Web Vitals, on-page optimization, and search algorithm updates. Level up your rankings.",
    canonical: `${BASE}/blog`,
    keywords: [
      "technical SEO blog",
      "SEO tips",
      "Core Web Vitals guide",
      "on-page SEO optimization",
      "SEO algorithm updates",
    ],
    ogType: "blog",
    ogImage: `${BASE}/og/blog.png`,
  },

  // ── About ────────────────────────────────────────────────────
  about: {
    title: "About SEO Hub Analyzer — AI SEO Intelligence Platform",
    description:
      "Learn about SEO Hub Analyzer's mission: making technical SEO clarity accessible to every team. Built for developers, marketers, and agencies.",
    canonical: `${BASE}/about`,
    keywords: ["about SEO Hub Analyzer", "SEO analysis company", "SEO intelligence platform"],
    ogImage: `${BASE}/og/about.png`,
  },

  // ── Capabilities ─────────────────────────────────────────────
  capabilities: {
    title: "Platform Capabilities — SEO Hub Analyzer Features",
    description:
      "Explore all SEO Hub Analyzer capabilities: technical audits, crawl analysis, performance metrics, AI-generated fixes, and PDF reporting.",
    canonical: `${BASE}/capabilities`,
    keywords: [
      "SEO audit features",
      "technical SEO capabilities",
      "website crawl analysis",
      "AI SEO fix suggestions",
      "SEO report PDF",
    ],
    ogImage: `${BASE}/og/capabilities.png`,
  },

  // ── Workflow ─────────────────────────────────────────────────
  workflow: {
    title: "How SEO Hub Analyzer Works — 3-Step Audit Workflow",
    description:
      "Enter a URL, validate your site's SEO signals, and receive prioritized remediation guidance — all in under 60 seconds.",
    canonical: `${BASE}/workflow`,
    keywords: [
      "how SEO analysis works",
      "website audit workflow",
      "SEO audit steps",
      "site crawl process",
    ],
    ogImage: `${BASE}/og/workflow.png`,
  },

  // ── Overview ─────────────────────────────────────────────────
  overview: {
    title: "Platform Overview — SEO Hub Analyzer",
    description:
      "Get an overview of the SEO Hub Analyzer platform: from crawling to Core Web Vitals reporting and actionable fix recommendations.",
    canonical: `${BASE}/overview`,
    keywords: ["SEO platform overview", "SEO Hub overview", "website intelligence platform"],
    ogImage: `${BASE}/og/overview.png`,
  },

  // ── Docs ─────────────────────────────────────────────────────
  docs: {
    title: "Documentation — SEO Hub Analyzer",
    description:
      "Complete documentation for SEO Hub Analyzer: API guides, integration docs, and step-by-step usage instructions.",
    canonical: `${BASE}/docs`,
    keywords: ["SEO Hub Analyzer docs", "SEO API documentation", "SEO tool guide"],
    ogImage: `${BASE}/og/docs.png`,
  },

  // ── API Reference ─────────────────────────────────────────────
  apiReference: {
    title: "API Reference — SEO Hub Analyzer",
    description:
      "Full API reference for SEO Hub Analyzer. Automate audits, retrieve reports, and integrate SEO intelligence into your own apps.",
    canonical: `${BASE}/api-reference`,
    keywords: ["SEO Hub API", "SEO analysis API", "website audit API reference"],
    ogImage: `${BASE}/og/api-reference.png`,
  },

  // ── Case Studies ──────────────────────────────────────────────
  caseStudies: {
    title: "Case Studies — Real SEO Results with SEO Hub Analyzer",
    description:
      "Discover how teams use SEO Hub Analyzer to find critical issues, improve rankings, and track performance over time.",
    canonical: `${BASE}/case-studies`,
    keywords: ["SEO case studies", "SEO audit results", "SEO improvement examples"],
    ogImage: `${BASE}/og/case-studies.png`,
  },

  // ── Sample Report ─────────────────────────────────────────────
  sampleReport: {
    title: "Sample SEO Report — See What You Get | SEO Hub Analyzer",
    description:
      "Preview a full forensic SEO report: technical issues, performance metrics, rendering diagnostics, and AI-generated fix recommendations.",
    canonical: `${BASE}/sample-report`,
    keywords: ["sample SEO report", "example SEO audit", "SEO report preview"],
    ogImage: `${BASE}/og/sample-report.png`,
  },

  // ── Support ───────────────────────────────────────────────────
  support: {
    title: "Support Center — SEO Hub Analyzer Help & FAQs",
    description:
      "Get help with SEO Hub Analyzer: contact support, browse FAQs, and find answers to common questions about reports, plans, and features.",
    canonical: `${BASE}/support`,
    keywords: ["SEO Hub Analyzer support", "SEO tool help", "SEO analyzer FAQ"],
    ogImage: `${BASE}/og/support.png`,
  },

  // ── Privacy ───────────────────────────────────────────────────
  privacy: {
    title: "Privacy Policy — SEO Hub Analyzer",
    description:
      "Read the SEO Hub Analyzer privacy policy to understand how we collect, use, and protect your data.",
    canonical: `${BASE}/privacy`,
    keywords: ["SEO Hub Analyzer privacy policy"],
    ogImage: `${BASE}/og/privacy.png`,
  },

  // ── Terms ─────────────────────────────────────────────────────
  terms: {
    title: "Terms of Service — SEO Hub Analyzer",
    description: "SEO Hub Analyzer terms of service and acceptable use policy.",
    canonical: `${BASE}/terms`,
    keywords: ["SEO Hub Analyzer terms of service"],
    ogImage: `${BASE}/og/terms.png`,
  },
};
