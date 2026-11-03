import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Radar, Zap, Brain, FileText, TrendingUp, Shield } from "lucide-react";
import Footer from "@/components/seohub/Footer";
import Navbar from "@/components/seohub/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  })
};

const pillars = [
  {
    icon: Radar,
    title: "Forensic Crawling",
    body: "A 4-stage crawling pipeline that bypasses CORS, anti-bot measures, and JavaScript rendering to retrieve complete site data."
  },
  {
    icon: Brain,
    title: "AI Reasoning Engine",
    body: "Every issue is scored, explained, and remediated by an AI reasoning layer trained on modern SEO best practices."
  },
  {
    icon: TrendingUp,
    title: "Performance Intelligence",
    body: "Core Web Vitals, LCP, CLS, FID — analyzed in context with your full technical stack and competitive landscape."
  },
  {
    icon: Shield,
    title: "Technical Auditing",
    body: "Deep inspection of robots.txt, sitemaps, canonicalization, structured data, and server-level configuration signals."
  },
  {
    icon: Zap,
    title: "Instant Remediation",
    body: "AI-generated code snippets, developer guides, and prioritized fix queues so your team ships improvements faster."
  },
  {
    icon: FileText,
    title: "Enterprise Exports",
    body: "Branded PDF reports formatted for client presentations, investor updates, and cross-team technical reviews."
  },
];

export default function Overview() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      {/* Hero */}
      <section className="pt-[120px] pb-24 border-b border-[#e8e6dc]">
        <div className="container-page">
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-5"
          >
            Platform Overview
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif font-medium text-[52px] sm:text-[64px] leading-[1.08] tracking-[-0.03em] text-[#141413] max-w-[14ch] mb-8"
          >
            SEO intelligence built for clarity.
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[18px] sm:text-[20px] leading-[1.65] text-[#5e5d59] max-w-[42rem] mb-12"
          >
            SEO Hub Analyzer combines enterprise-grade crawling with an AI reasoning engine to surface what matters — 
            the issues quietly costing you rankings and the precise fixes to address them.
          </motion.p>
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#141413] px-6 py-3 text-[15px] font-medium text-[#faf9f5] hover:bg-[#2a2927] transition-all hover:-translate-y-0.5"
            >
              Start free scan <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/sample-report"
              className="inline-flex items-center gap-2 rounded-[12px] border border-[#e8e6dc] bg-white px-6 py-3 text-[15px] font-medium text-[#141413] hover:bg-[#faf9f5] transition-all"
            >
              View sample report
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 border-b border-[#e8e6dc]">
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-4">Our Philosophy</p>
              <h2 className="font-serif font-medium text-[36px] leading-[1.2] text-[#141413] mb-6">
                Diagnosis first. Action always.
              </h2>
              <p className="text-[16px] leading-[1.75] text-[#5e5d59] mb-6">
                Most SEO tools produce reports. We produce intelligence. Every finding comes with an explanation of 
                why it matters, the business impact of ignoring it, and step-by-step remediation guidance your 
                developers can execute immediately.
              </p>
              <p className="text-[16px] leading-[1.75] text-[#5e5d59]">
                We built SEO Hub Analyzer because the gap between "knowing what's wrong" and "knowing how to fix it" 
                costs teams weeks. Our AI closes that gap in seconds.
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="rounded-[24px] bg-[#141413] p-8 sm:p-10"
            >
              <div className="space-y-6">
                {["Crawl depth: Unlimited", "AI confidence scoring: Yes", "Core Web Vitals: Live", "Keyword intelligence: Included", "PDF exports: Branded"].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[#30302e] pb-4 last:border-0 last:pb-0">
                    <span className="text-[14px] text-[#b0aea5]">{item.split(":")[0]}</span>
                    <span className="text-[14px] font-medium text-[#faf9f5]">{item.split(":")[1]}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 bg-[#141413]">
        <div className="container-page">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-4">Architecture</p>
            <h2 className="font-serif font-medium text-[40px] leading-[1.15] text-[#faf9f5] max-w-[18ch] mx-auto">
              Six layers of intelligence working as one.
            </h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05}
                className="rounded-[20px] border border-[#30302e] bg-[#1a1a18] p-7 hover:border-[#5e5d59] transition-colors"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#c96442]/10 border border-[#c96442]/20">
                  <pillar.icon className="h-5 w-5 text-[#c96442]" />
                </div>
                <h3 className="font-serif font-medium text-[20px] text-[#faf9f5] mb-3">{pillar.title}</h3>
                <p className="text-[14px] leading-[1.75] text-[#87867f]">{pillar.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[#e8e6dc]">
        <div className="container-page text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="font-serif font-medium text-[40px] leading-[1.15] text-[#141413] mb-6 max-w-[20ch] mx-auto">
              Ready to see what your site is missing?
            </h2>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#c96442] px-8 py-3.5 text-[15px] font-medium text-white hover:bg-[#b05637] transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(201,100,66,0.25)]"
            >
              Run a free audit <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
