import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Book, Code, Cpu, Globe, Zap, FileText, ChevronRight, Copy, Check } from "lucide-react";
import Footer from "@/components/seohub/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const navSections = [
  { id: "getting-started", label: "Getting Started", icon: Book },
  { id: "crawl-architecture", label: "Crawl Architecture", icon: Cpu },
  { id: "ai-remediation", label: "AI Remediation", icon: Zap },
  { id: "reports", label: "Reports & Exports", icon: FileText },
  { id: "api", label: "API Reference", icon: Code },
  { id: "integrations", label: "Integrations", icon: Globe },
];

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-[14px] bg-[#141413] border border-[#30302e] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#30302e]">
        <span className="text-[11px] font-mono text-[#87867f] uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#87867f] hover:text-[#faf9f5] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-[13px] leading-relaxed font-mono text-[#e8e6dc]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      {/* Header */}
      <div className="pt-[76px] border-b border-[#e8e6dc] bg-[#faf9f5]">
        <div className="container-page py-10">
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-3"
          >
            Documentation
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif font-medium text-[36px] sm:text-[44px] leading-[1.1] text-[#141413]"
          >
            SEO Hub Analyzer Docs
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[15px] text-[#5e5d59] mt-3 max-w-[36rem]"
          >
            Everything you need to understand, configure, and integrate the platform.
          </motion.p>
        </div>
      </div>

      <div className="container-page flex gap-10 py-12">
        {/* Sidebar */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-24 space-y-1">
            {navSections.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] text-left transition-colors ${
                  activeSection === s.id
                    ? "bg-[#141413] text-[#faf9f5]"
                    : "text-[#5e5d59] hover:bg-[#e8e6dc] hover:text-[#141413]"
                }`}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                {s.label}
              </button>
            ))}
            <div className="pt-4 border-t border-[#e8e6dc] mt-4">
              <Link to="/api-reference" className="flex items-center gap-2 text-[13px] text-[#c96442] hover:text-[#b05637] transition-colors">
                <Code className="h-4 w-4" /> API Reference <ChevronRight className="h-3 w-3 ml-auto" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-20">

          <motion.section id="getting-started" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="scroll-mt-24">
            <h2 className="font-serif font-medium text-[32px] text-[#141413] mb-4">Getting Started</h2>
            <p className="text-[16px] leading-[1.75] text-[#5e5d59] mb-8">
              SEO Hub Analyzer requires no installation and no API key to begin. Navigate to the homepage, 
              enter any URL, and your first forensic report is ready in under 30 seconds.
            </p>

            <h3 className="font-serif font-medium text-[22px] text-[#141413] mb-3">Quick start</h3>
            <ol className="space-y-3 mb-8">
              {[
                "Navigate to seohubanalyzer.com",
                "Paste a domain (e.g. yoursite.com) into the URL analyzer",
                "Click \"Run scan\" — no login required",
                "Review your Intelligence Report",
                "Click any issue to expand AI remediation instructions",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-[#5e5d59]">
                  <span className="shrink-0 h-6 w-6 rounded-full bg-[#e8e6dc] text-[#141413] text-[12px] font-semibold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <h3 className="font-serif font-medium text-[22px] text-[#141413] mb-4">URL format</h3>
            <CodeBlock language="text" code={`# All of these are valid inputs:
example.com
www.example.com
https://example.com
https://www.example.com/page`} />
          </motion.section>

          <motion.section id="crawl-architecture" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="scroll-mt-24">
            <h2 className="font-serif font-medium text-[32px] text-[#141413] mb-4">Crawl Architecture</h2>
            <p className="text-[16px] leading-[1.75] text-[#5e5d59] mb-6">
              Our crawling pipeline operates in four successive stages. If a stage fails, the engine 
              automatically falls back to the next — ensuring maximum data recovery.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { stage: "Stage 1", name: "Fast Fetch", desc: "Direct HTTP fetch with SEO-friendly user agent. Fastest method, succeeds on ~60% of sites." },
                { stage: "Stage 2", name: "Enhanced Fetch", desc: "Fetch with browser-like headers and multiple proxy endpoints. Resolves most CORS and geo-blocking issues." },
                { stage: "Stage 3", name: "Headless Rendering", desc: "Via Microlink API — full JavaScript rendering for SPAs, React, and Vue applications." },
                { stage: "Stage 4", name: "Snapshot Recovery", desc: "Retrieves cached versions when live access is blocked by Cloudflare, reCAPTCHA, or aggressive rate limiting." },
              ].map(s => (
                <div key={s.stage} className="rounded-[16px] border border-[#e8e6dc] bg-white p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#87867f]">{s.stage}</span>
                    <span className="font-medium text-[15px] text-[#141413]">{s.name}</span>
                  </div>
                  <p className="text-[14px] text-[#5e5d59] leading-[1.7]">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section id="ai-remediation" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="scroll-mt-24">
            <h2 className="font-serif font-medium text-[32px] text-[#141413] mb-4">AI Remediation</h2>
            <p className="text-[16px] leading-[1.75] text-[#5e5d59] mb-6">
              Pro accounts unlock the AI Remediation Engine — a per-issue reasoning layer that generates 
              developer-ready fix instructions, code snippets, and implementation timelines.
            </p>
            <CodeBlock language="response" code={`{
  "issue": "Missing meta description",
  "severity": "high",
  "score_impact": -8,
  "fix": {
    "instruction": "Add a unique meta description between 150–160 characters",
    "code": "<meta name=\\"description\\" content=\\"Your compelling page summary here. Keep it between 150–160 characters for maximum SERP visibility.\\" />",
    "file_hint": "Modify the <head> section of your HTML template",
    "effort": "Low — 15 minutes"
  }
}`} />
          </motion.section>

          <motion.section id="reports" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="scroll-mt-24">
            <h2 className="font-serif font-medium text-[32px] text-[#141413] mb-4">Reports & Exports</h2>
            <p className="text-[16px] leading-[1.75] text-[#5e5d59] mb-6">
              Every scan generates a persistent Intelligence Report accessible via a shareable URL. 
              Pro users can export PDF reports formatted for client presentations.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Shareable URL", desc: "Every report gets a permanent, shareable link. No login required to view." },
                { title: "PDF Export", desc: "Branded PDF download available to all logged-in users. Pro removes SEO Hub branding." },
                { title: "Report sections", desc: "Overview, Technical, Performance, On-Page, Keyword Intelligence, AI Remediation." },
                { title: "Score system", desc: "0–100 composite score with per-pillar breakdowns. Weighted by SEO impact." },
              ].map(item => (
                <div key={item.title} className="rounded-[14px] border border-[#e8e6dc] bg-white p-5">
                  <h4 className="font-medium text-[15px] text-[#141413] mb-1.5">{item.title}</h4>
                  <p className="text-[13px] text-[#5e5d59] leading-[1.65]">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section id="api" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="scroll-mt-24">
            <h2 className="font-serif font-medium text-[32px] text-[#141413] mb-4">API Reference</h2>
            <p className="text-[16px] leading-[1.75] text-[#5e5d59] mb-6">
              The REST API is available in beta for Scale plan accounts. Programmatically trigger scans 
              and retrieve structured report data.
            </p>
            <Link
              to="/api-reference"
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#141413] px-5 py-2.5 text-[14px] font-medium text-[#faf9f5] hover:bg-[#2a2927] transition-all"
            >
              View full API reference <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.section>

          <motion.section id="integrations" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="scroll-mt-24">
            <h2 className="font-serif font-medium text-[32px] text-[#141413] mb-4">Integrations</h2>
            <p className="text-[16px] leading-[1.75] text-[#5e5d59] mb-6">
              SEO Hub Analyzer is a standalone web application. Integrations with popular platforms 
              are on the roadmap.
            </p>
            <div className="rounded-[16px] border border-[#e8e6dc] bg-[#faf9f5] p-6 text-center">
              <p className="text-[14px] text-[#87867f]">Slack, Notion, Google Search Console, and Zapier integrations coming in Q3 2025.</p>
              <p className="text-[13px] text-[#87867f] mt-2">Upvote on our roadmap or reach out to request an integration.</p>
            </div>
          </motion.section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
