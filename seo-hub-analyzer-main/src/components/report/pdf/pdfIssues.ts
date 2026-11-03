/**
 * pdfIssues.ts — Full grouped issue breakdown section.
 * Issues are sorted Critical → High → Medium → Low.
 * Each card includes: title, pillar, summary, why-it-matters, evidence,
 * recommended fix, expected gain, effort, and business impact.
 */

import type { AuditIssue, ForensicReport } from "@/lib/forensicTypes";
import type { SubscriptionTier } from "@/contexts/AuthContext";
import { issueDonut } from "./pdfCharts";

function issueCard(issue: AuditIssue): string {
  const evidenceHtml = issue.evidence
    .slice(0, 4)
    .map(
      (e) =>
        `<li class="evidence-list-item" style="display:flex;align-items:flex-start;gap:6px;font-size:12px;color:#5e5d59;margin-bottom:3px;line-height:1.6;">
          <span style="width:5px;height:5px;border-radius:50%;background:#c96442;margin-top:7px;flex-shrink:0;display:inline-block;"></span>
          ${e}
        </li>`
    )
    .join("");

  return `
    <div class="issue-card issue-${issue.severity} avoid-break">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
        <span class="badge badge-${issue.severity}">${issue.severity.toUpperCase()}</span>
        <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-top:1px;">${issue.pillar}</span>
        <span style="margin-left:auto;display:flex;gap:8px;flex-shrink:0;">
          <span style="font-size:11px;color:#87867f;">Effort: <strong style="color:#141413">${issue.effort}</strong></span>
          <span style="font-size:11px;color:#87867f;">Score loss: <strong style="color:#c96442">-${issue.score_loss}</strong></span>
        </span>
      </div>

      <div class="issue-title">${issue.title}</div>
      <div class="issue-summary">${issue.summary}</div>

      <div class="issue-detail-grid">
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:6px;">Why It Matters</div>
          <p style="font-size:12px;color:#5e5d59;line-height:1.7;">${issue.why_it_matters}</p>

          ${evidenceHtml ? `
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin:10px 0 5px;">Evidence</div>
            <ul style="list-style:none;padding:0;margin:0;">${evidenceHtml}</ul>
          ` : ""}
        </div>

        <div>
          <div class="issue-detail-box">
            <div class="issue-detail-label">Expected Gain</div>
            <div style="font-size:13px;font-weight:600;color:#22c55e;margin-bottom:6px;">${issue.estimated_gain}</div>
            <div class="issue-detail-label">After Fix</div>
            <div class="issue-detail-text">${issue.expected_after}</div>
          </div>

          <div class="issue-detail-box" style="margin-top:8px;">
            <div class="issue-detail-label">Business Impact</div>
            <div class="issue-detail-text">${issue.business_impact}</div>
          </div>
        </div>
      </div>

      <div class="issue-fix-bar">
        <strong>Recommended Fix</strong>
        ${issue.recommended_fix}
      </div>

      ${issue.developer_fix_guide ? `
        <div style="margin-top:8px;padding:10px 12px;background:#faf9f5;border-radius:10px;border:1px solid #e8e6dc;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:4px;">Developer Guide</div>
          <div style="font-size:12px;color:#5e5d59;line-height:1.65;">${issue.developer_fix_guide}</div>
        </div>
      ` : ""}
    </div>
  `;
}

function severityGroup(
  label: string,
  color: string,
  issues: AuditIssue[],
  limited?: boolean
): string {
  if (issues.length === 0) return "";

  return `
    <div class="severity-group">
      <div class="severity-group-header">
        <div class="severity-group-title" style="color:${color}">${label}</div>
        <span class="severity-count">${issues.length} issue${issues.length !== 1 ? "s" : ""}</span>
        ${limited ? `<span style="margin-left:auto;font-size:11px;font-weight:600;color:#c96442;">Showing 1 of ${issues.length} — Upgrade to Pro for full access</span>` : ""}
      </div>
      ${issues.map(issueCard).join("")}
    </div>
  `;
}

export function buildIssuesSection(
  report: ForensicReport,
  tier: SubscriptionTier
): string {
  const allIssues = report.issues;
  const critical = allIssues.filter((i) => i.severity === "critical");
  const high = allIssues.filter((i) => i.severity === "high");
  const medium = allIssues.filter((i) => i.severity === "medium");
  const low = allIssues.filter((i) => i.severity === "low");

  const isFree = tier === "free";

  // Free tier: only show first critical issue, first medium issue
  const shownCritical = isFree ? critical.slice(0, 1) : critical;
  const shownHigh = isFree ? [] : high;
  const shownMedium = isFree ? medium.slice(0, 1) : medium;
  const shownLow = isFree ? [] : low;

  const donut = issueDonut(critical.length, high.length, medium.length, low.length, 110);

  return `
    <div class="page-break section">
      <div class="section-label">Section 6</div>
      <div class="section-h2">Issue Breakdown</div>

      <!-- Summary bar -->
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;padding:16px 20px;background:white;border:1px solid #e8e6dc;border-radius:14px;" class="avoid-break">
        ${donut}
        <div style="flex:1">
          <div style="display:flex;flex-wrap:wrap;gap:12px;">
            <div style="text-align:center;min-width:56px;">
              <div style="font-size:24px;font-weight:700;color:#c96442;">${critical.length}</div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#87867f;">Critical</div>
            </div>
            <div style="text-align:center;min-width:56px;">
              <div style="font-size:24px;font-weight:700;color:#e57a5a;">${high.length}</div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#87867f;">High</div>
            </div>
            <div style="text-align:center;min-width:56px;">
              <div style="font-size:24px;font-weight:700;color:#eab308;">${medium.length}</div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#87867f;">Medium</div>
            </div>
            <div style="text-align:center;min-width:56px;">
              <div style="font-size:24px;font-weight:700;color:#87867f;">${low.length}</div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#87867f;">Low</div>
            </div>
          </div>
          <div style="margin-top:12px;font-size:12px;color:#5e5d59;line-height:1.7;">
            ${allIssues.length} total issues detected across all SEO pillars.
            ${critical.length > 0 ? `<strong style="color:#c96442">${critical.length} critical issue${critical.length !== 1 ? "s" : ""}</strong> require${critical.length === 1 ? "s" : ""} immediate attention.` : ""}
          </div>
        </div>
      </div>

      ${isFree ? `
        <div style="background:#fff8e6;border:1px solid #f5d988;border-radius:12px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#a16207;">
          ⚠ <strong>Preview Report:</strong> Showing a partial preview (1 critical + 1 medium issue). 
          Upgrade to <strong>Pro</strong> to unlock all ${allIssues.length} issues with full developer guides and business impact analysis.
        </div>
      ` : ""}

      ${severityGroup("🔴 Critical Issues", "#b91c1c", shownCritical, isFree && critical.length > 1)}
      ${severityGroup("🟠 High Priority Issues", "#c96442", shownHigh)}
      ${severityGroup("🟡 Medium Priority Issues", "#a16207", shownMedium, isFree && medium.length > 1)}
      ${severityGroup("⚪ Low Priority Issues", "#5e5d59", shownLow)}
    </div>
  `;
}
