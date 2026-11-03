/**
 * pdfPerformance.ts — Core Web Vitals + Engineering section builder.
 */

import type { ForensicReport, PerformanceData } from "@/lib/forensicTypes";
import { cwvBarChart, statusColor } from "./pdfCharts";

function statusBadge(status: "pass" | "warn" | "fail"): string {
  const label = status === "pass" ? "✓ Pass" : status === "warn" ? "⚠ Warn" : "✗ Fail";
  return `<span class="badge badge-${status}">${label}</span>`;
}

function statusIcon(status: "pass" | "warn" | "fail"): string {
  if (status === "pass") return `<span style="color:#22c55e;font-weight:700">✓</span>`;
  if (status === "warn") return `<span style="color:#eab308;font-weight:700">⚠</span>`;
  return `<span style="color:#c96442;font-weight:700">✗</span>`;
}

function cwvPanel(data: PerformanceData, title: string): string {
  const metrics = [
    { label: "LCP", value: data.lcp, status: data.lcp_status },
    { label: "CLS", value: data.cls, status: data.cls_status },
    { label: "INP", value: data.inp, status: data.inp_status },
    { label: "FCP", value: data.fcp, status: data.fcp_status },
    { label: "TBT", value: data.tbt, status: data.tbt_status },
  ];

  const rows = metrics
    .map(
      (m) => `
        <div class="cwv-metric-row">
          <span style="font-weight:600;font-size:12px;">${m.label}</span>
          <span style="display:flex;align-items:center;gap:8px;font-size:12px;">
            ${m.value}
            ${statusBadge(m.status)}
          </span>
        </div>
      `
    )
    .join("");

  const chart = cwvBarChart(
    metrics.map((m) => ({ label: m.label, value: m.value, status: m.status })),
    240
  );

  return `
    <div class="cwv-panel">
      <div class="cwv-panel-header" style="display:flex;justify-content:space-between;align-items:center;">
        <span>${title}</span>
        <span style="font-size:16px;font-weight:700;color:${
          data.score >= 85 ? "#22c55e" : data.score >= 70 ? "#87867f" : data.score >= 50 ? "#eab308" : "#c96442"
        }">${data.score}<span style="font-size:10px;font-weight:500;color:#87867f">/100</span></span>
      </div>
      <div style="padding:12px 14px 4px;">
        <div class="chart-center mb-sm">${chart}</div>
      </div>
      ${rows}
    </div>
  `;
}

function boolVal(v: boolean): string {
  return v
    ? `<span style="color:#166534;font-weight:600">✓ Yes</span>`
    : `<span style="color:#c96442;font-weight:600">✗ No</span>`;
}

function qualityBadge(
  val: "Strong" | "Mixed" | "Weak" | "Enabled" | "Partial" | "Missing" | "Optimized" | "Watch" | "Poor" | "Smooth" | "Moderate" | "Heavy" | "Present" | "Limited" | "Unknown" | "Unclear"
): string {
  const good = ["Strong", "Enabled", "Optimized", "Smooth", "Present"];
  const bad = ["Weak", "Missing", "Poor", "Heavy", "Limited"];
  const cls = good.includes(val)
    ? "badge-pass"
    : bad.includes(val)
    ? "badge-fail"
    : "badge-warn";
  return `<span class="badge ${cls}">${val}</span>`;
}

export function buildPerformanceSection(report: ForensicReport): string {
  const eng = report.performance.engineering;
  const req = report.performance.request_profile;

  const largestRequestRows = req.largest_requests
    .slice(0, 4)
    .map(
      (r) => `
        <tr>
          <td style="font-family:monospace;font-size:10px;color:#5e5d59;max-width:200px;word-break:break-all;">${r.url.length > 40 ? "…" + r.url.slice(-38) : r.url}</td>
          <td>${r.type}</td>
          <td>${r.size}</td>
          <td>${r.duration}</td>
          <td style="color:#87867f;font-size:11px;">${r.note}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div class="page-break section">
      <div class="section-label">Section 2</div>
      <div class="section-h2">Core Web Vitals & Performance</div>

      <div class="cwv-side-by-side avoid-break">
        ${cwvPanel(report.performance.mobile, "📱 Mobile")}
        ${cwvPanel(report.performance.desktop, "🖥 Desktop")}
      </div>

      <div class="sub-h3">Request Profile</div>
      <div class="grid-4 avoid-break">
        <div class="card">
          <div class="card-label">Total Requests</div>
          <div class="card-value" style="font-size:22px;">${req.total_requests}</div>
        </div>
        <div class="card">
          <div class="card-label">Transfer Size</div>
          <div class="card-value" style="font-size:22px;">${req.total_transfer_size}</div>
        </div>
        <div class="card">
          <div class="card-label">Render-Blocking</div>
          <div class="card-value" style="font-size:22px;color:${req.render_blocking_resources > 3 ? "#c96442" : req.render_blocking_resources > 0 ? "#eab308" : "#22c55e"};">${req.render_blocking_resources}</div>
        </div>
        <div class="card">
          <div class="card-label">3rd-Party Reqs</div>
          <div class="card-value" style="font-size:22px;color:${req.third_party_requests > 15 ? "#eab308" : "#141413"};">${req.third_party_requests}</div>
        </div>
      </div>

      ${largestRequestRows ? `
        <div class="sub-h3">Largest Requests</div>
        <table class="bench-table avoid-break" style="border:1px solid #e8e6dc;border-radius:14px;overflow:hidden;">
          <thead>
            <tr>
              <th>URL</th><th>Type</th><th>Size</th><th>Duration</th><th>Note</th>
            </tr>
          </thead>
          <tbody>${largestRequestRows}</tbody>
        </table>
      ` : ""}

      <div class="sub-h3">Frontend Engineering</div>
      <div class="grid-2 avoid-break">
        <div class="metric-table">
          <div class="metric-table-header">Bundle & Execution</div>
          <div class="metric-row"><span class="metric-key">JS Execution Cost</span><span class="metric-val">${eng.js_execution_cost}</span></div>
          <div class="metric-row"><span class="metric-key">Hydration Cost</span><span class="metric-val">${eng.hydration_cost}</span></div>
          <div class="metric-row"><span class="metric-key">Bundle Size Est.</span><span class="metric-val">${eng.bundle_size_estimate}</span></div>
          <div class="metric-row"><span class="metric-key">Unused JS</span><span class="metric-val">${eng.unused_js}</span></div>
          <div class="metric-row"><span class="metric-key">Unused CSS</span><span class="metric-val">${eng.unused_css}</span></div>
        </div>
        <div class="metric-table">
          <div class="metric-table-header">Infrastructure & Delivery</div>
          <div class="metric-row"><span class="metric-key">HTTP/2</span><span class="metric-val">${boolVal(eng.http2_support)}</span></div>
          <div class="metric-row"><span class="metric-key">HTTP/3</span><span class="metric-val">${boolVal(eng.http3_support)}</span></div>
          <div class="metric-row"><span class="metric-key">Compression</span><span class="metric-val">${qualityBadge(eng.server_compression)}</span></div>
          <div class="metric-row"><span class="metric-key">Cache Strategy</span><span class="metric-val">${qualityBadge(eng.cache_strategy)}</span></div>
          <div class="metric-row"><span class="metric-key">CDN Optimization</span><span class="metric-val">${qualityBadge(eng.cdn_optimization)}</span></div>
        </div>
      </div>

      <div class="grid-2 avoid-break mt-md">
        <div class="metric-table">
          <div class="metric-table-header">Asset Optimization</div>
          <div class="metric-row"><span class="metric-key">Image Optimization</span><span class="metric-val">${qualityBadge(eng.image_optimization)}</span></div>
          <div class="metric-row"><span class="metric-key">Modern Image Formats</span><span class="metric-val">${qualityBadge(eng.modern_image_support)}</span></div>
          <div class="metric-row"><span class="metric-key">Font Loading</span><span class="metric-val">${qualityBadge(eng.font_loading_strategy)}</span></div>
          <div class="metric-row"><span class="metric-key">Critical Path</span><span class="metric-val" style="font-size:11px;">${eng.critical_rendering_path}</span></div>
        </div>
        <div class="metric-table">
          <div class="metric-table-header">Rendering Quality</div>
          <div class="metric-row"><span class="metric-key">Animation Perf.</span><span class="metric-val">${qualityBadge(eng.animation_performance)}</span></div>
          <div class="metric-row"><span class="metric-key">Scroll Performance</span><span class="metric-val">${qualityBadge(eng.scroll_performance)}</span></div>
          <div class="metric-row"><span class="metric-key">GPU Acceleration</span><span class="metric-val">${qualityBadge(eng.gpu_acceleration)}</span></div>
        </div>
      </div>

      ${eng.observations && eng.observations.length > 0 ? `
        <div style="background:#f5f3ee;border:1px solid #e8e6dc;border-radius:12px;padding:14px 16px;margin-top:16px;" class="avoid-break">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:8px;">Engineering Observations</div>
          <ul style="list-style:none;padding:0;">
            ${eng.observations.map(o => `<li style="font-size:12px;color:#5e5d59;margin-bottom:4px;padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:#c96442">›</span>${o}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  `;
}
