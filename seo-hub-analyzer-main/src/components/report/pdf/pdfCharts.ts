/**
 * pdfCharts.ts — Reusable inline SVG chart primitives for PDF export.
 * All charts are pure SVG strings — no canvas, no external libs.
 * They survive window.print() at full resolution.
 */

/** Map score → premium color */
export function scoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#87867f";
  if (score >= 50) return "#eab308";
  return "#c96442";
}

/** Map status → color */
export function statusColor(status: "pass" | "warn" | "fail"): string {
  if (status === "pass") return "#22c55e";
  if (status === "warn") return "#eab308";
  return "#c96442";
}

/**
 * Radar / spider chart for score dimensions.
 * Returns a self-contained <svg> string.
 */
export function radarChart(
  scores: { label: string; value: number }[],
  size = 240
): string {
  const cx = size / 2;
  const cy = size / 2;
  const R = (size / 2) * 0.78;
  const n = scores.length;
  const levels = 5;

  function polarToCartesian(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  // Build grid levels
  const gridLines: string[] = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    const r = (R * lvl) / levels;
    const pts = Array.from({ length: n }, (_, i) => {
      const p = polarToCartesian((360 / n) * i, r);
      return `${p.x},${p.y}`;
    }).join(" ");
    gridLines.push(
      `<polygon points="${pts}" fill="none" stroke="#e8e6dc" stroke-width="1"/>`
    );
  }

  // Axis lines
  const axes = Array.from({ length: n }, (_, i) => {
    const p = polarToCartesian((360 / n) * i, R);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#e8e6dc" stroke-width="1"/>`;
  }).join("");

  // Data polygon
  const dataPoints = scores.map((s, i) => {
    const r = (Math.min(s.value, 100) / 100) * R;
    const p = polarToCartesian((360 / n) * i, r);
    return `${p.x},${p.y}`;
  });
  const dataPolygon = `<polygon points="${dataPoints.join(" ")}" fill="rgba(20,20,19,0.08)" stroke="#141413" stroke-width="1.5"/>`;

  // Dots at each score vertex
  const dots = scores.map((s, i) => {
    const r = (Math.min(s.value, 100) / 100) * R;
    const p = polarToCartesian((360 / n) * i, r);
    return `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${scoreColor(s.value)}" stroke="white" stroke-width="1.5"/>`;
  }).join("");

  // Labels
  const labels = scores.map((s, i) => {
    const labelR = R + 22;
    const p = polarToCartesian((360 / n) * i, labelR);
    const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
    return `<text x="${p.x}" y="${p.y}" text-anchor="${anchor}" dominant-baseline="middle" font-size="9" font-family="system-ui,-apple-system,sans-serif" fill="#87867f" font-weight="500">${s.label}
      <tspan x="${p.x}" dy="10" font-weight="700" fill="${scoreColor(s.value)}">${s.value}</tspan>
    </text>`;
  }).join("");

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${gridLines.join("")}
    ${axes}
    ${dataPolygon}
    ${dots}
    ${labels}
  </svg>`;
}

/**
 * Half-circle gauge / donut arc for the overall score.
 */
export function gaugeArc(score: number, size = 160): string {
  const cx = size / 2;
  const cy = size / 2 + 10;
  const R = (size / 2) * 0.75;
  const color = scoreColor(score);

  // Arc from 180° to 360° (half circle, left to right)
  function arcPath(startDeg: number, endDeg: number, r: number) {
    const s = polarToXY(cx, cy, r, startDeg);
    const e = polarToXY(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  function polarToXY(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const startDeg = 180;
  const endDeg = 180 + (score / 100) * 180;
  const trackPath = arcPath(180, 360, R);
  const valuePath = arcPath(startDeg, endDeg, R);

  return `<svg width="${size}" height="${size / 2 + 30}" viewBox="0 0 ${size} ${size / 2 + 30}" xmlns="http://www.w3.org/2000/svg">
    <path d="${trackPath}" fill="none" stroke="#e8e6dc" stroke-width="10" stroke-linecap="round"/>
    <path d="${valuePath}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="28" font-weight="700" font-family="system-ui,-apple-system,sans-serif" fill="${color}">${score}</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" font-family="system-ui,-apple-system,sans-serif" fill="#87867f">/ 100</text>
  </svg>`;
}

/**
 * Horizontal mini bar — inline score indicator for score cards.
 */
export function miniBar(value: number, color: string, width = 100, height = 5): string {
  const fill = Math.max(0, Math.min(value, 100));
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${width}" height="${height}" rx="${height / 2}" fill="#ede7db"/>
    <rect x="0" y="0" width="${(fill / 100) * width}" height="${height}" rx="${height / 2}" fill="${color}"/>
  </svg>`;
}

/**
 * CWV grouped horizontal bar chart — compares metrics vs thresholds.
 */
export function cwvBarChart(
  metrics: { label: string; value: string; status: "pass" | "warn" | "fail" }[],
  width = 300,
  barHeight = 16,
  gap = 10
): string {
  const totalHeight = metrics.length * (barHeight + gap) + gap;
  const labelW = 40;
  const barW = width - labelW - 36;

  const bars = metrics.map((m, i) => {
    const y = i * (barHeight + gap) + gap;
    const pct = m.status === "pass" ? 75 : m.status === "warn" ? 55 : 90;
    const color = statusColor(m.status);
    return `
      <text x="${labelW - 6}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="10" font-family="system-ui" fill="#87867f" font-weight="600">${m.label}</text>
      <rect x="${labelW}" y="${y}" width="${barW}" height="${barHeight}" rx="4" fill="#f0eee6"/>
      <rect x="${labelW}" y="${y}" width="${pct / 100 * barW}" height="${barHeight}" rx="4" fill="${color}"/>
      <text x="${labelW + (pct / 100 * barW) + 6}" y="${y + barHeight / 2 + 4}" font-size="9" font-family="system-ui" fill="${color}" font-weight="700">${m.value}</text>
    `;
  }).join("");

  return `<svg width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    ${bars}
  </svg>`;
}

/**
 * Donut chart for issue distribution by severity.
 */
export function issueDonut(
  critical: number,
  high: number,
  medium: number,
  low: number,
  size = 100
): string {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38;
  const inner = R * 0.55;
  const total = critical + high + medium + low || 1;
  const colors = ["#c96442", "#e57a5a", "#eab308", "#87867f"];
  const values = [critical, high, medium, low];

  function arc(startAngle: number, endAngle: number, r: number, ri: number, color: string) {
    if (endAngle - startAngle < 0.01) return "";
    const s1 = polar(cx, cy, r, startAngle);
    const e1 = polar(cx, cy, r, endAngle);
    const s2 = polar(cx, cy, ri, endAngle);
    const e2 = polar(cx, cy, ri, startAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `<path d="M ${s1.x} ${s1.y} A ${r} ${r} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${ri} ${ri} 0 ${large} 0 ${e2.x} ${e2.y} Z" fill="${color}"/>`;
  }

  function polar(cx: number, cy: number, r: number, a: number) {
    return { x: cx + r * Math.cos(a - Math.PI / 2), y: cy + r * Math.sin(a - Math.PI / 2) };
  }

  let currentAngle = 0;
  const arcs = values.map((v, i) => {
    const sweep = (v / total) * 2 * Math.PI;
    const path = arc(currentAngle, currentAngle + sweep, R, inner, colors[i]);
    currentAngle += sweep;
    return path;
  }).join("");

  const totalIssues = critical + high + medium + low;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    ${arcs}
    <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="14" font-weight="700" font-family="system-ui" fill="#141413">${totalIssues}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="8" font-family="system-ui" fill="#87867f">issues</text>
  </svg>`;
}
