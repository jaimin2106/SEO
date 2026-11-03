export type ScoreStatus = "elite" | "strong" | "watch" | "critical";
export type Severity = "critical" | "high" | "medium" | "low";
export type Effort = "low" | "medium" | "high";

export interface ForensicReport {
  url: string;
  report_date: string;
  audit_status: "Excellent" | "Needs Improvement" | "Critical";
  scan_confidence?: number;
  coverage_percentage?: number;
  scope: AnalysisScope;
  scores: ScoreSet;
  scorecards: ScoreCard[];
  ai_summary: string;
  executive_insights: string[];
  strengths: string[];
  weaknesses: string[];
  quick_wins: AuditIssue[];
  high_impact_fixes: AuditIssue[];
  issues: AuditIssue[];
  performance: PerformanceAudit;
  technical: TechnicalAudit;
  frontend: FrontendAudit;
  ux: UxPsychologyAudit;
  content: ContentIntelligenceAudit;
  ai_visibility: AiVisibilityAudit;
  security: SecurityTrustAudit;
  benchmarking: BenchmarkingAudit;
  keyword_intelligence: KeywordIntelligenceAudit;
  on_page: OnPageSummary;
  // Extended intelligence modules (populated by new builders)
  image_intelligence?: ImageIntelligenceAudit;
  content_opportunities?: ContentOpportunityAudit;
  ai_search_readiness?: AiSearchReadiness;
  seo_roadmap?: SeoRoadmap;
}

export interface OnPageSummary {
  title: { text: string; length: number; status: "Pass" | "Warning" | "Fail" };
  meta_desc: { text: string; length: number; status: "Pass" | "Warning" | "Fail" };
}

export interface AnalysisScope {
  crawl_depth_sampled: number;
  pages_sampled: number;
  sampled_urls: string[];
  sitemap_urls_discovered: number;
  analysis_constraints: string[];
}

export interface ScoreSet {
  overall: number;
  enterprise_readiness: number;
  ai_visibility: number;
  technical_health: number;
  ux_quality: number;
  trust: number;
  conversion: number;
  frontend_engineering: number;
  performance: number;
  content_authority: number;
  mobile_experience: number;
  accessibility: number;
}

export interface ScoreCard {
  key: keyof ScoreSet;
  label: string;
  score: number;
  weight: number;
  benchmark: number;
  gap_to_benchmark: number;
  status: ScoreStatus;
  rationale: string;
}

export interface AuditIssue {
  id: string;
  severity: Severity;
  pillar: string;
  title: string;
  summary: string;
  why_it_matters: string;
  evidence: string[];
  affected_urls: string[];
  effort: Effort;
  score_loss: number;
  estimated_gain: string;
  expected_after: string;
  recommended_fix: string;
  developer_fix_guide: string;
  business_impact: string;
}

export interface PerformanceData {
  score: number;
  lcp: string;
  cls: string;
  inp: string;
  fcp: string;
  tbt: string;
  ttfb: string;
  speed_index: string;
  lcp_status: "pass" | "warn" | "fail";
  cls_status: "pass" | "warn" | "fail";
  inp_status: "pass" | "warn" | "fail";
  fcp_status: "pass" | "warn" | "fail";
  tbt_status: "pass" | "warn" | "fail";
}

export interface ResourceInsight {
  url: string;
  type: string;
  size: string;
  duration: string;
  note: string;
}

export interface PerformanceAudit {
  mobile: PerformanceData;
  desktop: PerformanceData;
  request_profile: {
    total_requests: number;
    total_transfer_size: string;
    render_blocking_resources: number;
    third_party_requests: number;
    largest_requests: ResourceInsight[];
    critical_request_chains: number;
  };
  engineering: {
    js_execution_cost: string;
    hydration_cost: string;
    bundle_size_estimate: string;
    unused_js: string;
    unused_css: string;
    image_optimization: "Strong" | "Mixed" | "Weak";
    modern_image_support: "Strong" | "Mixed" | "Weak";
    font_loading_strategy: "Optimized" | "Watch" | "Poor";
    cdn_optimization: "Strong" | "Mixed" | "Unclear";
    cache_strategy: "Strong" | "Mixed" | "Weak";
    server_compression: "Enabled" | "Partial" | "Missing";
    http2_support: boolean;
    http3_support: boolean;
    critical_rendering_path: string;
    animation_performance: "Smooth" | "Moderate" | "Heavy";
    scroll_performance: "Smooth" | "Moderate" | "Heavy";
    gpu_acceleration: "Present" | "Limited" | "Unknown";
    observations: string[];
  };
}

export interface TechnicalAudit {
  crawl_depth: number;
  internal_pages_sampled: number;
  average_internal_links: number;
  internal_link_graph_density: number;
  orphan_page_candidates: number;
  broken_internal_links: number;
  broken_external_links: number;
  redirect_chain_risk: number;
  redirect_loop_risk: number;
  canonical_conflicts: number;
  duplicate_metadata_clusters: number;
  duplicate_content_clusters: number;
  indexability_risk_pages: number;
  hreflang_issues: number;
  robots_meta_issues: number;
  pagination_issues: number;
  structured_data_types: string[];
  breadcrumb_schema_valid: boolean;
  xml_sitemap_status: "Present" | "Missing" | "Invalid";
  robots_txt_status: "Present" | "Missing" | "Invalid";
  crawl_budget_estimate: "Efficient" | "Watch" | "Inefficient";
  javascript_rendering_risk: "Low" | "Medium" | "High";
  hydration_risk: "Low" | "Medium" | "High";
  lazy_loading_issues: number;
  render_blocking_resources: number;
  dom_complexity: "Lean" | "Moderate" | "Heavy" | "Very Heavy";
  url_structure_quality: "Clean" | "Moderate" | "Poor";
  parameter_pollution_risk: "Low" | "Medium" | "High";
  thin_content_pages: number;
  soft_404_candidates: number;
  og_tags: boolean;
  twitter_card: boolean;
  observations: string[];
}

export interface FrontendAudit {
  score: number;
  ui_smoothness: "Strong" | "Moderate" | "Weak";
  interaction_quality: "Strong" | "Moderate" | "Weak";
  responsiveness_quality: "Strong" | "Moderate" | "Weak";
  mobile_optimization: "Strong" | "Moderate" | "Weak";
  layout_stability: "Strong" | "Moderate" | "Weak";
  animation_sophistication: "Strong" | "Moderate" | "Weak";
  motion_consistency: "Strong" | "Moderate" | "Weak";
  microinteraction_quality: "Strong" | "Moderate" | "Weak";
  visual_hierarchy: "Strong" | "Moderate" | "Weak";
  spacing_consistency: "Strong" | "Moderate" | "Weak";
  accessibility_quality: "Strong" | "Moderate" | "Weak";
  semantic_html_quality: "Strong" | "Moderate" | "Weak";
  component_architecture_signals: "Modern" | "Mixed" | "Legacy";
  modern_frontend_standards: "Strong" | "Moderate" | "Weak";
  observations: string[];
}

export interface UxPsychologyAudit {
  score: number;
  trust_perception: "High" | "Medium" | "Low";
  premium_feel: "High" | "Medium" | "Low";
  emotional_engagement: "High" | "Medium" | "Low";
  visual_psychology: "Clear" | "Mixed" | "Weak";
  conversion_psychology: "Strong" | "Moderate" | "Weak";
  cta_effectiveness: "Strong" | "Moderate" | "Weak";
  cognitive_overload: "Low" | "Moderate" | "High";
  attention_hierarchy: "Strong" | "Moderate" | "Weak";
  user_retention_potential: "High" | "Medium" | "Low";
  clarity_of_messaging: "Strong" | "Moderate" | "Weak";
  friction_points: string[];
  onboarding_quality: "Strong" | "Moderate" | "Weak";
  first_impression: "Premium" | "Standard" | "Weak";
  enterprise_trust_signals: "Strong" | "Moderate" | "Weak";
  perceived_product_quality: "High" | "Medium" | "Low";
  observations: string[];
}

export interface ContentIntelligenceAudit {
  score: number;
  word_count: number;
  reading_time: string;
  readability_score: number;
  readability_label: string;
  topical_authority: "Strong" | "Moderate" | "Weak";
  semantic_relevance: "Strong" | "Moderate" | "Weak";
  entity_coverage: "Strong" | "Moderate" | "Weak";
  nlp_keyword_relationships: string[];
  keyword_cannibalization_risk: "Low" | "Medium" | "High";
  search_intent_alignment: "Strong" | "Moderate" | "Weak";
  eeat_signals: {
    expertise: boolean;
    authoritativeness: boolean;
    trustworthiness: boolean;
  };
  ai_content_footprint: "Low" | "Medium" | "High";
  freshness: "Fresh" | "Moderate" | "Stale" | "Unknown";
  expertise_indicators: string[];
  trust_indicators: string[];
  content_depth_quality: "Expert-Level" | "Comprehensive" | "Moderate" | "Thin";
  audience_targeting_quality: "Strong" | "Moderate" | "Weak";
  primary_entities: string[];
  observations: string[];
}

export interface AiVisibilityAudit {
  score: number;
  ai_readability: "Strong" | "Moderate" | "Weak";
  llm_visibility_optimization: "Strong" | "Moderate" | "Weak";
  semantic_chunk_quality: "Strong" | "Moderate" | "Weak";
  structured_answer_readiness: "Strong" | "Moderate" | "Weak";
  citation_potential: "High" | "Medium" | "Low";
  snippet_optimization: "Strong" | "Moderate" | "Weak";
  ai_search_friendliness: "Strong" | "Moderate" | "Weak";
  answer_engine_optimization: "Strong" | "Moderate" | "Weak";
  conversational_query_optimization: "Strong" | "Moderate" | "Weak";
  snippet_optimized: boolean;
  llm_friendly_structure: boolean;
  recommendations: string[];
}

export interface SecurityTrustAudit {
  score: number;
  https_quality: "Strong" | "Moderate" | "Weak";
  hsts: boolean;
  csp: boolean;
  spf_status: "Verified" | "Unverified" | "Missing";
  dkim_status: "Verified" | "Unverified" | "Missing";
  dmarc_status: "Verified" | "Unverified" | "Missing";
  unsafe_external_links: number;
  mixed_content: number;
  cookie_security: "Secure" | "Moderate" | "Weak";
  exposed_emails: string[];
  trust_badge_quality: "Strong" | "Moderate" | "Weak";
  compliance_signals: string[];
  observations: string[];
}

export interface BenchmarkEntry {
  label: string;
  score: number;
  benchmark: number;
  gap: number;
  verdict: "Above Benchmark" | "Competitive" | "Below Benchmark";
  insight: string;
}

export interface BenchmarkingAudit {
  overall_positioning: string;
  baselines: BenchmarkEntry[];
}

export interface KeywordOpportunity {
  keyword: string;
  intent: "Informational" | "Commercial" | "Navigational" | "Transactional";
  search_volume: number;
  difficulty: number;
  current_rank: number | null;
  cpc: string;
}

export interface KeywordIntelligenceAudit {
  score: number;
  top_ranking_keywords: number;
  total_traffic_value: string;
  opportunities: KeywordOpportunity[];
}

// ── NEW: Image Intelligence ──────────────────────────────────────────────────

export interface ImageAnalysisItem {
  src: string;
  alt_current: string | null;
  alt_suggested: string;
  alt_missing: boolean;
  loading_strategy: string;
  dimensions_defined: boolean;
  format_detected: "webp" | "avif" | "jpg" | "png" | "gif" | "svg" | "unknown";
  seo_impact: "High" | "Medium" | "Low";
  accessibility_impact: "High" | "Medium" | "Low";
}

export interface ImageIntelligenceAudit {
  seo_score: number;
  accessibility_score: number;
  performance_score: number;
  total_images: number;
  missing_alt: number;
  generic_alt: number;
  lazy_loaded: number;
  lazy_load_coverage: number;
  images: ImageAnalysisItem[];
  observations: string[];
}

// ── NEW: Content Opportunity Engine ─────────────────────────────────────────

export interface ContentOpportunity {
  type: "thin_content" | "topic_gap" | "keyword_cannibalization" | "content_freshness" | "duplicate_content";
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  estimated_traffic_gain: string;
  recommended_action: string;
}

export interface ContentOpportunityAudit {
  authority_score: number;
  topic_coverage_score: number;
  depth_score: number;
  freshness_score: number;
  opportunities: ContentOpportunity[];
}

// ── NEW: AI Search Readiness ─────────────────────────────────────────────────

export interface AiSearchReadiness {
  overall_score: number;
  chatgpt_readiness: number;
  claude_readiness: number;
  gemini_readiness: number;
  perplexity_readiness: number;
  google_aio_readiness: number;
  copilot_readiness: number;
  citation_readiness: number;
  answer_readiness: number;
  structured_content_score: number;
  semantic_clarity_score: number;
  authority_signals_score: number;
  recommendations: string[];
}

// ── NEW: SEO Roadmap ─────────────────────────────────────────────────────────

export interface RoadmapTask {
  id: string;
  phase: "immediate" | "this_week" | "this_month" | "long_term";
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  expected_gain: string;
  estimated_hours: string;
  business_impact: string;
  developer_required: boolean;
  traffic_gain_estimate: string;
  seo_score_gain: number;
  ctr_gain: string;
  ai_visibility_gain: number;
}

export interface SeoRoadmap {
  immediate: RoadmapTask[];
  this_week: RoadmapTask[];
  this_month: RoadmapTask[];
  long_term: RoadmapTask[];
  total_potential_score_gain: number;
  total_estimated_traffic_gain: string;
}

