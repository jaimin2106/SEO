import type { BenchmarkingAudit, ScoreSet } from "@/lib/forensicTypes";

interface Props {
  benchmarking: BenchmarkingAudit;
  scores: ScoreSet;
}

const VERDICT_STYLES: Record<string, string> = {
  "Above Benchmark": "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
  "Competitive":     "bg-[#fefce8] text-[#a16207] border-[#fde68a]",
  "Below Benchmark": "bg-[#fff5f2] text-[#c96442] border-[#efd0c7]",
};

const VERDICT_ICONS: Record<string, string> = {
  "Above Benchmark": "↑",
  "Competitive":     "→",
  "Below Benchmark": "↓",
};

function BenchmarkRow({ entry }: { entry: BenchmarkingAudit["baselines"][number] }) {
  const style = VERDICT_STYLES[entry.verdict] || VERDICT_STYLES["Competitive"];
  const icon = VERDICT_ICONS[entry.verdict] || "→";
  const siteWidth = Math.min(100, entry.score);
  const benchWidth = Math.min(100, entry.benchmark);

  return (
    <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <h4 className="text-[13px] font-semibold text-[#141413]">{entry.label}</h4>
        <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${style}`}>
          {icon} {entry.verdict}
        </span>
      </div>

      {/* Comparison bars */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#87867f] w-16 shrink-0">Your site</span>
          <div className="flex-1 h-2 rounded-full bg-[#f0eee6] overflow-hidden">
            <div className="h-full rounded-full bg-[#141413] transition-all duration-700" style={{ width: `${siteWidth}%` }} />
          </div>
          <span className="text-[11px] font-bold text-[#141413] w-6 text-right">{entry.score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#87867f] w-16 shrink-0">Industry</span>
          <div className="flex-1 h-2 rounded-full bg-[#f0eee6] overflow-hidden">
            <div className="h-full rounded-full bg-[#d1cfc5] transition-all duration-700" style={{ width: `${benchWidth}%` }} />
          </div>
          <span className="text-[11px] font-medium text-[#87867f] w-6 text-right">{entry.benchmark}</span>
        </div>
      </div>

      {/* Gap + insight */}
      <div className="mt-3 pt-3 border-t border-[#f0eee6] flex items-start gap-2">
        <span className={`text-[11px] font-semibold shrink-0 ${entry.gap > 0 ? "text-[#166534]" : entry.gap < 0 ? "text-[#c96442]" : "text-[#87867f]"}`}>
          {entry.gap > 0 ? `+${entry.gap}` : entry.gap} gap
        </span>
        <p className="text-[11px] text-[#87867f] leading-relaxed">{entry.insight}</p>
      </div>
    </div>
  );
}

function PositionSummary({ benchmarking }: { benchmarking: BenchmarkingAudit }) {
  const above = benchmarking.baselines.filter(b => b.verdict === "Above Benchmark").length;
  const competitive = benchmarking.baselines.filter(b => b.verdict === "Competitive").length;
  const below = benchmarking.baselines.filter(b => b.verdict === "Below Benchmark").length;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Above Benchmark", count: above, color: "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" },
        { label: "Competitive",     count: competitive, color: "border-[#fde68a] bg-[#fefce8] text-[#a16207]" },
        { label: "Below Benchmark", count: below, color: "border-[#efd0c7] bg-[#fff5f2] text-[#c96442]" },
      ].map(item => (
        <div key={item.label} className={`rounded-[14px] border p-3 text-center ${item.color}`}>
          <p className="text-[24px] font-bold leading-none">{item.count}</p>
          <p className="text-[9px] uppercase tracking-[0.1em] mt-1 opacity-75">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export function CompetitiveBenchmarkSection({ benchmarking, scores }: Props) {
  return (
    <div className="space-y-5">
      {/* Overall positioning */}
      <div className="bg-[#141413] text-[#faf9f5] rounded-[20px] p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#87867f]">Industry Position</p>
        <p className="text-[15px] font-medium mt-2 text-[#b0aea5] leading-relaxed">{benchmarking.overall_positioning}</p>
      </div>

      {/* Summary counts */}
      <PositionSummary benchmarking={benchmarking} />

      {/* Benchmark cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {benchmarking.baselines.map((entry, idx) => (
          <BenchmarkRow key={idx} entry={entry} />
        ))}
      </div>

      {/* Competitive advantage summary */}
      <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-[14px] p-5">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f] mb-3">Competitive Advantage Analysis</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[#141413] mb-2">🟢 Areas of Strength</p>
            <div className="space-y-1">
              {benchmarking.baselines
                .filter(b => b.verdict === "Above Benchmark")
                .map(b => (
                  <p key={b.label} className="text-[12px] text-[#166534]">• {b.label}: +{b.gap} above industry avg</p>
                ))}
              {benchmarking.baselines.filter(b => b.verdict === "Above Benchmark").length === 0 && (
                <p className="text-[12px] text-[#87867f]">No dimensions above benchmark yet.</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#141413] mb-2">🔴 Priority Gaps</p>
            <div className="space-y-1">
              {benchmarking.baselines
                .filter(b => b.verdict === "Below Benchmark")
                .sort((a, b) => a.gap - b.gap)
                .slice(0, 4)
                .map(b => (
                  <p key={b.label} className="text-[12px] text-[#c96442]">• {b.label}: {b.gap} gap to close</p>
                ))}
              {benchmarking.baselines.filter(b => b.verdict === "Below Benchmark").length === 0 && (
                <p className="text-[12px] text-[#87867f]">No critical gaps detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
