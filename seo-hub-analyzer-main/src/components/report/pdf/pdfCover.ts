/**
 * pdfCover.ts — Cover page, header, and Table of Contents builder.
 */

import type { ForensicReport } from "@/lib/forensicTypes";
import type { SubscriptionTier } from "@/contexts/AuthContext";
import { gaugeArc, scoreColor } from "./pdfCharts";

export function buildHeader(
  report: ForensicReport,
  tier: SubscriptionTier
): string {
  const brandName =
    tier === "scale" ? "" : "SEO Hub Analyzer";
  const brandTagline =
    tier === "scale"
      ? "Technical SEO Intelligence Report"
      : "AI-Powered Website Intelligence Platform";

  const dateStr = new Date(report.report_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div class="pdf-header">
      <div>
        <div class="pdf-header-brand">${brandName || "SEO Intelligence Report"}</div>
        <div style="font-size:11px;color:#87867f;margin-top:2px;">${brandTagline}</div>
      </div>
      <div class="pdf-header-meta">
        <div>Report Date</div>
        <div style="color:#141413;font-weight:600;margin-top:2px;">${dateStr}</div>
      </div>
    </div>
  `;
}

export function buildCover(
  report: ForensicReport,
  tier: SubscriptionTier
): string {
  const hostname = (() => {
    try { return new URL(report.url).hostname; } catch { return report.url; }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  const gauge = gaugeArc(report.scores.overall, 160);
  const color = scoreColor(report.scores.overall);

  const statusBadgeClass =
    report.audit_status === "Excellent"
      ? "badge-pass"
      : report.audit_status === "Needs Improvement"
      ? "badge-warn"
      : "badge-critical-status";

  // Strengths & weaknesses summary
  const strengthsList = (report.strengths || [])
    .slice(0, 4)
    .map(
      (s) =>
        `<div class="sw-item"><span class="sw-icon" style="color:#22c55e">✓</span><span>${s}</span></div>`
    )
    .join("");

  const weaknessesList = (report.weaknesses || [])
    .slice(0, 4)
    .map(
      (w) =>
        `<div class="sw-item"><span class="sw-icon" style="color:#c96442">!</span><span>${w}</span></div>`
    )
    .join("");

  return `
    <div class="cover-block avoid-break">
      <div class="cover-eyebrow">Enterprise Forensic Report</div>
      <h1 class="cover-h1">Website Intelligence Report</h1>

      <div class="cover-site">
        <img src="${faviconUrl}" alt="${hostname}" class="cover-favicon"
          onerror="this.style.display='none'" crossorigin="anonymous"/>
        <div>
          <div class="cover-hostname">${hostname}</div>
          <div class="cover-url">${report.url}</div>
        </div>
      </div>

      <div class="score-hero">
        <div class="chart-center">
          ${gauge}
        </div>
        <div class="score-hero-right">
          <div style="margin-bottom:10px;">
            <span class="badge ${statusBadgeClass}">${report.audit_status}</span>
          </div>
          <div style="font-size:12px;color:#5e5d59;margin-bottom:4px;">
            <strong style="color:${color}">${report.issues.filter(i => i.severity === "critical").length}</strong> critical &nbsp;·&nbsp;
            <strong>${report.issues.filter(i => i.severity === "high").length}</strong> high &nbsp;·&nbsp;
            <strong>${report.issues.filter(i => i.severity === "medium").length}</strong> medium
          </div>
          <div style="font-size:12px;color:#5e5d59;margin-bottom:4px;">
            ${report.scope.pages_sampled} pages sampled &nbsp;·&nbsp; ${report.scope.sitemap_urls_discovered} sitemap URLs
          </div>
          ${report.scan_confidence !== undefined && report.scan_confidence < 100
            ? `<div style="font-size:11px;color:#a16207;margin-top:6px;background:#fefce8;border:1px solid #f1e6af;border-radius:8px;padding:6px 10px;">
                ⚠ Partial scan — ${report.scan_confidence}% confidence (${report.coverage_percentage}% coverage)
               </div>`
            : ""}
        </div>
      </div>

      <div class="exec-summary">
        <div class="exec-summary-label">Executive Summary</div>
        <p>${report.ai_summary}</p>
      </div>

      <div class="sw-grid mt-md avoid-break">
        <div class="sw-box strengths-box">
          <div class="sw-title green">✓ &nbsp;Strengths</div>
          ${strengthsList || '<div style="font-size:12px;color:#87867f">No major strengths identified.</div>'}
        </div>
        <div class="sw-box weaknesses-box">
          <div class="sw-title red">! &nbsp;Key Weaknesses</div>
          ${weaknessesList || '<div style="font-size:12px;color:#87867f">No major weaknesses identified.</div>'}
        </div>
      </div>
    </div>
  `;
}

export function buildTableOfContents(tier: SubscriptionTier): string {
  const sections = [
    ["1", "Executive Summary & Score Dashboard"],
    ["2", "Core Web Vitals & Performance"],
    ["3", "Technical SEO Analysis"],
    ["4", "Content & AI Visibility"],
    ["5", "UX & Frontend Quality"],
    ["6", "Issue Breakdown"],
    tier !== "free" ? ["7", "Keyword Intelligence"] : null,
    ["8", "Action Plan & Quick Wins"],
  ].filter(Boolean) as string[][];

  const rows = sections
    .map(
      ([num, label]) =>
        `<div class="toc-row">
          <span class="toc-num">${num}</span>
          <span class="toc-label">${label}</span>
          <span class="toc-dot"></span>
        </div>`
    )
    .join("");

  return `
    <div class="toc avoid-break">
      <div class="toc-title">Table of Contents</div>
      ${rows}
    </div>
  `;
}
