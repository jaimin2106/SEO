/**
 * pdfTechnical.ts — Technical SEO, Content Intelligence, AI Visibility,
 *                   UX Psychology, Frontend Quality, and Security sections.
 */

import type { ForensicReport } from "@/lib/forensicTypes";

function metricRow(key: string, val: string | number | boolean): string {
  const display =
    typeof val === "boolean"
      ? val
        ? `<span style="color:#166534;font-weight:600">✓ Yes</span>`
        : `<span style="color:#c96442;font-weight:600">✗ No</span>`
      : String(val);
  return `<div class="metric-row"><span class="metric-key">${key}</span><span class="metric-val">${display}</span></div>`;
}

function statusChip(
  val: "Strong" | "Moderate" | "Weak" | "High" | "Medium" | "Low" | "Expert-Level" | "Comprehensive" | "Lean" | "Heavy" | "Very Heavy" | "Clean" | "Poor" | "Present" | "Missing" | "Invalid" | "Efficient" | "Watch" | "Inefficient" | "Modern" | "Mixed" | "Legacy" | "Enabled" | "Partial" | "Fresh" | "Stale" | "Unknown" | "Optimized" | "Verified" | "Unverified" | "Secure" | "Clear" | "Premium" | "Standard" | string
): string {
  const good = ["Strong", "High", "Expert-Level", "Lean", "Clean", "Present", "Efficient", "Modern", "Enabled", "Fresh", "Optimized", "Verified", "Secure", "Clear", "Premium", "Comprehensive", "Smooth", "Low"];
  const bad = ["Weak", "Low" /* in trust */, "Heavy", "Very Heavy", "Poor", "Missing", "Invalid", "Inefficient", "Legacy", "Partial", "Stale", "Unverified", "High" /* in risk */];
  // Be conservative — use warn for anything not explicitly good
  const cls = good.includes(val) ? "badge-pass" : bad.includes(val) ? "badge-fail" : "badge-warn";
  return `<span class="badge ${cls}">${val}</span>`;
}

export function buildTechnicalSection(report: ForensicReport): string {
  const tech = report.technical;
  const schemaTypes = tech.structured_data_types.join(", ") || "None detected";

  return `
    <div class="page-break section">
      <div class="section-label">Section 3</div>
      <div class="section-h2">Technical SEO Analysis</div>

      <div class="grid-2 avoid-break">
        <div class="metric-table">
          <div class="metric-table-header">Crawl & Indexation</div>
          ${metricRow("XML Sitemap", tech.xml_sitemap_status)}
          ${metricRow("Robots.txt", tech.robots_txt_status)}
          ${metricRow("Crawl Budget", tech.crawl_budget_estimate)}
          ${metricRow("Crawl Depth Sampled", tech.crawl_depth)}
          ${metricRow("Pages Sampled", tech.internal_pages_sampled)}
          ${metricRow("Orphan Page Candidates", tech.orphan_page_candidates)}
          ${metricRow("Broken Internal Links", tech.broken_internal_links)}
          ${metricRow("Broken External Links", tech.broken_external_links)}
        </div>
        <div class="metric-table">
          <div class="metric-table-header">Architecture Quality</div>
          ${metricRow("DOM Complexity", tech.dom_complexity)}
          ${metricRow("URL Structure", tech.url_structure_quality)}
          ${metricRow("JS Rendering Risk", tech.javascript_rendering_risk)}
          ${metricRow("Hydration Risk", tech.hydration_risk)}
          ${metricRow("Canonical Conflicts", tech.canonical_conflicts)}
          ${metricRow("Duplicate Metadata", tech.duplicate_metadata_clusters)}
          ${metricRow("Duplicate Content", tech.duplicate_content_clusters)}
          ${metricRow("Parameter Pollution", tech.parameter_pollution_risk)}
        </div>
      </div>

      <div class="grid-2 avoid-break mt-md">
        <div class="metric-table">
          <div class="metric-table-header">Metadata & Social</div>
          ${metricRow("Title", `${report.on_page.title.status} (${report.on_page.title.text.slice(0, 48)}${report.on_page.title.text.length > 48 ? "…" : ""})`)}
          ${metricRow("Meta Description", `${report.on_page.meta_desc.status} (${report.on_page.meta_desc.length} chars)`)}
          ${metricRow("Open Graph Tags", tech.og_tags)}
          ${metricRow("Twitter Cards", tech.twitter_card)}
          ${metricRow("Hreflang Issues", tech.hreflang_issues)}
          ${metricRow("Robots Meta Issues", tech.robots_meta_issues)}
        </div>
        <div class="metric-table">
          <div class="metric-table-header">Schema & Structured Data</div>
          ${metricRow("Schema Types", schemaTypes)}
          ${metricRow("Breadcrumb Schema", tech.breadcrumb_schema_valid)}
          ${metricRow("Redirect Chain Risk", tech.redirect_chain_risk)}
          ${metricRow("Redirect Loop Risk", tech.redirect_loop_risk)}
          ${metricRow("Thin Content Pages", tech.thin_content_pages)}
          ${metricRow("Soft 404 Candidates", tech.soft_404_candidates)}
          ${metricRow("Lazy Loading Issues", tech.lazy_loading_issues)}
          ${metricRow("Render-Blocking", tech.render_blocking_resources)}
        </div>
      </div>

      ${tech.observations && tech.observations.length > 0 ? `
        <div style="background:#f5f3ee;border:1px solid #e8e6dc;border-radius:12px;padding:14px 16px;margin-top:14px;" class="avoid-break">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:8px;">Technical Observations</div>
          <ul style="list-style:none;padding:0;">
            ${tech.observations.slice(0, 5).map(o => `<li style="font-size:12px;color:#5e5d59;margin-bottom:4px;padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:#141413">›</span>${o}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  `;
}

export function buildContentSection(report: ForensicReport): string {
  const content = report.content;
  const ai = report.ai_visibility;

  const eeaT = content.eeat_signals;

  return `
    <div class="section">
      <div class="section-label">Section 4</div>
      <div class="section-h2">Content & AI Visibility</div>

      <div class="grid-2 avoid-break">
        <div class="metric-table">
          <div class="metric-table-header">Content Intelligence</div>
          ${metricRow("Word Count", content.word_count.toLocaleString())}
          ${metricRow("Reading Time", content.reading_time)}
          ${metricRow("Readability Score", `${content.readability_score} (${content.readability_label})`)}
          ${metricRow("Topical Authority", content.topical_authority)}
          ${metricRow("Semantic Relevance", content.semantic_relevance)}
          ${metricRow("Content Depth", content.content_depth_quality)}
          ${metricRow("Search Intent Alignment", content.search_intent_alignment)}
          ${metricRow("AI Content Footprint", content.ai_content_footprint)}
          ${metricRow("Freshness", content.freshness)}
        </div>
        <div class="metric-table">
          <div class="metric-table-header">AI Visibility & LLM Readiness</div>
          ${metricRow("AI Readability", ai.ai_readability)}
          ${metricRow("LLM Visibility", ai.llm_visibility_optimization)}
          ${metricRow("Structured Answer Ready", ai.structured_answer_readiness)}
          ${metricRow("Citation Potential", ai.citation_potential)}
          ${metricRow("Snippet Optimization", ai.snippet_optimization)}
          ${metricRow("Answer Engine Opt.", ai.answer_engine_optimization)}
          ${metricRow("Conversational Query Opt.", ai.conversational_query_optimization)}
          ${metricRow("Semantic Chunk Quality", ai.semantic_chunk_quality)}
        </div>
      </div>

      <div class="grid-2 avoid-break mt-md">
        <div class="metric-table">
          <div class="metric-table-header">E-E-A-T Signals</div>
          ${metricRow("Expertise", eeaT.expertise)}
          ${metricRow("Authoritativeness", eeaT.authoritativeness)}
          ${metricRow("Trustworthiness", eeaT.trustworthiness)}
          ${metricRow("Keyword Cannibalization Risk", content.keyword_cannibalization_risk)}
          ${metricRow("Audience Targeting", content.audience_targeting_quality)}
          ${metricRow("Entity Coverage", content.entity_coverage)}
        </div>
        <div class="metric-table">
          <div class="metric-table-header">Keyword & Entity Intelligence</div>
          ${content.primary_entities.length > 0 ? metricRow("Primary Entities", content.primary_entities.slice(0, 5).join(", ")) : ""}
          ${content.nlp_keyword_relationships.length > 0 ? metricRow("NLP Relationships", content.nlp_keyword_relationships.slice(0, 3).join(", ")) : ""}
          ${content.expertise_indicators.length > 0 ? metricRow("Expertise Indicators", content.expertise_indicators.slice(0, 2).join("; ")) : ""}
          ${content.trust_indicators.length > 0 ? metricRow("Trust Indicators", content.trust_indicators.slice(0, 2).join("; ")) : ""}
        </div>
      </div>

      ${ai.recommendations && ai.recommendations.length > 0 ? `
        <div style="background:#f5f3ee;border:1px solid #e8e6dc;border-radius:12px;padding:14px 16px;margin-top:14px;" class="avoid-break">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:8px;">AI Visibility Recommendations</div>
          <ul style="list-style:none;padding:0;">
            ${ai.recommendations.slice(0, 4).map(r => `<li style="font-size:12px;color:#5e5d59;margin-bottom:5px;padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:#141413">›</span>${r}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  `;
}

export function buildUxSection(report: ForensicReport): string {
  const ux = report.ux;
  const fe = report.frontend;

  return `
    <div class="section avoid-break">
      <div class="section-label">Section 5</div>
      <div class="section-h2">UX & Frontend Quality</div>

      <div class="grid-2 avoid-break">
        <div class="metric-table">
          <div class="metric-table-header">UX Psychology</div>
          ${metricRow("Trust Perception", ux.trust_perception)}
          ${metricRow("Premium Feel", ux.premium_feel)}
          ${metricRow("Emotional Engagement", ux.emotional_engagement)}
          ${metricRow("Conversion Psychology", ux.conversion_psychology)}
          ${metricRow("CTA Effectiveness", ux.cta_effectiveness)}
          ${metricRow("Cognitive Overload", ux.cognitive_overload)}
          ${metricRow("Attention Hierarchy", ux.attention_hierarchy)}
          ${metricRow("User Retention Potential", ux.user_retention_potential)}
          ${metricRow("First Impression", ux.first_impression)}
          ${metricRow("Clarity of Messaging", ux.clarity_of_messaging)}
        </div>
        <div class="metric-table">
          <div class="metric-table-header">Frontend Quality</div>
          ${metricRow("UI Smoothness", fe.ui_smoothness)}
          ${metricRow("Interaction Quality", fe.interaction_quality)}
          ${metricRow("Responsiveness", fe.responsiveness_quality)}
          ${metricRow("Mobile Optimization", fe.mobile_optimization)}
          ${metricRow("Layout Stability", fe.layout_stability)}
          ${metricRow("Visual Hierarchy", fe.visual_hierarchy)}
          ${metricRow("Accessibility Quality", fe.accessibility_quality)}
          ${metricRow("Semantic HTML", fe.semantic_html_quality)}
          ${metricRow("Component Architecture", fe.component_architecture_signals)}
          ${metricRow("Modern Frontend", fe.modern_frontend_standards)}
        </div>
      </div>

      <div class="grid-2 avoid-break mt-md">
        <div class="metric-table">
          <div class="metric-table-header">Security & Trust</div>
          ${metricRow("HTTPS Quality", report.security.https_quality)}
          ${metricRow("HSTS", report.security.hsts)}
          ${metricRow("CSP", report.security.csp)}
          ${metricRow("SPF", report.security.spf_status)}
          ${metricRow("DKIM", report.security.dkim_status)}
          ${metricRow("DMARC", report.security.dmarc_status)}
          ${metricRow("Cookie Security", report.security.cookie_security)}
          ${metricRow("Mixed Content", report.security.mixed_content)}
          ${metricRow("Unsafe External Links", report.security.unsafe_external_links)}
          ${metricRow("Trust Badge Quality", report.security.trust_badge_quality)}
        </div>
        ${ux.friction_points && ux.friction_points.length > 0 ? `
          <div style="background:#f5f3ee;border:1px solid #e8e6dc;border-radius:14px;padding:14px 16px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:10px;">UX Friction Points</div>
            <ul style="list-style:none;padding:0;">
              ${ux.friction_points.map(f => `<li style="font-size:12px;color:#5e5d59;margin-bottom:6px;display:flex;gap:6px;"><span style="color:#c96442;margin-top:2px;">!</span>${f}</li>`).join("")}
            </ul>
            ${ux.observations && ux.observations.length > 0 ? `
              <hr style="border:none;border-top:1px solid #e8e6dc;margin:12px 0;"/>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#87867f;margin-bottom:8px;">UX Observations</div>
              <ul style="list-style:none;padding:0;">
                ${ux.observations.slice(0, 3).map(o => `<li style="font-size:12px;color:#5e5d59;margin-bottom:4px;padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:#141413">›</span>${o}</li>`).join("")}
              </ul>
            ` : ""}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}
