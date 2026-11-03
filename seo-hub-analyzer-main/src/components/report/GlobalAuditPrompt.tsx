import { useState } from "react";
import type { ForensicReport } from "@/lib/forensicTypes";

const AI_MODELS = [
  { id: "claude", label: "Claude", emoji: "🤖", url: "https://claude.ai", color: "bg-[#f5f0e8] text-[#7c5a3c] border-[#e8d9c0]" },
  { id: "chatgpt", label: "ChatGPT", emoji: "💬", url: "https://chat.openai.com", color: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]" },
  { id: "gemini", label: "Gemini", emoji: "✨", url: "https://gemini.google.com", color: "bg-[#fef9f0] text-[#9a3412] border-[#fed7aa]" },
  { id: "cursor", label: "Cursor", emoji: "⚡", url: null, color: "bg-[#f0f4ff] text-[#3b4fc4] border-[#c9d3f5]" },
  { id: "windsurf", label: "Windsurf", emoji: "🌊", url: null, color: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]" },
  { id: "deepseek", label: "DeepSeek", emoji: "🔍", url: "https://chat.deepseek.com", color: "bg-[#f5f3ff] text-[#4c1d95] border-[#ddd6fe]" },
  { id: "copilot", label: "Copilot", emoji: "🪁", url: "https://copilot.microsoft.com", color: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]" },
  { id: "local", label: "Local LLM", emoji: "🏠", url: null, color: "bg-[#f5f4ed] text-[#5e5d59] border-[#e0dbd0]" },
];

function buildWholeAuditPrompt(report: ForensicReport, model: string): string {
  const hostname = (() => { try { return new URL(report.url).hostname; } catch { return report.url; } })();
  const criticalIssues = report.issues.filter(i => i.severity === "critical" || i.severity === "high");
  const mediumIssues = report.issues.filter(i => i.severity === "medium");
  const lowIssues = report.issues.filter(i => i.severity === "low");

  const isDevTool = model === "cursor" || model === "windsurf";
  const header = isDevTool
    ? `You are a senior technical SEO engineer. I need you to fix a series of SEO, performance, and UX issues in my codebase for the website: ${report.url}\n\nAnalyze the audit below and implement the recommended fixes directly in the code.`
    : `Act as a world-class technical SEO engineer, web performance specialist, and UX consultant. I have run a comprehensive forensic audit on my website and need your expert guidance to fix all issues.\n\nWebsite: ${report.url}`;

  return `${header}

==================================================
FULL SITE AUDIT REPORT — ${hostname.toUpperCase()}
==================================================
Report Date: ${new Date(report.report_date).toLocaleDateString()}
Overall Score: ${report.scores.overall}/100 (${report.audit_status})

DIMENSION SCORES:
• Technical Health: ${report.scores.technical_health}/100
• Performance: ${report.scores.performance}/100
• AI Visibility: ${report.scores.ai_visibility}/100
• Enterprise Readiness: ${report.scores.enterprise_readiness}/100
• UX Quality: ${report.scores.ux_quality}/100
• Trust & Security: ${report.scores.trust}/100
• Content Authority: ${report.scores.content_authority}/100
• Frontend Engineering: ${report.scores.frontend_engineering}/100
• Mobile Experience: ${report.scores.mobile_experience}/100
• Accessibility: ${report.scores.accessibility}/100

==================================================
EXECUTIVE SUMMARY
==================================================
${report.ai_summary}

KEY SIGNALS:
${report.executive_insights.map((s, i) => `${i + 1}. ${s}`).join("\n")}

STRENGTHS:
${report.strengths.map((s) => `• ${s}`).join("\n") || "• None identified in the sampled crawl."}

WEAKNESSES:
${report.weaknesses.map((s) => `• ${s}`).join("\n")}

==================================================
CORE WEB VITALS (MOBILE)
==================================================
• LCP: ${report.performance.mobile.lcp} (${report.performance.mobile.lcp_status.toUpperCase()})
• CLS: ${report.performance.mobile.cls} (${report.performance.mobile.cls_status.toUpperCase()})
• INP: ${report.performance.mobile.inp} (${report.performance.mobile.inp_status.toUpperCase()})
• FCP: ${report.performance.mobile.fcp} (${report.performance.mobile.fcp_status.toUpperCase()})
• TBT: ${report.performance.mobile.tbt} (${report.performance.mobile.tbt_status.toUpperCase()})
• TTFB: ${report.performance.mobile.ttfb}
• Speed Index: ${report.performance.mobile.speed_index}
• Mobile Score: ${report.performance.mobile.score}/100

CORE WEB VITALS (DESKTOP):
• LCP: ${report.performance.desktop.lcp} | CLS: ${report.performance.desktop.cls} | Desktop Score: ${report.performance.desktop.score}/100

ENGINEERING:
• JS Execution Cost: ${report.performance.engineering.js_execution_cost}
• Bundle Estimate: ${report.performance.engineering.bundle_size_estimate}
• Unused JS: ${report.performance.engineering.unused_js}
• Unused CSS: ${report.performance.engineering.unused_css}
• Render-Blocking Resources: ${report.technical.render_blocking_resources}
• HTTP/2: ${report.performance.engineering.http2_support ? "Yes" : "No"}
• HTTP/3: ${report.performance.engineering.http3_support ? "Yes" : "No"}
• Cache Strategy: ${report.performance.engineering.cache_strategy}
• Compression: ${report.performance.engineering.server_compression}

==================================================
TECHNICAL SEO
==================================================
• XML Sitemap: ${report.technical.xml_sitemap_status}
• Robots.txt: ${report.technical.robots_txt_status}
• DOM Complexity: ${report.technical.dom_complexity}
• Crawl Budget: ${report.technical.crawl_budget_estimate}
• URL Structure: ${report.technical.url_structure_quality}
• JS Rendering Risk: ${report.technical.javascript_rendering_risk}
• Hydration Risk: ${report.technical.hydration_risk}
• Canonical Conflicts: ${report.technical.canonical_conflicts}
• Duplicate Metadata Clusters: ${report.technical.duplicate_metadata_clusters}
• Duplicate Content Clusters: ${report.technical.duplicate_content_clusters}
• Thin Content Pages: ${report.technical.thin_content_pages}
• Orphan Page Candidates: ${report.technical.orphan_page_candidates}
• Broken Internal Links: ${report.technical.broken_internal_links}
• Structured Data Types: ${report.technical.structured_data_types.join(", ") || "None detected"}

==================================================
ON-PAGE METADATA
==================================================
• Title Tag: "${report.on_page.title.text}" (${report.on_page.title.length} chars — ${report.on_page.title.status})
• Meta Description: "${report.on_page.meta_desc.text}" (${report.on_page.meta_desc.length} chars — ${report.on_page.meta_desc.status})

==================================================
CONTENT INTELLIGENCE
==================================================
• Word Count: ${report.content.word_count}
• Readability: ${report.content.readability_score} (${report.content.readability_label})
• Content Depth: ${report.content.content_depth_quality}
• Topical Authority: ${report.content.topical_authority}
• Semantic Relevance: ${report.content.semantic_relevance}
• Search Intent Alignment: ${report.content.search_intent_alignment}
• E-E-A-T — Expertise: ${report.content.eeat_signals.expertise ? "Present" : "Missing"}, Authoritativeness: ${report.content.eeat_signals.authoritativeness ? "Present" : "Missing"}, Trustworthiness: ${report.content.eeat_signals.trustworthiness ? "Present" : "Missing"}
• AI Content Footprint: ${report.content.ai_content_footprint}
• Primary Entities: ${report.content.primary_entities.join(", ") || "None identified"}

==================================================
AI VISIBILITY & ANSWER ENGINE OPTIMIZATION
==================================================
• AI Readability: ${report.ai_visibility.ai_readability}
• LLM Visibility Optimization: ${report.ai_visibility.llm_visibility_optimization}
• Structured Answer Readiness: ${report.ai_visibility.structured_answer_readiness}
• Citation Potential: ${report.ai_visibility.citation_potential}
• Snippet Optimization: ${report.ai_visibility.snippet_optimization}
• FAQ Schema: ${report.technical.breadcrumb_schema_valid ? "Present" : "Missing"}

==================================================
SECURITY & TRUST
==================================================
• HTTPS Quality: ${report.security.https_quality}
• HSTS: ${report.security.hsts ? "Enabled" : "Missing"}
• CSP: ${report.security.csp ? "Present" : "Missing"}
• SPF: ${report.security.spf_status}
• DKIM: ${report.security.dkim_status}
• DMARC: ${report.security.dmarc_status}
• Trust Badge Quality: ${report.security.trust_badge_quality}
• Cookie Security: ${report.security.cookie_security}
• Compliance Signals: ${report.security.compliance_signals.join(", ") || "None detected"}

==================================================
PRIORITIZED ISSUES TO FIX
==================================================

${criticalIssues.length > 0 ? `🔴 CRITICAL / HIGH SEVERITY (${criticalIssues.length} issues — fix immediately):
${criticalIssues.map((issue, i) => `
[${i + 1}] ${issue.title}
   Pillar: ${issue.pillar}
   Summary: ${issue.summary}
   Why it matters: ${issue.why_it_matters}
   Evidence: ${issue.evidence.join(" | ")}
   Recommended fix: ${issue.recommended_fix}
   Developer guide: ${issue.developer_fix_guide}
   Business impact: ${issue.business_impact}
   Expected gain: ${issue.estimated_gain}
`).join("\n")}` : ""}

${mediumIssues.length > 0 ? `🟡 MEDIUM SEVERITY (${mediumIssues.length} issues — fix this sprint):
${mediumIssues.slice(0, 6).map((issue, i) => `
[${i + 1}] ${issue.title}
   Summary: ${issue.summary}
   Fix: ${issue.recommended_fix}
   Gain: ${issue.estimated_gain}
`).join("\n")}` : ""}

${lowIssues.length > 0 ? `🟢 LOW SEVERITY (${lowIssues.length} issues — backlog):
${lowIssues.slice(0, 4).map((issue, i) => `[${i + 1}] ${issue.title} — ${issue.summary}`).join("\n")}` : ""}

==================================================
QUICK WINS (low effort, high value)
==================================================
${report.quick_wins.map((w, i) => `${i + 1}. ${w.title} — ${w.estimated_gain}`).join("\n")}

==================================================
INSTRUCTIONS FOR YOU
==================================================
${isDevTool
  ? `1. Review every issue above and implement code-level fixes
2. Start with Critical/High severity issues
3. For each fix, show me the exact file changes
4. Use modern best practices and follow existing code patterns
5. After fixing, explain what was changed and what improvement is expected`
  : `1. Create a comprehensive, step-by-step remediation plan for this website
2. Start with the Critical and High severity issues
3. For each issue, provide:
   a. Root cause explanation
   b. Exact implementation code/config
   c. Framework-agnostic AND framework-specific guidance where applicable
   d. Verification steps to confirm the fix is working
4. Then address performance improvements (Core Web Vitals)
5. Then address AI visibility and content improvements
6. Provide an estimated timeline and priority order
7. At the end, summarize what the overall score improvement will be after all fixes`
}`;
}

interface Props {
  report: ForensicReport;
}

export function GlobalAuditPrompt({ report }: Props) {
  const [activeModel, setActiveModel] = useState("claude");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const prompt = buildWholeAuditPrompt(report, activeModel);
  const model = AI_MODELS.find(m => m.id === activeModel)!;
  const issueCount = report.issues.length;
  const criticalCount = report.issues.filter(i => i.severity === "critical" || i.severity === "high").length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* fallback */ }
  };

  const handleOpenInAi = () => {
    if (model.url) {
      window.open(model.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-[30px] border border-[#e8e6dc] bg-[#141413] p-7 text-[#faf9f5] shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#87867f]">Whole-Site Remediation Prompt</p>
          <h3 className="mt-2 text-[22px] leading-[1.2] text-[#faf9f5]">
            Fix every issue with one AI prompt
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7] text-[#b0aea5]">
            A complete, context-rich prompt covering all {issueCount} detected issues ({criticalCount} critical) — ready to paste into any AI tool.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 rounded-full border border-[#30302e] bg-[#1f1e1a] px-4 py-2 text-[13px] text-[#b0aea5] transition-colors hover:border-[#c96442] hover:text-[#faf9f5]"
        >
          {expanded ? "Collapse" : "Expand"} prompt
          <span className="text-[10px]">{expanded ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="mt-5 flex flex-wrap gap-3">
        {[
          { label: "Issues covered", value: issueCount },
          { label: "Critical/High", value: criticalCount },
          { label: "Score to recover", value: `+${Math.min(35, report.issues.reduce((s, i) => s + i.score_loss, 0))} pts` },
          { label: "Prompt chars", value: prompt.length.toLocaleString() },
        ].map(stat => (
          <div key={stat.label} className="rounded-[14px] border border-[#30302e] bg-[#1f1e1a] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">{stat.label}</p>
            <p className="mt-0.5 text-[16px] text-[#faf9f5]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Model selector */}
      <div className="mt-6">
        <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[#87867f]">Choose your AI tool</p>
        <div className="flex flex-wrap gap-2">
          {AI_MODELS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModel(m.id)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
                activeModel === m.id
                  ? "border-[#c96442] bg-[#c96442]/15 text-[#faf9f5] shadow-sm"
                  : "border-[#30302e] bg-[#1f1e1a] text-[#b0aea5] hover:border-[#5e5d59] hover:text-[#faf9f5]"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt preview / textarea */}
      {expanded && (
        <div className="mt-5 overflow-hidden rounded-[18px] border border-[#30302e] bg-[#0f0e0c]">
          <textarea
            readOnly
            value={prompt}
            rows={16}
            className="w-full resize-none bg-transparent px-5 py-4 font-mono text-[12px] leading-[1.8] text-[#b0aea5] outline-none"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-all ${
            copied
              ? "bg-[#22c55e] text-white"
              : "bg-[#faf9f5] text-[#141413] hover:bg-[#ebe6db]"
          }`}
        >
          {copied ? "✓ Copied to clipboard!" : `Copy ${model.label} prompt`}
        </button>
        {model.url && (
          <button
            type="button"
            onClick={handleOpenInAi}
            className="flex items-center gap-2 rounded-full border border-[#30302e] bg-[#1f1e1a] px-5 py-2.5 text-[13px] text-[#b0aea5] transition-colors hover:border-[#c96442] hover:text-[#faf9f5]"
          >
            Open {model.label} ↗
          </button>
        )}
        <p className="ml-auto text-[12px] text-[#5e5d59]">
          Copy → Paste into {model.label} → Fix entire website
        </p>
      </div>
    </div>
  );
}
