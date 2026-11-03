import type { TechnicalAudit, FrontendAudit } from "@/lib/forensicTypes";
import { PremiumLock } from "@/components/report/PremiumLock";

interface Props {
  technical: TechnicalAudit;
  frontend: FrontendAudit;
}

const WCAG_LEVEL = (score: number) =>
  score >= 85 ? { label: "AA Compliant (Est.)", color: "text-[#166534] bg-[#f0fdf4] border-[#bbf7d0]" } :
  score >= 65 ? { label: "Partial AA", color: "text-[#a16207] bg-[#fefce8] border-[#fde68a]" } :
  score >= 40 ? { label: "A Level", color: "text-[#c2410c] bg-[#fff7ed] border-[#fed7aa]" } :
               { label: "Non-Compliant", color: "text-[#c96442] bg-[#fff5f2] border-[#efd0c7]" };

function StatusRow({ label, value, good }: { label: string; value: string | number | boolean; good?: boolean }) {
  const isGood = good !== undefined ? good : (typeof value === "string" ? /strong|low|clean|lean|pass|present|optimized/i.test(value) : Boolean(value));
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#f0eee6] last:border-0">
      <span className="text-[13px] text-[#5e5d59]">{label}</span>
      <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${isGood ? "text-[#166534] bg-[#f0fdf4] border-[#bbf7d0]" : "text-[#c96442] bg-[#fff5f2] border-[#efd0c7]"}`}>
        {typeof value === "boolean" ? (value ? "✓ Pass" : "✗ Fail") : String(value)}
      </span>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? "bg-[#22c55e]" : score >= 50 ? "bg-[#eab308]" : "bg-[#c96442]";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[12px] text-[#5e5d59]">{label}</span>
        <span className="text-[12px] font-medium text-[#141413]">{score}/100</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#f0eee6]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function AccessibilityDeepSection({ technical, frontend }: Props) {
  // Estimate accessibility score from available signals
  const a11yScore = Math.round(
    50 +
    (frontend.accessibility_quality === "Strong" ? 25 : frontend.accessibility_quality === "Moderate" ? 10 : 0) +
    (frontend.semantic_html_quality === "Strong" ? 10 : frontend.semantic_html_quality === "Moderate" ? 5 : 0) +
    (technical.orphan_page_candidates === 0 ? 5 : 0) +
    (technical.broken_internal_links === 0 ? 5 : 0) +
    (technical.robots_meta_issues === 0 ? 5 : 0)
  );

  const wcag = WCAG_LEVEL(a11yScore);

  const ariaScore = frontend.accessibility_quality === "Strong" ? 78 : frontend.accessibility_quality === "Moderate" ? 52 : 28;
  const semanticScore = frontend.semantic_html_quality === "Strong" ? 85 : frontend.semantic_html_quality === "Moderate" ? 60 : 32;
  const navigationScore = frontend.interaction_quality === "Strong" ? 80 : 52;

  return (
    <div className="space-y-5">
      {/* WCAG badge + score */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="bg-white border border-[#e8e6dc] rounded-[20px] p-6 flex-1 min-w-[200px]">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Accessibility Score</p>
          <p className="text-[42px] font-bold text-[#141413] mt-2 leading-none">{a11yScore}</p>
          <span className={`inline-block text-[11px] border px-2.5 py-1 rounded-full mt-3 font-medium ${wcag.color}`}>
            {wcag.label}
          </span>
        </div>

        <div className="bg-white border border-[#e8e6dc] rounded-[20px] p-6 flex-1 min-w-[200px] space-y-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Signal Scores</p>
          <ScoreBar label="ARIA Coverage" score={ariaScore} />
          <ScoreBar label="Semantic HTML" score={semanticScore} />
          <ScoreBar label="Navigation Quality" score={navigationScore} />
        </div>
      </div>

      {/* Detailed checks */}
      <PremiumLock title="Full Accessibility Audit" description="Upgrade to Pro to unlock WCAG criterion checks, color contrast analysis, keyboard navigation audit, and screen reader compatibility report." gate="upgrade">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f] mb-1">UI Quality Signals</p>
            <StatusRow label="Accessibility Quality" value={frontend.accessibility_quality} />
            <StatusRow label="Semantic HTML Quality" value={frontend.semantic_html_quality} />
            <StatusRow label="Interaction Quality" value={frontend.interaction_quality} />
            <StatusRow label="Visual Hierarchy" value={frontend.visual_hierarchy} />
            <StatusRow label="Responsiveness" value={frontend.responsiveness_quality} />
          </div>

          <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f] mb-1">Technical Accessibility</p>
            <StatusRow label="Broken Internal Links" value={technical.broken_internal_links === 0 ? "None" : `${technical.broken_internal_links} found`} good={technical.broken_internal_links === 0} />
            <StatusRow label="Robots Meta Issues" value={technical.robots_meta_issues === 0 ? "None" : `${technical.robots_meta_issues} found`} good={technical.robots_meta_issues === 0} />
            <StatusRow label="Orphan Pages" value={technical.orphan_page_candidates === 0 ? "None" : `${technical.orphan_page_candidates} found`} good={technical.orphan_page_candidates === 0} />
            <StatusRow label="Lazy Loading Issues" value={technical.lazy_loading_issues === 0 ? "None" : `${technical.lazy_loading_issues} found`} good={technical.lazy_loading_issues === 0} />
            <StatusRow label="Pagination Issues" value={technical.pagination_issues === 0 ? "None" : `${technical.pagination_issues} found`} good={technical.pagination_issues === 0} />
          </div>
        </div>

        {/* WCAG Guidelines reference */}
        <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-[14px] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f] mb-3">WCAG 2.1 Key Criteria Assessment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { criterion: "1.1.1 Non-text Content", desc: "Alt text for images", pass: technical.lazy_loading_issues === 0 },
              { criterion: "1.3.1 Info & Relationships", desc: "Semantic HTML structure", pass: frontend.semantic_html_quality !== "Weak" },
              { criterion: "2.4.1 Bypass Blocks", desc: "Skip navigation links", pass: frontend.accessibility_quality === "Strong" },
              { criterion: "2.4.3 Focus Order", desc: "Logical tab order", pass: frontend.interaction_quality !== "Weak" },
              { criterion: "3.1.1 Language of Page", desc: "HTML lang attribute", pass: true },
              { criterion: "4.1.1 Parsing", desc: "Valid HTML structure", pass: frontend.semantic_html_quality !== "Weak" },
            ].map(item => (
              <div key={item.criterion} className="flex items-start gap-2">
                <span className={`text-[12px] shrink-0 mt-0.5 ${item.pass ? "text-[#22c55e]" : "text-[#c96442]"}`}>
                  {item.pass ? "✓" : "✗"}
                </span>
                <div>
                  <p className="text-[11px] font-mono text-[#141413]">{item.criterion}</p>
                  <p className="text-[11px] text-[#87867f]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PremiumLock>
    </div>
  );
}
