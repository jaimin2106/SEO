/**
 * pdfScores.ts — Score Dashboard section with radar chart + score cards.
 */

import type { ForensicReport } from "@/lib/forensicTypes";
import { radarChart, miniBar, scoreColor } from "./pdfCharts";

function scoreCard(label: string, score: number): string {
  const color = scoreColor(score);
  return `
    <div class="card avoid-break">
      <div class="card-label">${label}</div>
      <div class="card-value" style="color:${color}">${score}</div>
      ${miniBar(score, color, 130, 5)}
    </div>
  `;
}

export function buildScoreSection(report: ForensicReport): string {
  const scoreDimensions = [
    { label: "Technical", value: report.scores.technical_health },
    { label: "Performance", value: report.scores.performance },
    { label: "AI Visibility", value: report.scores.ai_visibility },
    { label: "Enterprise", value: report.scores.enterprise_readiness },
    { label: "UX Quality", value: report.scores.ux_quality },
    { label: "Trust", value: report.scores.trust },
    { label: "Content", value: report.scores.content_authority },
    { label: "Mobile", value: report.scores.mobile_experience },
    { label: "A11y", value: report.scores.accessibility },
  ];

  const radar = radarChart(scoreDimensions, 260);

  const scoreCards = [
    ["Technical Health", report.scores.technical_health],
    ["Performance", report.scores.performance],
    ["AI Visibility", report.scores.ai_visibility],
    ["Enterprise Readiness", report.scores.enterprise_readiness],
    ["UX Quality", report.scores.ux_quality],
    ["Trust & Security", report.scores.trust],
    ["Content Authority", report.scores.content_authority],
    ["Mobile Experience", report.scores.mobile_experience],
    ["Accessibility", report.scores.accessibility],
  ]
    .map(([label, score]) => scoreCard(label as string, score as number))
    .join("");

  // Benchmark rows
  const benchRows = report.benchmarking.baselines
    .slice(0, 6)
    .map((b) => {
      const verdictClass =
        b.verdict === "Above Benchmark"
          ? "bench-above"
          : b.verdict === "Below Benchmark"
          ? "bench-below"
          : "bench-comp";
      return `
        <tr>
          <td>${b.label}</td>
          <td style="text-align:center;font-weight:700;color:${scoreColor(b.score)}">${b.score}</td>
          <td style="text-align:center;color:#87867f">${b.benchmark}</td>
          <td style="text-align:center;font-weight:600" class="${verdictClass}">${b.gap >= 0 ? "+" : ""}${b.gap}</td>
          <td><span class="badge ${
            b.verdict === "Above Benchmark"
              ? "badge-pass"
              : b.verdict === "Below Benchmark"
              ? "badge-fail"
              : "badge-warn"
          }">${b.verdict}</span></td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="page-break section">
      <div class="section-label">Section 1</div>
      <div class="section-h2">Score Dashboard</div>

      <div style="display:flex;gap:24px;align-items:flex-start;margin-bottom:20px;" class="avoid-break">
        <div class="radar-panel" style="flex-shrink:0;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:12px;">Score Radar</div>
          ${radar}
        </div>
        <div style="flex:1">
          <div style="font-size:12px;color:#5e5d59;margin-bottom:12px;line-height:1.7;">
            The radar chart plots all nine score dimensions against the maximum (100). The overall score of
            <strong style="color:${scoreColor(report.scores.overall)}">${report.scores.overall}/100</strong> 
            reflects a weighted composite across technical, performance, content, and UX quality pillars.
          </div>
          <div style="background:#f5f3ee;border:1px solid #e8e6dc;border-radius:12px;padding:14px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:8px;">Industry Positioning</div>
            <p style="font-size:12px;color:#5e5d59;line-height:1.7;">${report.benchmarking.overall_positioning}</p>
          </div>
        </div>
      </div>

      <div class="grid-3">
        ${scoreCards}
      </div>

      ${benchRows ? `
        <div class="sub-h3 mt-md">Industry Benchmark Comparison</div>
        <table class="bench-table" style="border:1px solid #e8e6dc;border-radius:14px;overflow:hidden;">
          <thead>
            <tr>
              <th>Dimension</th>
              <th style="text-align:center">Score</th>
              <th style="text-align:center">Benchmark</th>
              <th style="text-align:center">Gap</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>${benchRows}</tbody>
        </table>
      ` : ""}
    </div>
  `;
}
