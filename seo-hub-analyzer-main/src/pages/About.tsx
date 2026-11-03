import { motion } from "framer-motion";
import Footer from "@/components/seohub/Footer";
import { ArrowRight, BarChart3, Bot, CheckCircle2, FileSearch, LineChart, Lock, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import MetaTags from "@/seo/MetaTags";
import { PAGE_META } from "@/seo/pageMeta";
import { organizationSchema } from "@/seo/schemas";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function About() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#141413] selection:bg-[#c96442]/20 selection:text-[#c96442]">
      <MetaTags
        title={PAGE_META.about.title}
        description={PAGE_META.about.description}
        canonical={PAGE_META.about.canonical}
        schema={organizationSchema}
      />

      <main className="pt-24 lg:pt-32">
        {/* HERO SECTION */}
        <section className="container-page pb-20 pt-10 sm:pt-16">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeUp} className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.16em] text-[#87867f]">
                <Sparkles className="h-3.5 w-3.5 text-[#c96442]" />
                The New Standard
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-serif text-[40px] font-medium leading-[1.1] sm:text-[56px] lg:text-[64px]">
              We build intelligence <br className="hidden sm:block" /> for the modern web.
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-[18px] leading-[1.6] text-[#5e5d59] sm:text-[20px]">
              SEO Hub Analyzer is an enterprise-grade forensic engine designed for developers, SEOs, and founders who demand deep technical truth over superficial checklists.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/#hero"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c96442] px-8 py-3.5 text-[15px] font-medium text-[#faf9f5] shadow-[0_0_0_1px_#c96442] transition-all hover:bg-[#b85a3b]"
              >
                Scan your website
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/sample-report"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8e6dc] px-8 py-3.5 text-[15px] font-medium text-[#4d4c48] shadow-[0_0_0_1px_#d1cfc5] transition-all hover:bg-[#dedc01]/10"
              >
                View sample report
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* MISSION SECTION */}
        <section className="bg-[#141413] py-24 text-[#faf9f5]">
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#87867f]">Our Mission</span>
              <h2 className="mt-4 font-serif text-[32px] font-medium leading-[1.3] sm:text-[40px]">
                The era of generic SEO checklists is over. The future belongs to AI visibility and performance engineering.
              </h2>
              <div className="mt-8 space-y-6 text-[17px] leading-[1.7] text-[#b0aea5]">
                <p>
                  For years, website auditing has been stuck in the past. Tools provide the same tired warnings about meta descriptions while ignoring the massive shift in how search engines actually work.
                </p>
                <p>
                  Search is evolving into an AI-first ecosystem. Large Language Models (LLMs), answer engines, and headless crawlers are changing the definition of technical SEO. We built SEO Hub to bridge the gap between traditional search optimization and modern frontend performance engineering.
                </p>
                <p>
                  Our engine doesn't just check tags; it measures Javascript execution costs, evaluates semantic DOM hierarchies for AI readability, and generates immediate, codebase-ready AI remediation prompts. We give you the truth about your website's architecture.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES SECTION */}
        <section className="container-page py-24">
          <div className="text-center">
            <h2 className="font-serif text-[40px] font-medium text-[#141413]">Platform Capabilities</h2>
            <p className="mt-4 text-[18px] text-[#5e5d59]">A forensic toolkit designed for the modern web architect.</p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileSearch, title: "Forensic Technical SEO", desc: "Deep crawl analysis, JS rendering risks, canonical clustering, and indexability heuristics." },
              { icon: Zap, title: "Core Web Vitals Engine", desc: "Live performance telemetry, main-thread blocking analysis, and granular LCP/INP breakdowns." },
              { icon: Bot, title: "AI Visibility Scoring", desc: "Evaluate your DOM's LLM-readability, snippet optimization, and structured answer readiness." },
              { icon: Sparkles, title: "AI Remediation Prompts", desc: "Generate 1-click, context-aware prompts to fix your entire codebase using Claude or Cursor." },
              { icon: LineChart, title: "UX Psychology Diagnostics", desc: "Measure conversion friction, visual hierarchy, cognitive load, and accessibility signals." },
              { icon: Search, title: "Responsive Visual Intelligence", desc: "Live SERP previews, OpenGraph social card rendering, and mobile viewport simulations." },
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={feature.title} 
                className="group rounded-[16px] border border-[#f0eee6] bg-[#ffffff] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              >
                <div className="inline-flex rounded-xl bg-[#f5f4ed] p-3 text-[#c96442] ring-1 ring-[#e8e6dc]">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-serif text-[24px] font-medium text-[#141413]">{feature.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-[#5e5d59]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-[#ffffff] py-24 border-y border-[#e8e6dc]">
          <div className="container-page">
            <h2 className="text-center font-serif text-[40px] font-medium text-[#141413]">How It Works</h2>
            
            <div className="mt-20 mx-auto max-w-5xl relative">
              <div className="absolute left-[28px] top-[24px] bottom-[24px] w-px bg-[#e8e6dc] hidden md:block"></div>
              
              {[
                { step: "01", title: "Scan & Crawl", desc: "Enter any URL. Our engine bypasses blockers and executes a headless render to see the page exactly as Google does." },
                { step: "02", title: "Forensic Extraction", desc: "We extract over 150+ data points spanning technical setup, performance, metadata, and accessibility." },
                { step: "03", title: "Intelligent Scoring", desc: "Data is passed through our weighted scoring algorithm to determine your overall domain health and risk factors." },
                { step: "04", title: "Remediation & Export", desc: "Receive an interactive dashboard, export an enterprise PDF report, or copy the 1-click AI fix prompt." }
              ].map((item, i) => (
                <div key={item.step} className="relative flex gap-8 mb-12 last:mb-0 md:pl-0 pl-4">
                  <div className="hidden md:flex flex-shrink-0 w-14 h-14 items-center justify-center rounded-full bg-[#faf9f5] border border-[#e8e6dc] shadow-sm z-10 font-serif text-[18px] text-[#c96442]">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <span className="md:hidden text-[12px] font-bold text-[#c96442] mb-1 block">{item.step}</span>
                    <h3 className="font-serif text-[26px] font-medium text-[#141413]">{item.title}</h3>
                    <p className="mt-2 text-[16px] text-[#5e5d59] leading-[1.6] max-w-2xl">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST & INTELLIGENCE */}
        <section className="container-page py-24 text-center">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#87867f]">Enterprise Ready</span>
          <h2 className="mt-4 font-serif text-[40px] font-medium text-[#141413]">Built on trust and deep telemetry.</h2>
          
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { val: "150+", label: "Forensic Data Points" },
              { val: "100%", label: "Headless Execution" },
              { val: "0ms", label: "Dashboard Lag" },
              { val: "1-Click", label: "AI Remediation" }
            ].map(stat => (
              <div key={stat.label} className="rounded-[16px] border border-[#e8e6dc] bg-[#faf9f5] p-8">
                <div className="font-serif text-[48px] font-medium text-[#141413]">{stat.val}</div>
                <div className="mt-1 text-[13px] uppercase tracking-[0.1em] text-[#87867f]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
