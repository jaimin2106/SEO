/**
 * pdfExport.ts — Main PDF orchestrator.
 *
 * Assembles all section builders into a single self-contained HTML document
 * and opens it in a new window for browser Print → Save as PDF.
 *
 * Architecture:
 *   pdf/pdfStyles.ts     → CSS design system
 *   pdf/pdfCharts.ts     → Inline SVG chart primitives
 *   pdf/pdfCover.ts      → Cover page + TOC
 *   pdf/pdfScores.ts     → Score dashboard + radar chart
 *   pdf/pdfPerformance.ts→ Core Web Vitals + Engineering
 *   pdf/pdfTechnical.ts  → Technical SEO + Content + UX + Security
 *   pdf/pdfIssues.ts     → Issue breakdown (grouped by severity)
 *   pdf/pdfActionPlan.ts → Quick wins + High-impact + Keywords + AI insights
 */

import type { ForensicReport } from "@/lib/forensicTypes";
import type { SubscriptionTier } from "@/contexts/AuthContext";
import { getPdfStyles } from "./pdf/pdfStyles";
import { buildHeader, buildCover, buildTableOfContents } from "./pdf/pdfCover";
import { buildScoreSection } from "./pdf/pdfScores";
import { buildPerformanceSection } from "./pdf/pdfPerformance";
import { buildTechnicalSection, buildContentSection, buildUxSection } from "./pdf/pdfTechnical";
import { buildIssuesSection } from "./pdf/pdfIssues";
import { buildActionPlanSection } from "./pdf/pdfActionPlan";

function buildFooter(report: ForensicReport, tier: SubscriptionTier): string {
  const hostname = (() => {
    try { return new URL(report.url).hostname; } catch { return report.url; }
  })();
  const brandName = tier === "scale" ? "SEO Intelligence Report" : "SEO Hub Analyzer";
  const dateStr = new Date(report.report_date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return `
    <div class="pdf-footer">
      <span><strong>${brandName}</strong></span>
      <span>${hostname}</span>
      <span>Generated ${dateStr}</span>
    </div>
  `;
}

function assemblePdfHtml(report: ForensicReport, tier: SubscriptionTier): string {
  const isFreeTier = tier === "free";
  const isScaleTier = tier === "scale";

  const styles = getPdfStyles(isFreeTier, isScaleTier);

  const sections = [
    buildHeader(report, tier),
    buildCover(report, tier),
    buildTableOfContents(tier),
    buildScoreSection(report),
    buildPerformanceSection(report),
    buildTechnicalSection(report),
    buildContentSection(report),
    buildUxSection(report),
    buildIssuesSection(report, tier),
    buildActionPlanSection(report, tier),
    buildFooter(report, tier),
  ].join("\n");

  const hostname = (() => {
    try { return new URL(report.url).hostname; } catch { return report.url; }
  })();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SEO Intelligence Report — ${hostname}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="pdf-root">
    ${sections}
  </div>
</body>
</html>`;
}

/**
 * Opens a premium PDF in a new window and triggers the browser Print dialog.
 * Users then choose "Save as PDF" in their print dialog.
 */
export function triggerPdfExport(
  report: ForensicReport,
  tier: SubscriptionTier = "free"
): void {
  const html = assemblePdfHtml(report, tier);

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    // Pop-up blocked — surface a friendly message
    const msg =
      "Pop-ups are blocked. Please allow pop-ups for this site and try again.\n\n" +
      "In Chrome: Click the blocked pop-up icon in the address bar → Always allow → Retry.";
    alert(msg);
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for images (favicon) to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };
}
