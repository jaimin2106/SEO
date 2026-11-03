/**
 * pdfStyles.ts — Complete print CSS design system for the PDF export.
 * Claude-inspired: soft neutrals, editorial typography, premium spacing.
 */

export function getPdfStyles(isFreeTier: boolean, isScaleTier: boolean): string {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
    }

    html, body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #faf9f5;
      color: #141413;
      font-size: 13px;
      line-height: 1.7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Layout ─────────────────────────────── */
    .pdf-root { max-width: 780px; margin: 0 auto; }

    /* ── Section breaks ─────────────────────── */
    .page-break { page-break-before: always; break-before: page; }
    .avoid-break { page-break-inside: avoid; break-inside: avoid; }

    /* ── Watermark ──────────────────────────── */
    ${isFreeTier ? `
    body::after {
      content: "PREVIEW — UPGRADE TO PRO";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-42deg);
      font-size: 62px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: rgba(201, 100, 66, 0.04);
      pointer-events: none;
      white-space: nowrap;
      z-index: 0;
    }` : ""}

    /* ── Header bar ─────────────────────────── */
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e8e6dc;
    }
    .pdf-header-brand { font-size: 14px; font-weight: 700; color: #141413; }
    .pdf-header-meta { font-size: 11px; color: #87867f; text-align: right; }

    /* ── Cover ──────────────────────────────── */
    .cover-block {
      padding-bottom: 36px;
      margin-bottom: 36px;
      border-bottom: 2px solid #ebe6db;
    }
    .cover-eyebrow {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: #87867f;
      margin-bottom: 8px;
    }
    .cover-h1 {
      font-size: 34px;
      font-weight: 600;
      line-height: 1.1;
      color: #141413;
      margin-bottom: 10px;
    }
    .cover-site {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .cover-favicon {
      width: 32px; height: 32px;
      border-radius: 8px;
      border: 1px solid #e8e6dc;
      background: white;
      padding: 3px;
    }
    .cover-hostname { font-size: 18px; font-weight: 500; color: #141413; }
    .cover-url { font-size: 11px; color: #87867f; margin-top: 2px; }

    .score-hero {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      margin-top: 8px;
    }
    .score-hero-right { padding-left: 20px; border-left: 2px solid #ebe6db; }

    .exec-summary {
      background: #f5f3ee;
      border: 1px solid #e8e6dc;
      border-radius: 14px;
      padding: 18px 20px;
      margin-top: 24px;
    }
    .exec-summary-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #87867f;
      margin-bottom: 8px;
    }
    .exec-summary p { color: #5e5d59; font-size: 13px; line-height: 1.75; }

    /* ── TOC ────────────────────────────────── */
    .toc { padding: 20px 0; }
    .toc-title { font-size: 16px; font-weight: 600; color: #141413; margin-bottom: 16px; }
    .toc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0eee6;
      font-size: 13px;
    }
    .toc-row:last-child { border-bottom: none; }
    .toc-num { font-size: 11px; color: #c4c2bc; font-weight: 600; width: 24px; }
    .toc-label { color: #141413; font-weight: 500; flex: 1; padding: 0 8px; }
    .toc-dot { flex: 1; border-bottom: 1px dotted #d1cfc5; margin: 0 8px; }

    /* ── Section headers ────────────────────── */
    .section { margin-bottom: 32px; }
    .section-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: #87867f;
      margin-bottom: 6px;
    }
    .section-h2 {
      font-size: 20px;
      font-weight: 600;
      color: #141413;
      margin-bottom: 18px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e6dc;
    }
    .sub-h3 { font-size: 14px; font-weight: 600; color: #141413; margin: 18px 0 10px; }

    /* ── Card system ────────────────────────── */
    .card {
      background: #ffffff;
      border: 1px solid #e8e6dc;
      border-radius: 14px;
      padding: 14px 16px;
    }
    .card-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #87867f;
      margin-bottom: 4px;
    }
    .card-value { font-size: 26px; font-weight: 700; margin-top: 2px; }
    .card-sub { font-size: 11px; color: #87867f; margin-top: 3px; }

    /* ── Grid layouts ───────────────────────── */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; }

    /* ── Metric rows ────────────────────────── */
    .metric-table { background: white; border: 1px solid #e8e6dc; border-radius: 14px; overflow: hidden; }
    .metric-table-header {
      background: #f5f3ee;
      padding: 10px 14px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #87867f;
      font-weight: 600;
      border-bottom: 1px solid #e8e6dc;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 14px;
      border-bottom: 1px solid #f0eee6;
      font-size: 12px;
    }
    .metric-row:last-child { border-bottom: none; }
    .metric-row:nth-child(even) { background: #faf9f5; }
    .metric-key { font-weight: 600; color: #141413; }
    .metric-val { color: #5e5d59; }

    /* ── Badge system ───────────────────────── */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }
    .badge-pass, .badge-excellent { background: #f0fdf4; color: #166534; }
    .badge-warn, .badge-needs { background: #fefce8; color: #a16207; }
    .badge-fail, .badge-critical-status { background: #fff5f2; color: #c96442; }
    .badge-critical { background: #fff0ee; color: #b91c1c; border: 1px solid #f3c9c9; }
    .badge-high { background: #fff5f2; color: #c96442; border: 1px solid #f3d2c6; }
    .badge-medium { background: #fefce8; color: #a16207; border: 1px solid #f1e6af; }
    .badge-low { background: #f0eee6; color: #5e5d59; border: 1px solid #e2ddd0; }
    .badge-info { background: #eff6ff; color: #1d4ed8; }
    .badge-commercial { background: #fefce8; color: #a16207; }
    .badge-transactional { background: #f0fdf4; color: #166534; }
    .badge-navigational { background: #f3e8ff; color: #6b21a8; }

    /* ── Issue cards ────────────────────────── */
    .issue-card {
      border: 1px solid #e8e6dc;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 10px;
      background: #ffffff;
    }
    .issue-card.issue-critical { border-left: 3px solid #c96442; }
    .issue-card.issue-high { border-left: 3px solid #e57a5a; }
    .issue-card.issue-medium { border-left: 3px solid #eab308; }
    .issue-card.issue-low { border-left: 3px solid #87867f; }

    .issue-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .issue-title { font-size: 15px; font-weight: 600; color: #141413; margin: 6px 0 4px; }
    .issue-summary { font-size: 12px; color: #5e5d59; line-height: 1.7; margin-bottom: 10px; }
    .issue-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
    .issue-detail-box {
      background: #faf9f5;
      border: 1px solid #ebe6db;
      border-radius: 10px;
      padding: 10px 12px;
    }
    .issue-detail-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #87867f; margin-bottom: 4px; }
    .issue-detail-text { font-size: 12px; color: #5e5d59; line-height: 1.65; }
    .issue-fix-bar {
      margin-top: 10px;
      padding: 10px 12px;
      background: #f5f3ee;
      border-radius: 10px;
      font-size: 12px;
      color: #141413;
      border-left: 2px solid #141413;
    }
    .issue-fix-bar strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #87867f; margin-bottom: 4px; }
    .issue-meta-row { display: flex; gap: 16px; margin-top: 8px; font-size: 11px; color: #87867f; }

    .evidence-list { margin: 6px 0 0 0; padding: 0; list-style: none; }
    .evidence-list li { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #5e5d59; margin-bottom: 3px; line-height: 1.6; }
    .evidence-dot { width: 5px; height: 5px; border-radius: 50%; background: #c96442; margin-top: 7px; flex-shrink: 0; }

    /* ── Benchmarking table ─────────────────── */
    .bench-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .bench-table th {
      text-align: left;
      padding: 8px 12px;
      background: #f5f3ee;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #87867f;
      font-weight: 600;
      border-bottom: 1px solid #e8e6dc;
    }
    .bench-table td { padding: 9px 12px; border-bottom: 1px solid #f0eee6; color: #5e5d59; }
    .bench-table tr:last-child td { border-bottom: none; }
    .bench-table tr:nth-child(even) td { background: #faf9f5; }
    .bench-above { color: #166534; font-weight: 600; }
    .bench-below { color: #c96442; font-weight: 600; }
    .bench-comp { color: #87867f; font-weight: 500; }

    /* ── Keyword table ──────────────────────── */
    .kw-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .kw-table th {
      text-align: left;
      padding: 8px 12px;
      background: #f5f3ee;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #87867f;
      font-weight: 600;
      border-bottom: 1px solid #e8e6dc;
    }
    .kw-table td { padding: 9px 12px; border-bottom: 1px solid #f0eee6; }
    .kw-table tr:last-child td { border-bottom: none; }
    .kw-table tr:nth-child(even) td { background: #faf9f5; }

    /* ── Quick wins / action plan ───────────── */
    .quick-win-card {
      background: #ffffff;
      border: 1px solid #e8e6dc;
      border-radius: 12px;
      padding: 14px 16px;
    }
    .qw-pillar { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #87867f; margin-bottom: 4px; }
    .qw-title { font-size: 13px; font-weight: 600; color: #141413; margin-bottom: 4px; }
    .qw-gain { font-size: 12px; color: #22c55e; font-weight: 500; }

    /* ── CWV panel ──────────────────────────── */
    .cwv-side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .cwv-panel { background: white; border: 1px solid #e8e6dc; border-radius: 14px; overflow: hidden; }
    .cwv-panel-header {
      background: #f5f3ee;
      padding: 10px 14px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #87867f;
      font-weight: 600;
      border-bottom: 1px solid #e8e6dc;
    }
    .cwv-score-large { font-size: 22px; font-weight: 700; margin-top: 2px; }
    .cwv-metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 14px;
      border-bottom: 1px solid #f0eee6;
      font-size: 12px;
    }
    .cwv-metric-row:last-child { border-bottom: none; }
    .cwv-metric-row:nth-child(even) { background: #faf9f5; }

    /* ── Strengths / weaknesses ─────────────── */
    .sw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    .sw-box { background: white; border: 1px solid #e8e6dc; border-radius: 12px; padding: 14px; }
    .sw-box.strengths-box { border-top: 3px solid #22c55e; }
    .sw-box.weaknesses-box { border-top: 3px solid #c96442; }
    .sw-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 10px; }
    .sw-title.green { color: #166534; }
    .sw-title.red { color: #c96442; }
    .sw-item { display: flex; align-items: flex-start; gap: 7px; margin-bottom: 6px; font-size: 12px; color: #5e5d59; line-height: 1.6; }
    .sw-icon { font-size: 10px; margin-top: 3px; flex-shrink: 0; }

    /* ── Footer ─────────────────────────────── */
    .pdf-footer {
      border-top: 1px solid #ebe6db;
      padding-top: 16px;
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #87867f;
    }
    .pdf-footer strong { color: #141413; }

    /* ── Severity section dividers ──────────── */
    .severity-group { margin-bottom: 28px; }
    .severity-group-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0eee6;
    }
    .severity-group-title { font-size: 14px; font-weight: 700; }
    .severity-count { font-size: 11px; color: #87867f; }

    /* ── Divider ────────────────────────────── */
    .divider { border: none; border-top: 1px solid #e8e6dc; margin: 24px 0; }

    /* ── Spacers ────────────────────────────── */
    .mt-sm { margin-top: 8px; }
    .mt-md { margin-top: 16px; }
    .mt-lg { margin-top: 24px; }
    .mb-sm { margin-bottom: 8px; }
    .mb-md { margin-bottom: 16px; }

    /* ── Chart containers ───────────────────── */
    .chart-center { display: flex; justify-content: center; align-items: center; }
    .radar-panel {
      background: white;
      border: 1px solid #e8e6dc;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `;
}
