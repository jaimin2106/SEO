import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, ArrowUpRight } from "lucide-react";
import Footer from "@/components/seohub/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  })
};

const studies = [
  {
    company: "FormFlow SaaS",
    industry: "B2B SaaS",
    tag: "Technical SEO",
    headline: "From 23 to 74 — a complete technical overhaul in 6 weeks.",
    challenge: "FormFlow had accumulated years of technical debt: broken canonical chains, missing meta descriptions on 200+ pages, and an LCP score of 5.8 seconds. Organic traffic had plateaued for 14 months.",
    approach: "We ran a full forensic scan identifying 47 critical issues. Using the AI remediation engine, the engineering team received specific code changes for every issue — prioritized by score impact.",
    results: [
      { label: "Health score", before: "23", after: "74", unit: "/100" },
      { label: "LCP", before: "5.8s", after: "1.9s", unit: "" },
      { label: "Organic traffic", before: "—", after: "+43%", unit: "" },
      { label: "Time to fix", before: "—", after: "6 weeks", unit: "" },
    ],
    fixes: ["Canonical chain repair", "Meta description generation (200 pages)", "Image optimization", "Core Web Vitals remediation", "Structured data addition"],
  },
  {
    company: "NexusStore",
    industry: "E-commerce",
    tag: "Performance",
    headline: "LCP cut in half. Conversion rate up 18%.",
    challenge: "NexusStore's category pages were failing Core Web Vitals across the board. Google Search Console showed a 34% impression drop YoY, directly correlating with the introduction of a page-builder tool that added 2.4MB of unoptimized JavaScript.",
    approach: "The forensic scan isolated the exact JavaScript payloads causing the problem. Our performance analysis revealed three specific third-party scripts responsible for 78% of the performance regression.",
    results: [
      { label: "LCP", before: "4.1s", after: "1.8s", unit: "" },
      { label: "CLS", before: "0.38", after: "0.04", unit: "" },
      { label: "Page weight", before: "4.2MB", after: "1.1MB", unit: "" },
      { label: "Conversion rate", before: "—", after: "+18%", unit: "" },
    ],
    fixes: ["JavaScript bundle audit", "Third-party script removal", "Image lazy loading", "CLS fix via reserved dimensions", "Critical CSS inlining"],
  },
  {
    company: "Vertex Labs Blog",
    industry: "Developer Content",
    tag: "On-Page SEO",
    headline: "128 articles, zero canonical issues. Rankings recovered in 3 months.",
    challenge: "A CMS migration left Vertex Labs with 128 articles suffering from duplicate content across www and non-www variants, missing hreflang on multilingual pages, and 64 pages with thin content flagged by Google's Helpful Content Update.",
    approach: "The AI remediation layer generated redirect rules, canonical tag configurations, and a content expansion plan for every thin-content page — grouped by topic cluster for editorial efficiency.",
    results: [
      { label: "Canonical issues", before: "128", after: "0", unit: "" },
      { label: "hreflang coverage", before: "12%", after: "100%", unit: "" },
      { label: "Top-3 rankings", before: "14", after: "67", unit: "" },
      { label: "Recovery time", before: "—", after: "3 months", unit: "" },
    ],
    fixes: ["Canonical tag implementation", "hreflang coverage", "Redirect rule generation", "Content depth expansion", "Sitemap rebuild"],
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      {/* Hero */}
      <section className="pt-[120px] pb-24 border-b border-[#e8e6dc]">
        <div className="container-page">
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-5"
          >
            Case Studies
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif font-medium text-[48px] sm:text-[62px] leading-[1.08] tracking-[-0.03em] text-[#141413] max-w-[16ch] mb-8"
          >
            Real results. Real sites. Real numbers.
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[18px] leading-[1.65] text-[#5e5d59] max-w-[40rem]"
          >
            Three detailed before-and-after studies showing what happens when teams act on 
            forensic intelligence rather than surface-level audits.
          </motion.p>
        </div>
      </section>

      {/* Studies */}
      <section className="py-24">
        <div className="container-page space-y-24">
          {studies.map((study, i) => (
            <motion.article
              key={study.company}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05}
              className="grid gap-10 lg:grid-cols-[1fr_380px]"
            >
              {/* Left: narrative */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#87867f] border border-[#e8e6dc] rounded-full px-3 py-1">
                    {study.industry}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] bg-[#c96442]/10 text-[#c96442] border border-[#c96442]/20 rounded-full px-3 py-1">
                    {study.tag}
                  </span>
                </div>
                <h2 className="font-serif font-medium text-[30px] sm:text-[36px] leading-[1.2] text-[#141413] mb-2">
                  {study.company}
                </h2>
                <p className="text-[18px] text-[#c96442] font-medium mb-8">{study.headline}</p>

                <div className="space-y-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#87867f] mb-2">Challenge</p>
                    <p className="text-[15px] leading-[1.75] text-[#5e5d59]">{study.challenge}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#87867f] mb-2">Approach</p>
                    <p className="text-[15px] leading-[1.75] text-[#5e5d59]">{study.approach}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#87867f] mb-3">Key Fixes</p>
                    <div className="flex flex-wrap gap-2">
                      {study.fixes.map(fix => (
                        <span key={fix} className="text-[12px] text-[#5e5d59] bg-white border border-[#e8e6dc] rounded-full px-3 py-1.5">
                          {fix}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: metrics */}
              <div className="space-y-4">
                {study.results.map((r, j) => (
                  <div key={j} className="rounded-[16px] border border-[#e8e6dc] bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#87867f] mb-3">{r.label}</p>
                    <div className="flex items-end gap-4">
                      {r.before !== "—" && (
                        <div className="text-center">
                          <div className="text-[11px] text-[#87867f] mb-1">Before</div>
                          <div className="font-serif font-medium text-[28px] text-[#87867f] leading-none">{r.before}{r.unit}</div>
                        </div>
                      )}
                      {r.before !== "—" && (
                        <ArrowRight className="h-4 w-4 text-[#e8e6dc] mb-1.5 shrink-0" />
                      )}
                      <div className="text-center">
                        <div className="text-[11px] text-[#87867f] mb-1">After</div>
                        <div className="font-serif font-medium text-[28px] text-[#c96442] leading-none flex items-center gap-1">
                          {r.after}{r.unit}
                          <ArrowUpRight className="h-4 w-4 text-[#c96442]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#141413]">
        <div className="container-page text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-[#c96442]" />
              <span className="text-[13px] text-[#87867f] uppercase tracking-widest font-semibold">Your results could be next</span>
            </div>
            <h2 className="font-serif font-medium text-[36px] text-[#faf9f5] mb-6 leading-[1.2] max-w-[22ch] mx-auto">
              Run your first forensic scan — free.
            </h2>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#c96442] px-8 py-3.5 text-[15px] font-medium text-white hover:bg-[#b05637] transition-all hover:-translate-y-0.5"
            >
              Start a free scan <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
