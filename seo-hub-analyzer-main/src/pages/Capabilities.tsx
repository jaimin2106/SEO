import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Radar, Brain, TrendingUp, Shield, Zap, FileText,
  Globe, Eye, Cpu, BarChart2, Layout, Search
} from "lucide-react";
import Footer from "@/components/seohub/Footer";
import MetaTags from "@/seo/MetaTags";
import { PAGE_META } from "@/seo/pageMeta";


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  })
};

const capabilities = [
  {
    icon: Radar,
    label: "Core",
    title: "Forensic SEO Analysis",
    body: "A 4-stage crawling pipeline — Fast Fetch, Enhanced Fetch, Headless Rendering, Snapshot Recovery — that adapts to every anti-bot measure and delivers complete data even on JavaScript-heavy sites.",
    tags: ["Anti-bot bypass", "CORS handling", "Retry logic"]
  },
  {
    icon: Brain,
    label: "AI",
    title: "AI Visibility Analysis",
    body: "Understand how AI search engines like ChatGPT Browse, Perplexity, and Google AI Overviews see your site. Identify gaps in structured content and semantic authority.",
    tags: ["LLM visibility", "Semantic analysis", "Entity recognition"]
  },
  {
    icon: Shield,
    label: "Technical",
    title: "Technical SEO Auditing",
    body: "Deep inspection covering robots.txt, canonical tags, hreflang, structured data, meta configurations, redirect chains, sitemap integrity, and server-level signals.",
    tags: ["Robots.txt", "Sitemaps", "Canonicals", "Schema.org"]
  },
  {
    icon: Globe,
    label: "Crawl",
    title: "Full-Site Crawling",
    body: "No depth limits. No page caps. Our crawler maps every internal link, discovers orphaned pages, and surfaces architecture issues invisible to shallow surface scans.",
    tags: ["No depth limits", "Orphan detection", "Link mapping"]
  },
  {
    icon: TrendingUp,
    label: "Performance",
    title: "Performance Analysis",
    body: "Live performance measurement integrating Google PageSpeed Insights data with our own timing analysis. Every metric explained in plain language with actionable fixes.",
    tags: ["PageSpeed API", "Live timing", "Optimization roadmap"]
  },
  {
    icon: BarChart2,
    label: "Vitals",
    title: "Core Web Vitals",
    body: "Real-world LCP, CLS, INP, and FID scores analyzed in context. Understand which vitals are failing, why they're failing, and the precise code changes to resolve them.",
    tags: ["LCP", "CLS", "INP", "FID"]
  },
  {
    icon: Zap,
    label: "AI",
    title: "AI Remediation Engine",
    body: "Every issue generates developer-ready fix instructions. Code snippets, configuration examples, and implementation guides your engineering team can act on in the same sprint.",
    tags: ["Code snippets", "Dev guides", "Priority queue"]
  },
  {
    icon: FileText,
    label: "Export",
    title: "PDF Report Exports",
    body: "Generate white-labeled, enterprise-grade PDF reports formatted for client presentations, board reviews, and cross-team technical briefings. Pro plan removes branding entirely.",
    tags: ["White-label", "Branded PDF", "Client-ready"]
  },
  {
    icon: Layout,
    label: "Rendering",
    title: "Responsive Rendering",
    body: "Capture desktop and mobile rendering simultaneously. Identify viewport-specific issues that only appear on certain device sizes, including mobile-only indexing failures.",
    tags: ["Desktop + mobile", "Viewport analysis", "Mobile-first index"]
  },
  {
    icon: Eye,
    label: "UX",
    title: "UX Psychology Analysis",
    body: "Beyond technical auditing — we evaluate user experience signals that search engines increasingly weight: content clarity, readability, engagement indicators, and conversion friction.",
    tags: ["UX signals", "Readability", "Engagement"]
  },
  {
    icon: Search,
    label: "Keywords",
    title: "Keyword Intelligence",
    body: "Discover keyword opportunities your site is close to ranking for, identify thin content targets, and understand the semantic gaps between your content and top-ranking competitors.",
    tags: ["Keyword gaps", "Semantic gaps", "Quick wins"]
  },
  {
    icon: Cpu,
    label: "Infrastructure",
    title: "Server & Infrastructure",
    body: "HTTP header analysis, HTTPS configuration review, compression checks, caching policy audit, and TTFB benchmarking. The server-level signals that define your crawl budget.",
    tags: ["HTTP headers", "HTTPS", "Caching", "TTFB"]
  },
];

const labelColors: Record<string, string> = {
  Core: "bg-[#c96442]/10 text-[#c96442] border-[#c96442]/20",
  AI: "bg-purple-50 text-purple-700 border-purple-200",
  Technical: "bg-amber-50 text-amber-700 border-amber-200",
  Crawl: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Performance: "bg-blue-50 text-blue-700 border-blue-200",
  Vitals: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Export: "bg-[#f0eee6] text-[#5e5d59] border-[#e8e6dc]",
  Rendering: "bg-indigo-50 text-indigo-700 border-indigo-200",
  UX: "bg-rose-50 text-rose-700 border-rose-200",
  Keywords: "bg-green-50 text-green-700 border-green-200",
  Infrastructure: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function Capabilities() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      <MetaTags
        title={PAGE_META.capabilities.title}
        description={PAGE_META.capabilities.description}
        canonical={PAGE_META.capabilities.canonical}
      />
      {/* Hero */}
      <section className="pt-[120px] pb-24 border-b border-[#e8e6dc]">
        <div className="container-page">
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-5"
          >
            Capabilities
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif font-medium text-[48px] sm:text-[62px] leading-[1.08] tracking-[-0.03em] text-[#141413] max-w-[16ch] mb-8"
          >
            Everything your SEO team needs, built into one engine.
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[18px] leading-[1.65] text-[#5e5d59] max-w-[40rem]"
          >
            Twelve interlocking capabilities designed to surface every issue your site has and every 
            opportunity it's missing — from a single scan.
          </motion.p>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-24">
        <div className="container-page">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.04}
                className="group rounded-[20px] border border-[#e8e6dc] bg-white p-7 hover:border-[#d1cfc5] hover:shadow-[0_4px_24px_rgba(20,20,19,0.06)] transition-all"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#faf9f5] border border-[#e8e6dc]">
                    <cap.icon className="h-5 w-5 text-[#5e5d59]" />
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${labelColors[cap.label] ?? "bg-[#f0eee6] text-[#5e5d59] border-[#e8e6dc]"}`}>
                    {cap.label}
                  </span>
                </div>
                <h3 className="font-serif font-medium text-[20px] leading-[1.25] text-[#141413] mb-3">{cap.title}</h3>
                <p className="text-[14px] leading-[1.75] text-[#5e5d59] mb-5">{cap.body}</p>
                <div className="flex flex-wrap gap-2">
                  {cap.tags.map(tag => (
                    <span key={tag} className="text-[11px] text-[#87867f] bg-[#faf9f5] border border-[#e8e6dc] rounded-full px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-20 bg-[#141413]">
        <div className="container-page text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="font-serif font-medium text-[36px] text-[#faf9f5] mb-6 max-w-[24ch] mx-auto leading-[1.2]">
              See all twelve capabilities working together on your site.
            </h2>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#c96442] px-8 py-3.5 text-[15px] font-medium text-white hover:bg-[#b05637] transition-all hover:-translate-y-0.5"
            >
              Run your free scan
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
