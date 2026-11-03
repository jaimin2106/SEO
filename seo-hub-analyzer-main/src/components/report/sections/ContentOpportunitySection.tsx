import type { ContentOpportunityAudit } from "@/lib/forensicTypes";
import { PremiumLock } from "@/components/report/PremiumLock";

interface Props { data: ContentOpportunityAudit; }

const IMPACT_STYLES: Record<string, { badge: string; card: string }> = {
  High:   { badge: "bg-[#fff5f2] text-[#c96442] border-[#efd0c7]", card: "border-l-4 border-l-[#c96442]" },
  Medium: { badge: "bg-[#fefce8] text-[#a16207] border-[#fde68a]", card: "border-l-4 border-l-[#eab308]" },
  Low:    { badge: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]", card: "border-l-4 border-l-[#22c55e]" },
};

const EFFORT_LABELS: Record<string, string> = {
  Low: "🟢 Low effort",
  Medium: "🟡 Medium effort",
  High: "🔴 High effort",
};

const TYPE_ICONS: Record<string, string> = {
  thin_content: "📄",
  topic_gap: "🎯",
  keyword_cannibalization: "⚔️",
  content_freshness: "🕐",
  duplicate_content: "📋",
};

function ScoreGauge({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? "text-[#166534]" : score >= 50 ? "text-[#a16207]" : "text-[#c96442]";
  const bar = score >= 75 ? "bg-[#22c55e]" : score >= 50 ? "bg-[#eab308]" : "bg-[#c96442]";
  return (
    <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] uppercase tracking-[0.12em] text-[#87867f]">{label}</span>
        <span className={`text-[20px] font-bold ${color}`}>{score}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#f0eee6] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ContentOpportunitySection({ data }: Props) {
  return (
    <div className="space-y-5">
      {/* 4 score gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreGauge label="Authority" score={data.authority_score} />
        <ScoreGauge label="Topic Coverage" score={data.topic_coverage_score} />
        <ScoreGauge label="Depth" score={data.depth_score} />
        <ScoreGauge label="Freshness" score={data.freshness_score} />
      </div>

      {/* Opportunities list */}
      {data.opportunities.length === 0 ? (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[14px] p-5 text-center">
          <p className="text-[14px] font-medium text-[#166534]">✓ No significant content gaps detected in the sampled pages.</p>
        </div>
      ) : (
        <>
          {/* Free users see top 2 */}
          <div className="space-y-3">
            {data.opportunities.slice(0, 2).map((opp, idx) => {
              const style = IMPACT_STYLES[opp.impact];
              return (
                <div key={idx} className={`bg-white border border-[#e8e6dc] rounded-[16px] p-5 ${style.card}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px]">{TYPE_ICONS[opp.type] || "📊"}</span>
                      <h4 className="text-[14px] font-semibold text-[#141413]">{opp.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${style.badge}`}>{opp.impact} Impact</span>
                      <span className="text-[10px] border border-[#e8e6dc] bg-[#faf9f5] text-[#5e5d59] px-2 py-0.5 rounded-full">{EFFORT_LABELS[opp.effort]}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#5e5d59] leading-relaxed mt-3">{opp.description}</p>
                  <div className="mt-3 pt-3 border-t border-[#f0eee6] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#87867f] mb-1">Estimated Traffic Gain</p>
                      <p className="text-[13px] font-semibold text-[#22c55e]">{opp.estimated_traffic_gain}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#87867f] mb-1">Recommended Action</p>
                      <p className="text-[13px] text-[#141413]">{opp.recommended_action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining opportunities — upgrade gated */}
          {data.opportunities.length > 2 && (
            <PremiumLock title="Full Content Opportunity Report" description={`Upgrade to Pro to unlock ${data.opportunities.length - 2} more content opportunities with traffic estimates and action plans.`} gate="upgrade">
              <div className="space-y-3">
                {data.opportunities.slice(2).map((opp, idx) => {
                  const style = IMPACT_STYLES[opp.impact];
                  return (
                    <div key={idx} className={`bg-white border border-[#e8e6dc] rounded-[16px] p-5 ${style.card}`}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[18px]">{TYPE_ICONS[opp.type] || "📊"}</span>
                          <h4 className="text-[14px] font-semibold text-[#141413]">{opp.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${style.badge}`}>{opp.impact} Impact</span>
                          <span className="text-[10px] border border-[#e8e6dc] bg-[#faf9f5] text-[#5e5d59] px-2 py-0.5 rounded-full">{EFFORT_LABELS[opp.effort]}</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-[#5e5d59] leading-relaxed mt-3">{opp.description}</p>
                      <div className="mt-3 pt-3 border-t border-[#f0eee6]">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[#87867f] mb-1">Recommended Action</p>
                        <p className="text-[13px] text-[#141413]">{opp.recommended_action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PremiumLock>
          )}
        </>
      )}
    </div>
  );
}
