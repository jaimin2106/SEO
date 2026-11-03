import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Cpu, Brain, FileText, Zap, BarChart2 } from "lucide-react";
import Footer from "@/components/seohub/Footer";
import MetaTags from "@/seo/MetaTags";
import { PAGE_META } from "@/seo/pageMeta";


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  })
};

const steps = [
  {
    number: "01",
    icon: Globe,
    title: "Enter your website",
    body: "Paste any URL into our analyzer. No account required to start. We immediately resolve the domain and begin establishing identity.",
    detail: "URL normalization, HTTPS validation, redirect resolution"
  },
  {
    number: "02",
    icon: Cpu,
    title: "Deep crawl begins",
    body: "A 4-stage pipeline activates: Fast Fetch → Enhanced Fetch → Headless Rendering → Snapshot Recovery. Each stage is a fallback for the last, ensuring complete data retrieval even against heavy anti-bot protection.",
    detail: "~8–30 seconds depending on site complexity"
  },
  {
    number: "03",
    icon: Brain,
    title: "Technical analysis",
    body: "Simultaneously, we analyze your HTML structure, meta configuration, heading hierarchy, internal linking, image optimization, structured data, and server-level HTTP signals.",
    detail: "60+ technical SEO checkpoints evaluated in parallel"
  },
  {
    number: "04",
    icon: BarChart2,
    title: "Performance measurement",
    body: "Live performance data is retrieved from the Google PageSpeed API. Core Web Vitals — LCP, CLS, INP — are scored against real-world thresholds and ranked by impact.",
    detail: "Desktop and mobile scores, separately analyzed"
  },
  {
    number: "05",
    icon: Zap,
    title: "AI reasoning layer",
    body: "Every finding passes through our AI reasoning engine. It determines severity, ranks issues by business impact, writes explanations in plain language, and generates targeted remediation instructions.",
    detail: "Issues sorted by score impact and effort"
  },
  {
    number: "06",
    icon: FileText,
    title: "Report generation",
    body: "A structured Intelligence Report is compiled — complete with an overall health score, pillar breakdowns, prioritized issue list, and performance dashboard. Ready in seconds.",
    detail: "Shareable URL, PDF export, AI remediation prompts"
  },
  {
    number: "07",
    icon: Brain,
    title: "AI remediation prompts",
    body: "Pro users unlock AI-powered fix instructions for every issue. Developer-ready code snippets, configuration examples, and implementation guides your engineering team can ship this sprint.",
    detail: "Per-issue code generation, framework-aware fixes"
  },
  {
    number: "08",
    icon: BarChart2,
    title: "Optimization tracking",
    body: "Re-scan at any time to measure progress. Historical comparisons show your score trajectory and confirm that fixes are having their intended impact on your technical baseline.",
    detail: "Score history, regression detection, team sharing"
  },
];

export default function Workflow() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      <MetaTags
        title={PAGE_META.workflow.title}
        description={PAGE_META.workflow.description}
        canonical={PAGE_META.workflow.canonical}
      />
      {/* Hero */}
      <section className="pt-[120px] pb-24 border-b border-[#e8e6dc]">
        <div className="container-page">
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-5"
          >
            How It Works
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif font-medium text-[48px] sm:text-[62px] leading-[1.08] tracking-[-0.03em] text-[#141413] max-w-[16ch] mb-8"
          >
            From URL to intelligence in under thirty seconds.
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[18px] leading-[1.65] text-[#5e5d59] max-w-[40rem]"
          >
            A deeply engineered eight-stage pipeline that transforms a domain name into an 
            enterprise-grade SEO intelligence report.
          </motion.p>
        </div>
      </section>

      {/* Steps Timeline */}
      <section className="py-24">
        <div className="container-page max-w-[800px]">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[27px] top-0 bottom-0 w-px bg-[#e8e6dc] hidden sm:block" />

            <div className="space-y-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05}
                  className="relative flex gap-8 pb-16 last:pb-0"
                >
                  {/* Number circle */}
                  <div className="relative z-10 hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#e8e6dc] bg-[#f5f4ed] font-serif font-medium text-[18px] text-[#87867f]">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 sm:pt-3">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="sm:hidden font-serif font-medium text-[14px] text-[#87867f]">{step.number}</span>
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#faf9f5] border border-[#e8e6dc]">
                        <step.icon className="h-4 w-4 text-[#c96442]" />
                      </div>
                    </div>
                    <h3 className="font-serif font-medium text-[24px] leading-[1.25] text-[#141413] mb-3">{step.title}</h3>
                    <p className="text-[15px] leading-[1.75] text-[#5e5d59] mb-4">{step.body}</p>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-3.5 py-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#c96442]" />
                      <span className="text-[12px] text-[#5e5d59]">{step.detail}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="py-20 bg-[#141413]">
        <div className="container-page text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="font-serif font-medium text-[36px] text-[#faf9f5] mb-6 leading-[1.2] max-w-[22ch] mx-auto">
              Experience the workflow yourself — free, no account needed.
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
