import { useEffect, useState } from "react";
import Footer from "@/components/seohub/Footer";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import type { ForensicReport } from "@/lib/forensicTypes";

// Use the exact same buildPrintHtml to ensure 100% parity
function buildPrintHtml(report: ForensicReport): string {
  const hostname = (() => { try { return new URL(report.url).hostname; } catch { return report.url; } })();
  const criticalIssues = report.issues.filter(i => i.severity === "critical" || i.severity === "high");
  const mediumIssues = report.issues.filter(i => i.severity === "medium");

  function scoreToneClass(score: number) {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#87867f";
    if (score >= 50) return "#eab308";
    return "#c96442";
  }

  function statusIcon(status: "pass" | "warn" | "fail") {
    return status === "pass" ? "✓" : status === "warn" ? "⚠" : "✗";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SEO Report — ${hostname}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#ffffff;color:#141413;font-size:13px;line-height:1.7}
    .page{max-width:860px;margin:0 auto;padding:48px 40px}
    h1{font-size:34px;font-weight:600;line-height:1.1;color:#141413;margin-bottom:8px}
    h2{font-size:18px;font-weight:600;color:#141413;margin:32px 0 12px}
    h3{font-size:14px;font-weight:600;color:#141413;margin-bottom:6px}
    p{color:#5e5d59;line-height:1.7}
    .overline{font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#87867f;margin-bottom:6px}
    .cover{border-bottom:2px solid #ebe6db;padding-bottom:40px;margin-bottom:40px}
    .cover-url{font-size:16px;color:#c96442;font-weight:500;margin-top:4px}
    .meta{font-size:11px;color:#87867f;margin-top:16px}
    .score-hero{display:flex;align-items:center;gap:20px;margin-top:24px}
    .score-number{font-size:72px;font-weight:700;line-height:1}
    .score-label{font-size:14px;color:#87867f;margin-top:4px}
    .summary{background:#f5f3ee;border-radius:16px;padding:20px;margin-top:20px}
    .summary p{color:#5e5d59}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
    .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:12px}
    .card{background:#ffffff;border:1px solid #e8e6dc;border-radius:14px;padding:14px}
    .card-label{font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#87867f}
    .card-value{font-size:24px;font-weight:600;margin-top:4px}
    .card-desc{font-size:12px;color:#5e5d59;margin-top:2px}
    .metric-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f0eee6;background:#fff}
    .metric-row:last-child{border-bottom:none}
    .metric-row:nth-child(even){background:#faf9f5}
    .badge{display:inline-block;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em}
    .badge-pass{background:#f0fdf4;color:#166534}
    .badge-warn{background:#fefce8;color:#a16207}
    .badge-fail{background:#fff5f2;color:#c96442}
    .badge-critical{background:#fff0ee;color:#b91c1c}
    .badge-high{background:#fff5f2;color:#c96442}
    .badge-medium{background:#fefce8;color:#a16207}
    .badge-low{background:#f0fdf4;color:#166534}
    .issue-card{border:1px solid #e8e6dc;border-radius:14px;padding:14px;margin-bottom:10px;background:#fff}
    .issue-title{font-size:14px;font-weight:600;color:#141413;margin:6px 0 4px}
    .issue-meta{font-size:11px;color:#87867f;margin-bottom:6px}
    .issue-summary{font-size:12px;color:#5e5d59}
    .issue-fix{font-size:12px;color:#141413;margin-top:8px;padding-top:8px;border-top:1px solid #f0eee6}
    .progress-bar{height:6px;background:#ede7db;border-radius:3px;margin-top:6px;overflow:hidden}
    .progress-fill{height:100%;border-radius:3px}
    .section{margin-bottom:36px}
    .brand{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
    .brand-name{font-size:16px;font-weight:700;color:#141413}
    .brand-tagline{font-size:11px;color:#87867f}
    footer{border-top:1px solid #ebe6db;padding-top:20px;margin-top:40px;display:flex;justify-content:space-between;font-size:11px;color:#87867f}
  </style>
</head>
<body>
<div class="page">
  <!-- Brand -->
  <div class="brand">
    <div>
      <div class="brand-name">SEO Hub Analyzer</div>
      <div class="brand-tagline">AI-Powered Website Intelligence Platform</div>
    </div>
    <div style="text-align:right">
      <div class="brand-tagline">Report Date</div>
      <div style="font-size:13px;color:#141413">${new Date(report.report_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
  </div>

  <!-- Cover -->
  <div class="cover">
    <div class="overline">Enterprise Forensic Report</div>
    <h1>Website Intelligence Report</h1>
    <div class="cover-url">${hostname}</div>
    <div class="meta">${report.url}</div>

    <div class="score-hero">
      <div>
        <div class="score-number" style="color:${scoreToneClass(report.scores.overall)}">${report.scores.overall}</div>
        <div class="score-label">Overall Score /100</div>
      </div>
      <div>
        <span class="badge ${report.audit_status === "Excellent" ? "badge-pass" : report.audit_status === "Needs Improvement" ? "badge-warn" : "badge-critical"}">${report.audit_status}</span>
        <div style="margin-top:8px;font-size:12px;color:#5e5d59">${report.issues.length} issues detected · ${report.issues.filter(i => i.severity === "critical").length} critical</div>
        <div style="font-size:12px;color:#5e5d59">${report.scope.pages_sampled} pages sampled · ${report.scope.sitemap_urls_discovered} sitemap URLs</div>
      </div>
    </div>

    <div class="summary">
      <div class="overline">Executive Summary</div>
      <p>${report.ai_summary}</p>
    </div>
  </div>

  <!-- Score Grid -->
  <div class="section">
    <h2>Score Breakdown</h2>
    <div class="grid-3">
      ${[
        ["Technical Health", report.scores.technical_health],
        ["Performance", report.scores.performance],
        ["AI Visibility", report.scores.ai_visibility],
        ["Enterprise Readiness", report.scores.enterprise_readiness],
        ["UX Quality", report.scores.ux_quality],
        ["Trust & Security", report.scores.trust],
        ["Content Authority", report.scores.content_authority],
        ["Mobile Experience", report.scores.mobile_experience],
        ["Accessibility", report.scores.accessibility],
      ].map(([label, score]) => `
        <div class="card">
          <div class="card-label">${label}</div>
          <div class="card-value" style="color:${scoreToneClass(score as number)}">${score}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${score}%;background:${scoreToneClass(score as number)}"></div></div>
        </div>
      `).join("")}
    </div>
  </div>

  <!-- Performance & Engineering -->
  <div class="section">
    <h2>Performance & Engineering</h2>
    <div class="grid-2">
      <div class="card">
        <div class="card-label">Mobile (Score: ${report.performance.mobile.score}/100)</div>
        <div style="margin-top:10px">
          ${[
            ["LCP", report.performance.mobile.lcp, report.performance.mobile.lcp_status],
            ["CLS", report.performance.mobile.cls, report.performance.mobile.cls_status],
            ["INP", report.performance.mobile.inp, report.performance.mobile.inp_status],
            ["FCP", report.performance.mobile.fcp, report.performance.mobile.fcp_status],
            ["TBT", report.performance.mobile.tbt, report.performance.mobile.tbt_status],
          ].map(([m, v, s]) => `
            <div class="metric-row">
              <span style="font-weight:600;font-size:12px">${m}</span>
              <span>${v} <span class="badge badge-${s}">${statusIcon(s as "pass"|"warn"|"fail")} ${s}</span></span>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="card">
        <div class="card-label">Desktop (Score: ${report.performance.desktop.score}/100)</div>
        <div style="margin-top:10px">
          ${[
            ["LCP", report.performance.desktop.lcp, report.performance.desktop.lcp_status],
            ["CLS", report.performance.desktop.cls, report.performance.desktop.cls_status],
            ["INP", report.performance.desktop.inp, report.performance.desktop.inp_status],
            ["FCP", report.performance.desktop.fcp, report.performance.desktop.fcp_status],
          ].map(([m, v, s]) => `
            <div class="metric-row">
              <span style="font-weight:600;font-size:12px">${m}</span>
              <span>${v} <span class="badge badge-${s}">${statusIcon(s as "pass"|"warn"|"fail")} ${s}</span></span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
    <div class="grid-2" style="margin-top:12px">
      <div class="card">
        <div class="card-label">Frontend Engineering</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>JS Execution</span><span>${report.performance.engineering.js_execution_cost}</span></div>
          <div class="metric-row"><span>Unused JS</span><span>${report.performance.engineering.unused_js}</span></div>
          <div class="metric-row"><span>Unused CSS</span><span>${report.performance.engineering.unused_css}</span></div>
          <div class="metric-row"><span>Bundle Estimate</span><span>${report.performance.engineering.bundle_size_estimate}</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">Infrastructure</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>HTTP/2</span><span>${report.performance.engineering.http2_support ? "✓ Yes" : "✗ No"}</span></div>
          <div class="metric-row"><span>HTTP/3</span><span>${report.performance.engineering.http3_support ? "✓ Yes" : "✗ No"}</span></div>
          <div class="metric-row"><span>Compression</span><span>${report.performance.engineering.server_compression}</span></div>
          <div class="metric-row"><span>Cache Strategy</span><span>${report.performance.engineering.cache_strategy}</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Technical SEO -->
  <div class="section">
    <h2>Technical SEO</h2>
    <div class="grid-2">
      <div class="card">
        <div class="card-label">Crawl & Indexation</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>XML Sitemap</span><span>${report.technical.xml_sitemap_status}</span></div>
          <div class="metric-row"><span>Robots.txt</span><span>${report.technical.robots_txt_status}</span></div>
          <div class="metric-row"><span>Crawl Budget</span><span>${report.technical.crawl_budget_estimate}</span></div>
          <div class="metric-row"><span>Orphan Pages</span><span>${report.technical.orphan_page_candidates}</span></div>
          <div class="metric-row"><span>Broken Links</span><span>${report.technical.broken_internal_links}</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">Architecture</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>DOM Complexity</span><span>${report.technical.dom_complexity}</span></div>
          <div class="metric-row"><span>URL Structure</span><span>${report.technical.url_structure_quality}</span></div>
          <div class="metric-row"><span>JS Rendering Risk</span><span>${report.technical.javascript_rendering_risk}</span></div>
          <div class="metric-row"><span>Canonical Conflicts</span><span>${report.technical.canonical_conflicts}</span></div>
          <div class="metric-row"><span>Metadata Duplicates</span><span>${report.technical.duplicate_metadata_clusters}</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Experience (UX & Frontend) -->
  <div class="section">
    <h2>Experience (UX & Frontend)</h2>
    <div class="grid-2">
      <div class="card">
        <div class="card-label">UX Psychology</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>Conversion Psychology</span><span>${report.ux.conversion_psychology}</span></div>
          <div class="metric-row"><span>Attention Hierarchy</span><span>${report.ux.attention_hierarchy}</span></div>
          <div class="metric-row"><span>CTA Effectiveness</span><span>${report.ux.cta_effectiveness}</span></div>
          <div class="metric-row"><span>Trust Perception</span><span>${report.ux.trust_perception}</span></div>
          <div class="metric-row"><span>Cognitive Overload</span><span>${report.ux.cognitive_overload}</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">Frontend Quality</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>UI Smoothness</span><span>${report.frontend.ui_smoothness}</span></div>
          <div class="metric-row"><span>Mobile Optimization</span><span>${report.frontend.mobile_optimization}</span></div>
          <div class="metric-row"><span>Accessibility Quality</span><span>${report.frontend.accessibility_quality}</span></div>
          <div class="metric-row"><span>Semantic HTML</span><span>${report.frontend.semantic_html_quality}</span></div>
          <div class="metric-row"><span>Layout Stability</span><span>${report.frontend.layout_stability}</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Previews (Visual Intelligence & Trust) -->
  <div class="section">
    <h2>Visual Intelligence (Previews)</h2>
    <div class="grid-3">
      <div class="card">
        <div class="card-label">On-Page Metadata</div>
        <div style="margin-top:10px">
          <div style="font-size:12px;font-weight:600;margin-bottom:2px">Title (${report.on_page.title.length} chars)</div>
          <div style="font-size:11px;color:#5e5d59;margin-bottom:8px">${report.on_page.title.text}</div>
          <div style="font-size:12px;font-weight:600;margin-bottom:2px">Description (${report.on_page.meta_desc.length} chars)</div>
          <div style="font-size:11px;color:#5e5d59">${report.on_page.meta_desc.text}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">AI Readiness</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>AI Readability</span><span>${report.ai_visibility.ai_readability}</span></div>
          <div class="metric-row"><span>Structured Answers</span><span>${report.ai_visibility.structured_answer_readiness}</span></div>
          <div class="metric-row"><span>Citation Potential</span><span>${report.ai_visibility.citation_potential}</span></div>
          <div class="metric-row"><span>Snippet Opt.</span><span>${report.ai_visibility.snippet_optimization}</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">Security & Trust</div>
        <div style="margin-top:10px">
          <div class="metric-row"><span>HTTPS</span><span>${report.security.https_quality}</span></div>
          <div class="metric-row"><span>SPF</span><span>${report.security.spf_status}</span></div>
          <div class="metric-row"><span>DMARC</span><span>${report.security.dmarc_status}</span></div>
          <div class="metric-row"><span>Trust Badges</span><span>${report.security.trust_badge_quality}</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Plan -->
  ${criticalIssues.length > 0 || mediumIssues.length > 0 || report.quick_wins.length > 0 ? `
  <div class="section">
    <h2>Action Plan (Prioritized Issues)</h2>
    ${criticalIssues.map(issue => `
      <div class="issue-card">
        <div><span class="badge badge-${issue.severity}">${issue.severity.toUpperCase()}</span> <span style="font-size:11px;color:#87867f;text-transform:uppercase;letter-spacing:0.1em">${issue.pillar}</span></div>
        <div class="issue-title">${issue.title}</div>
        <div class="issue-summary">${issue.summary}</div>
        <div class="issue-fix"><strong>Fix:</strong> ${issue.recommended_fix}</div>
        <div style="font-size:11px;color:#87867f;margin-top:6px">Expected gain: ${issue.estimated_gain} · Effort: ${issue.effort}</div>
      </div>
    `).join("")}
    
    ${mediumIssues.map(issue => `
      <div class="issue-card">
        <div><span class="badge badge-medium">MEDIUM</span> <span style="font-size:11px;color:#87867f;text-transform:uppercase;letter-spacing:0.1em">${issue.pillar}</span></div>
        <div class="issue-title">${issue.title}</div>
        <div class="issue-summary">${issue.summary}</div>
        <div style="font-size:11px;color:#87867f;margin-top:6px">Expected gain: ${issue.estimated_gain}</div>
      </div>
    `).join("")}

    <div class="grid-2" style="margin-top:16px">
      ${report.quick_wins.map(win => `
        <div class="card">
          <div class="card-label">${win.pillar} (Quick Win)</div>
          <h3>${win.title}</h3>
          <p style="font-size:12px">${win.estimated_gain}</p>
        </div>
      `).join("")}
    </div>
  </div>` : ""}

  <!-- Footer -->
  <footer>
    <span>SEO Hub Analyzer — AI Website Intelligence Platform</span>
    <span>${report.url}</span>
    <span>Generated ${new Date(report.report_date).toLocaleDateString()}</span>
  </footer>
</div>
</body>
</html>`;
}

// Generate a robust mocked ForensicReport
const mockReport: ForensicReport = {
  url: "https://example.com",
  report_date: new Date().toISOString(),
  audit_status: "Needs Improvement",
  scope: {
    crawl_depth_sampled: 4,
    pages_sampled: 250,
    sampled_urls: [],
    sitemap_urls_discovered: 1200,
    analysis_constraints: []
  },
  scores: {
    overall: 68,
    enterprise_readiness: 72,
    ai_visibility: 54,
    technical_health: 65,
    ux_quality: 78,
    trust: 90,
    conversion: 65,
    frontend_engineering: 70,
    performance: 58,
    content_authority: 74,
    mobile_experience: 60,
    accessibility: 85
  },
  scorecards: [],
  ai_summary: "The site demonstrates strong accessibility and trust signals, but suffers from significant AI visibility gaps and mobile performance bottlenecks. Main thread blocking and JS hydration are actively suppressing Core Web Vitals. To recover lost ranking potential, prioritize modernizing the frontend architecture and optimizing for headless crawler readability.",
  executive_insights: [],
  strengths: [],
  weaknesses: [],
  quick_wins: [
    {
      id: "qw1",
      severity: "low",
      pillar: "Performance",
      title: "Preload LCP Image",
      summary: "Hero image is discovered late.",
      why_it_matters: "",
      evidence: [],
      affected_urls: [],
      effort: "low",
      score_loss: 0,
      estimated_gain: "+4 points to Mobile Score",
      expected_after: "",
      recommended_fix: "Add <link rel='preload'> for the hero image in the head.",
      developer_fix_guide: "",
      business_impact: ""
    },
    {
      id: "qw2",
      severity: "low",
      pillar: "AI Visibility",
      title: "Add Breadcrumb Schema",
      summary: "Missing structured data for navigation.",
      why_it_matters: "",
      evidence: [],
      affected_urls: [],
      effort: "low",
      score_loss: 0,
      estimated_gain: "+12% Snippet Clickthrough Rate",
      expected_after: "",
      recommended_fix: "Implement JSON-LD breadcrumb schema.",
      developer_fix_guide: "",
      business_impact: ""
    }
  ],
  high_impact_fixes: [],
  issues: [
    {
      id: "1",
      severity: "critical",
      pillar: "Performance",
      title: "Main Thread Blocked by Hydration",
      summary: "React hydration is blocking the main thread for over 450ms on mobile devices.",
      why_it_matters: "Severe impact on INP and TBT, leading to high bounce rates.",
      evidence: ["Hydration task: 480ms", "Framework: React"],
      affected_urls: ["/"],
      effort: "high",
      score_loss: 15,
      estimated_gain: "Sub-200ms INP",
      expected_after: "Smooth interactivity",
      recommended_fix: "Implement partial hydration or React Server Components to reduce client-side JS.",
      developer_fix_guide: "",
      business_impact: "Improves conversion by 12%"
    },
    {
      id: "2",
      severity: "high",
      pillar: "Technical SEO",
      title: "Missing Canonical Tags",
      summary: "Multiple paginated and filtered URLs lack proper canonicalization.",
      why_it_matters: "Causes index bloat and duplicate content penalties.",
      evidence: ["/?sort=price", "/?category=all"],
      affected_urls: ["/category/shoes"],
      effort: "medium",
      score_loss: 10,
      estimated_gain: "Consolidated link equity",
      expected_after: "",
      recommended_fix: "Add self-referencing canonical tags to all core pages.",
      developer_fix_guide: "",
      business_impact: ""
    },
    {
      id: "3",
      severity: "medium",
      pillar: "AI Visibility",
      title: "Poor Snippet Optimization",
      summary: "Meta descriptions are truncated and lack concise answer formats.",
      why_it_matters: "Reduces visibility in AI Overviews and traditional SERPs.",
      evidence: [],
      affected_urls: [],
      effort: "medium",
      score_loss: 5,
      estimated_gain: "Higher CTR from LLM queries",
      expected_after: "",
      recommended_fix: "Rewrite meta descriptions to directly answer user intent within 155 chars.",
      developer_fix_guide: "",
      business_impact: ""
    }
  ],
  performance: {
    mobile: {
      score: 54,
      lcp: "3.8 s",
      cls: "0.15",
      inp: "320 ms",
      fcp: "2.1 s",
      tbt: "480 ms",
      ttfb: "0.8 s",
      speed_index: "4.2 s",
      lcp_status: "warn",
      cls_status: "warn",
      inp_status: "fail",
      fcp_status: "warn",
      tbt_status: "fail"
    },
    desktop: {
      score: 82,
      lcp: "1.8 s",
      cls: "0.04",
      inp: "80 ms",
      fcp: "1.1 s",
      tbt: "120 ms",
      ttfb: "0.4 s",
      speed_index: "1.9 s",
      lcp_status: "pass",
      cls_status: "pass",
      inp_status: "pass",
      fcp_status: "pass",
      tbt_status: "pass"
    },
    request_profile: {
      total_requests: 48,
      total_transfer_size: "1.9 MB",
      render_blocking_resources: 3,
      third_party_requests: 10,
      largest_requests: [],
      critical_request_chains: 2,
    },
    engineering: {
      js_execution_cost: "1.2s",
      hydration_cost: "480ms",
      bundle_size_estimate: "1.8MB",
      unused_js: "450KB",
      unused_css: "85KB",
      image_optimization: "Mixed",
      modern_image_support: "Strong",
      font_loading_strategy: "Optimized",
      cdn_optimization: "Strong",
      cache_strategy: "Mixed",
      server_compression: "Partial",
      http2_support: true,
      http3_support: false,
      critical_rendering_path: "Render-blocking CSS detected",
      animation_performance: "Smooth",
      scroll_performance: "Smooth",
      gpu_acceleration: "Present",
      observations: []
    }
  },
  technical: {
    crawl_depth: 4,
    internal_pages_sampled: 250,
    average_internal_links: 12,
    internal_link_graph_density: 0.4,
    orphan_page_candidates: 12,
    broken_internal_links: 3,
    broken_external_links: 5,
    redirect_chain_risk: 2,
    redirect_loop_risk: 0,
    canonical_conflicts: 18,
    duplicate_metadata_clusters: 4,
    duplicate_content_clusters: 2,
    indexability_risk_pages: 8,
    hreflang_issues: 0,
    robots_meta_issues: 2,
    pagination_issues: 4,
    structured_data_types: ["Organization", "WebSite"],
    breadcrumb_schema_valid: false,
    xml_sitemap_status: "Present",
    robots_txt_status: "Present",
    crawl_budget_estimate: "Watch",
    javascript_rendering_risk: "High",
    hydration_risk: "High",
    lazy_loading_issues: 2,
    render_blocking_resources: 3,
    dom_complexity: "Heavy",
    url_structure_quality: "Moderate",
    parameter_pollution_risk: "Low",
    thin_content_pages: 14,
    soft_404_candidates: 2,
    og_tags: true,
    twitter_card: false,
    observations: []
  },
  frontend: {
    score: 70,
    ui_smoothness: "Moderate",
    interaction_quality: "Strong",
    responsiveness_quality: "Strong",
    mobile_optimization: "Moderate",
    layout_stability: "Moderate",
    animation_sophistication: "Strong",
    motion_consistency: "Strong",
    microinteraction_quality: "Strong",
    visual_hierarchy: "Strong",
    spacing_consistency: "Strong",
    accessibility_quality: "Strong",
    semantic_html_quality: "Moderate",
    component_architecture_signals: "Modern",
    modern_frontend_standards: "Strong",
    observations: []
  },
  ux: {
    score: 78,
    trust_perception: "High",
    premium_feel: "High",
    emotional_engagement: "High",
    visual_psychology: "Clear",
    conversion_psychology: "Moderate",
    cta_effectiveness: "Strong",
    cognitive_overload: "Low",
    attention_hierarchy: "Strong",
    user_retention_potential: "High",
    clarity_of_messaging: "Strong",
    friction_points: ["Mobile speed is slow enough to create abandonment risk."],
    onboarding_quality: "Strong",
    first_impression: "Premium",
    enterprise_trust_signals: "Strong",
    perceived_product_quality: "High",
    observations: []
  },
  content: {
    score: 74,
    word_count: 1200,
    reading_time: "5 min",
    readability_score: 65,
    readability_label: "Standard",
    topical_authority: "Strong",
    semantic_relevance: "Strong",
    entity_coverage: "Strong",
    nlp_keyword_relationships: [],
    keyword_cannibalization_risk: "Low",
    search_intent_alignment: "Strong",
    eeat_signals: { expertise: true, authoritativeness: true, trustworthiness: true },
    ai_content_footprint: "Low",
    freshness: "Fresh",
    expertise_indicators: [],
    trust_indicators: [],
    content_depth_quality: "Moderate",
    audience_targeting_quality: "Strong",
    primary_entities: ["SEO", "Analytics", "SaaS"],
    observations: []
  },
  ai_visibility: {
    score: 54,
    ai_readability: "Moderate",
    llm_visibility_optimization: "Weak",
    semantic_chunk_quality: "Weak",
    structured_answer_readiness: "Weak",
    citation_potential: "Medium",
    snippet_optimization: "Weak",
    ai_search_friendliness: "Moderate",
    answer_engine_optimization: "Weak",
    conversational_query_optimization: "Moderate",
    snippet_optimized: false,
    llm_friendly_structure: false,
    recommendations: []
  },
  security: {
    score: 90,
    https_quality: "Strong",
    hsts: true,
    csp: false,
    spf_status: "Verified",
    dkim_status: "Verified",
    dmarc_status: "Verified",
    unsafe_external_links: 0,
    mixed_content: 0,
    cookie_security: "Moderate",
    exposed_emails: [],
    trust_badge_quality: "Strong",
    compliance_signals: ["GDPR Ready"],
    observations: []
  },
  benchmarking: {
    overall_positioning: "Strong competitive footing, pacing ahead of industry baselines in mobile performance.",
    baselines: []
  },
  keyword_intelligence: {
    score: 82,
    top_ranking_keywords: 45,
    total_traffic_value: "$4,200",
    opportunities: [
      { keyword: "seo analyzer tool", intent: "Commercial", search_volume: 12000, difficulty: 65, current_rank: 12, cpc: "$3.50" },
      { keyword: "how to improve website ranking", intent: "Informational", search_volume: 8500, difficulty: 45, current_rank: 4, cpc: "$1.20" },
      { keyword: "technical seo audit", intent: "Commercial", search_volume: 5400, difficulty: 58, current_rank: 8, cpc: "$4.80" },
      { keyword: "core web vitals test", intent: "Navigational", search_volume: 22000, difficulty: 32, current_rank: null, cpc: "$0.90" },
      { keyword: "buy seo software", intent: "Transactional", search_volume: 3100, difficulty: 82, current_rank: null, cpc: "$12.00" }
    ]
  },
  on_page: {
    title: { text: "Enterprise AI SEO Platform - SEO Hub", length: 36, status: "Pass" },
    meta_desc: { text: "Advanced forensic SEO intelligence for developers.", length: 50, status: "Warning" }
  }
};

export default function SampleReport() {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    // We add a tiny tweak to body styling for the iframe wrapper to make it center nicely
    const rawHtml = buildPrintHtml(mockReport);
    const tweakedHtml = rawHtml.replace(
      "body{", 
      "body{background:transparent !important;"
    ).replace(
      ".page{", 
      ".page{background:#faf9f5 !important;box-shadow:0 10px 40px rgba(0,0,0,0.05);border-radius:8px;margin-top:20px;margin-bottom:20px;"
    );
    setHtmlContent(tweakedHtml);
  }, []);

  const handleDownload = () => {
    const rawHtml = buildPrintHtml(mockReport);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(rawHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };
  };

  return (
    <div className="min-h-screen bg-[#f5f4ed] text-[#141413]">

      <main className="pt-24 lg:pt-32 pb-20">
        <div className="container-page">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link to="/" className="mb-4 inline-flex items-center text-[13px] font-medium text-[#5e5d59] hover:text-[#141413]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="font-serif text-[32px] font-medium leading-[1.2] text-[#141413] sm:text-[40px]">
                Sample PDF Report
              </h1>
              <p className="mt-2 text-[15px] text-[#5e5d59]">
                This is a realistic, interactive preview of the enterprise PDF export generated by our forensic engine.
              </p>
            </div>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full border border-[#141413] bg-[#141413] px-6 py-2.5 text-[14px] font-medium text-[#faf9f5] transition-all hover:bg-[#30302e] hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              Test PDF Export
            </button>
          </div>

          <div className="relative mx-auto max-w-[900px] overflow-hidden rounded-[16px] border border-[#e8e6dc] bg-[#e8e6dc]/30 p-2 sm:p-6 md:p-8">
            <div className="w-full overflow-hidden rounded-[8px] bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
              {/* Iframe acts as an isolated viewport for the raw HTML string */}
              {htmlContent && (
                <iframe
                  srcDoc={htmlContent}
                  title="Sample PDF Report"
                  className="h-[80vh] w-full border-none bg-transparent"
                  sandbox="allow-same-origin allow-scripts"
                />
              )}
            </div>
          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto">
            <h2 className="text-[32px] font-serif font-medium mb-4">Ready to scan your own site?</h2>
            <p className="text-[16px] text-[#5e5d59] mb-8">
              Get the same level of enterprise forensic analysis for your own domain in less than 2 minutes.
            </p>
            <Link 
              to="/#hero" 
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#c96442] px-8 text-[16px] font-semibold tracking-[0.02em] text-[#faf9f5] transition-all hover:-translate-y-1 hover:bg-[#b05638] hover:shadow-lg"
            >
              Generate Your Report
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
