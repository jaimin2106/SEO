/**
 * pdfActionPlan.ts — Quick Wins, High-Impact Fixes, Keyword Intelligence,
 *                    and AI Remediation Summary section.
 */

import type { ForensicReport } from "@/lib/forensicTypes";
import type { SubscriptionTier } from "@/contexts/AuthContext";

function intentBadge(intent: string): string {
  const map: Record<string, string> = {
    Informational: "badge-info",
    Commercial: "badge-commercial",
    Transactional: "badge-transactional",
    Navigational: "badge-navigational",
  };
  return `<span class="badge ${map[intent] || "badge-warn"}">${intent}</span>`;
}

function difficultyBar(difficulty: number): string {
  const color =
    difficulty > 60 ? "#c96442" : difficulty > 40 ? "#eab308" : "#22c55e";
  return `
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:12px;color:#5e5d59;min-width:24px;">${difficulty}</span>
      <div style="width:60px;height:5px;background:#ede7db;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${difficulty}%;background:${color};border-radius:3px;"></div>
      </div>
    </div>
  `;
}

export function buildActionPlanSection(
  report: ForensicReport,
  tier: SubscriptionTier
): string {
  const isFree = tier === "free";
  const quickWins = isFree
    ? report.quick_wins.slice(0, 2)
    : report.quick_wins;
  const highImpact = isFree
    ? report.high_impact_fixes.slice(0, 2)
    : report.high_impact_fixes;

  const quickWinCards = quickWins
    .map(
      (win) => `
        <div class="quick-win-card avoid-break">
          <div class="qw-pillar">${win.pillar} · Quick Win</div>
          <div class="qw-title">${win.title}</div>
          <div style="font-size:12px;color:#5e5d59;margin:4px 0;">${win.summary}</div>
          <div class="qw-gain">▲ ${win.estimated_gain}</div>
          <div style="display:flex;gap:10px;margin-top:8px;font-size:11px;color:#87867f;">
            <span>Effort: <strong style="color:#141413">${win.effort}</strong></span>
          </div>
        </div>
      `
    )
    .join("");

  const highImpactItems = highImpact
    .map(
      (fix, i) => `
        <div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid #f0eee6;${i === highImpact.length - 1 ? "border-bottom:none;" : ""}" class="avoid-break">
          <div style="width:28px;height:28px;border-radius:50%;background:#141413;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${i + 1}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:#141413;margin-bottom:3px;">${fix.title}</div>
            <div style="font-size:12px;color:#5e5d59;margin-bottom:6px;">${fix.summary}</div>
            <div style="font-size:12px;color:#141413;">${fix.recommended_fix}</div>
            <div style="display:flex;gap:12px;margin-top:6px;font-size:11px;color:#87867f;">
              <span>Gain: <strong style="color:#22c55e">${fix.estimated_gain}</strong></span>
              <span>Effort: <strong style="color:#141413">${fix.effort}</strong></span>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  // Keyword table
  const kwRows = report.keyword_intelligence?.opportunities
    ? (isFree
        ? report.keyword_intelligence.opportunities.slice(0, 3)
        : report.keyword_intelligence.opportunities
      )
        .map(
          (opp) => `
            <tr>
              <td style="font-weight:600;color:#141413;">${opp.keyword}</td>
              <td>${intentBadge(opp.intent)}</td>
              <td style="text-align:right;">${opp.search_volume.toLocaleString()}</td>
              <td>${difficultyBar(opp.difficulty)}</td>
              <td style="text-align:right;font-weight:600;">${opp.current_rank ? `#${opp.current_rank}` : "–"}</td>
              <td style="text-align:right;">${opp.cpc || "–"}</td>
            </tr>
          `
        )
        .join("")
    : "";

  // AI Insights
  const insights = (report.executive_insights || []).slice(0, 6);

  return `
    <div class="page-break section">
      <div class="section-label">Section 7–8</div>
      <div class="section-h2">Action Plan & Quick Wins</div>

      ${quickWins.length > 0 ? `
        <div class="sub-h3">⚡ Quick Wins</div>
        <div class="grid-2">
          ${quickWinCards}
        </div>
      ` : ""}

      ${highImpact.length > 0 ? `
        <div class="sub-h3 mt-md">🎯 High-Impact Fixes</div>
        <div style="background:white;border:1px solid #e8e6dc;border-radius:14px;padding:4px 16px;" class="avoid-break">
          ${highImpactItems}
        </div>
      ` : ""}

      ${kwRows && !isFree ? `
        <div class="sub-h3 mt-md">📊 Keyword Intelligence</div>
        <div style="margin-bottom:8px;font-size:12px;color:#5e5d59;">
          ${report.keyword_intelligence.top_ranking_keywords} tracked keywords · Est. traffic value: 
          <strong style="color:#22c55e">${report.keyword_intelligence.total_traffic_value}</strong>
        </div>
        <table class="kw-table avoid-break" style="border:1px solid #e8e6dc;border-radius:14px;overflow:hidden;">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Intent</th>
              <th style="text-align:right">Volume</th>
              <th>Difficulty</th>
              <th style="text-align:right">Rank</th>
              <th style="text-align:right">CPC</th>
            </tr>
          </thead>
          <tbody>${kwRows}</tbody>
        </table>
      ` : isFree && kwRows ? `
        <div class="sub-h3 mt-md">📊 Keyword Intelligence (Preview)</div>
        <table class="kw-table avoid-break" style="border:1px solid #e8e6dc;border-radius:14px;overflow:hidden;">
          <thead>
            <tr>
              <th>Keyword</th><th>Intent</th><th style="text-align:right">Volume</th><th>Difficulty</th><th style="text-align:right">Rank</th><th style="text-align:right">CPC</th>
            </tr>
          </thead>
          <tbody>${kwRows}</tbody>
        </table>
        <div style="font-size:11px;color:#87867f;margin-top:8px;text-align:center;">Showing 3 of ${report.keyword_intelligence.opportunities.length} keyword opportunities. Upgrade to Pro for full access.</div>
      ` : ""}

      ${insights.length > 0 ? `
        <div class="sub-h3 mt-md">🤖 AI Intelligence Insights</div>
        <div style="background:#f5f3ee;border:1px solid #e8e6dc;border-radius:14px;padding:16px 18px;" class="avoid-break">
          <ul style="list-style:none;padding:0;margin:0;">
            ${insights.map((insight, i) => `
              <li style="display:flex;gap:10px;margin-bottom:${i < insights.length - 1 ? "10px" : "0"};padding-bottom:${i < insights.length - 1 ? "10px" : "0"};${i < insights.length - 1 ? "border-bottom:1px solid #e8e6dc;" : ""}">
                <span style="font-size:11px;font-weight:700;color:#87867f;margin-top:1px;flex-shrink:0;">${String(i + 1).padStart(2, "0")}</span>
                <span style="font-size:12px;color:#5e5d59;line-height:1.7;">${insight}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  `;
}
