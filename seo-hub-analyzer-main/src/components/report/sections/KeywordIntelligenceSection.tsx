import type { KeywordIntelligenceAudit, KeywordOpportunity } from "@/lib/forensicTypes";
import { PremiumLock } from "@/components/report/PremiumLock";
import { TrendingUp, Search, DollarSign, BarChart3, ArrowUpRight } from "lucide-react";

interface Props { data: KeywordIntelligenceAudit; }

const INTENT_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Informational: { label: "Informational", bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  Commercial:    { label: "Commercial",    bg: "bg-orange-50",  text: "text-orange-700", dot: "bg-orange-500" },
  Transactional: { label: "Transactional", bg: "bg-emerald-50", text: "text-emerald-700",dot: "bg-emerald-500" },
  Navigational:  { label: "Navigational",  bg: "bg-violet-50",  text: "text-violet-700", dot: "bg-violet-500" },
};

const DIFFICULTY_CONFIG = (v: number) =>
  v >= 70
    ? { label: "Hard",   bar: "bg-gradient-to-r from-[#ef4444] to-[#dc2626]", text: "text-[#c96442]" }
    : v >= 45
    ? { label: "Medium", bar: "bg-gradient-to-r from-[#f59e0b] to-[#d97706]", text: "text-[#a16207]" }
    : { label: "Easy",   bar: "bg-gradient-to-r from-[#22c55e] to-[#16a34a]", text: "text-[#166534]" };

function IntentBadge({ intent }: { intent: string }) {
  const cfg = INTENT_CONFIG[intent] ?? { label: intent, bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em] ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DifficultyCell({ value }: { value: number }) {
  const cfg = DIFFICULTY_CONFIG(value);
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
        <span className="text-[11px] font-bold text-[#141413]">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#f0eee6] overflow-hidden">
        <div className={`h-full rounded-full ${cfg.bar} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) return <span className="text-[13px] text-[#c4c2bc] font-medium">—</span>;
  const color =
    rank <= 3  ? "text-[#166534] bg-[#f0fdf4] border-[#bbf7d0]" :
    rank <= 10 ? "text-[#1e40af] bg-[#eff6ff] border-[#bfdbfe]" :
    rank <= 30 ? "text-[#a16207] bg-[#fefce8] border-[#fde68a]" :
                 "text-[#9ca3af] bg-[#f9fafb] border-[#e5e7eb]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-bold ${color}`}>
      #{rank}
    </span>
  );
}

function KeywordCard({ kw, index }: { kw: KeywordOpportunity; index: number }) {
  const isRanking = kw.current_rank !== null;
  return (
    <div className="group relative flex flex-col gap-3 p-4 rounded-[16px] border border-[#f0eee6] bg-white hover:border-[#d8d4ca] hover:shadow-[0_4px_16px_rgba(20,20,19,0.06)] transition-all duration-200">
      {/* Row top: keyword name + rank badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] text-[#c4c2bc] font-mono tabular-nums">#{String(index + 1).padStart(2, "0")}</span>
            {isRanking && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-[#22c55e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                Active
              </span>
            )}
          </div>
          <p className="text-[14px] font-semibold text-[#141413] leading-snug">{kw.keyword}</p>
        </div>
        <RankBadge rank={kw.current_rank} />
      </div>

      {/* Intent */}
      <IntentBadge intent={kw.intent} />

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#f5f3ef]">
        {/* Volume */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Search className="h-3 w-3 text-[#87867f]" />
            <span className="text-[9px] uppercase tracking-[0.1em] text-[#87867f]">Volume</span>
          </div>
          <span className="text-[13px] font-bold text-[#141413]">{kw.search_volume.toLocaleString()}</span>
        </div>
        {/* Difficulty */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-[#87867f]" />
            <span className="text-[9px] uppercase tracking-[0.1em] text-[#87867f]">Difficulty</span>
          </div>
          <DifficultyCell value={kw.difficulty} />
        </div>
        {/* CPC */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-[#87867f]" />
            <span className="text-[9px] uppercase tracking-[0.1em] text-[#87867f]">CPC</span>
          </div>
          <span className="text-[13px] font-bold text-[#141413]">{kw.cpc}</span>
        </div>
      </div>

      {/* Hover arrow indicator */}
      <ArrowUpRight className="absolute top-4 right-4 h-3.5 w-3.5 text-[#c4c2bc] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
    </div>
  );
}

function IntentDistribution({ opportunities }: { opportunities: KeywordOpportunity[] }) {
  const total = opportunities.length || 1;
  const counts: Record<string, number> = {};
  opportunities.forEach((kw) => { counts[kw.intent] = (counts[kw.intent] ?? 0) + 1; });

  const COLORS: Record<string, string> = {
    Informational: "#3b82f6",
    Commercial:    "#f97316",
    Transactional: "#22c55e",
    Navigational:  "#8b5cf6",
  };

  return (
    <div className="bg-white border border-[#e8e6dc] rounded-[16px] p-5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f] mb-4">Intent Distribution</p>
      {/* Stacked bar */}
      <div className="h-2.5 w-full rounded-full overflow-hidden flex mb-4">
        {Object.entries(counts).map(([intent, count]) => (
          <div
            key={intent}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
            style={{ width: `${(count / total) * 100}%`, backgroundColor: COLORS[intent] ?? "#9ca3af" }}
            title={`${intent}: ${count}`}
          />
        ))}
      </div>
      <div className="space-y-2.5">
        {Object.entries(counts).map(([intent, count]) => {
          const cfg = INTENT_CONFIG[intent];
          return (
            <div key={intent} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[intent] ?? "#9ca3af" }} />
                <span className="text-[12px] text-[#5e5d59] font-medium">{intent}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#87867f]">{count} kw</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg?.bg ?? "bg-gray-50"} ${cfg?.text ?? "text-gray-600"}`}>
                  {Math.round((count / total) * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function KeywordIntelligenceSection({ data }: Props) {
  const totalVolume = data.opportunities.reduce((s, k) => s + k.search_volume, 0);
  const avgDifficulty = data.opportunities.length
    ? Math.round(data.opportunities.reduce((s, k) => s + k.difficulty, 0) / data.opportunities.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "KW Score",      value: String(data.score),                        icon: <TrendingUp className="h-4 w-4 text-[#22c55e]" />, accent: "text-[#22c55e]" },
          { label: "Ranking KWs",   value: String(data.top_ranking_keywords),          icon: <BarChart3 className="h-4 w-4 text-[#3b82f6]" />,  accent: "text-[#3b82f6]" },
          { label: "Total Volume",  value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(0)}K` : String(totalVolume), icon: <Search className="h-4 w-4 text-[#8b5cf6]" />, accent: "text-[#8b5cf6]" },
          { label: "Traffic Value", value: data.total_traffic_value,                   icon: <DollarSign className="h-4 w-4 text-[#f97316]" />, accent: "text-[#f97316]" },
        ].map(({ label, value, icon, accent }) => (
          <div key={label} className="bg-white border border-[#e8e6dc] rounded-[16px] p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#87867f]">{label}</p>
              {icon}
            </div>
            <p className={`text-[22px] font-bold leading-none ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Intent distribution */}
      <IntentDistribution opportunities={data.opportunities} />

      {/* Keyword Opportunities header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-[#141413]">
              Keyword Opportunities
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#141413] text-white text-[10px] font-bold">{data.opportunities.length}</span>
            </h3>
            <p className="text-[11px] text-[#87867f] mt-0.5">
              Avg difficulty: <span className="font-semibold text-[#141413]">{avgDifficulty}/100</span>
            </p>
          </div>
        </div>

        {/* Free tier: first 3 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {data.opportunities.slice(0, 3).map((kw, i) => (
            <KeywordCard key={i} kw={kw} index={i} />
          ))}
        </div>

        {/* Gated: remaining rows */}
        {data.opportunities.length > 3 && (
          <div className="mt-3">
            <PremiumLock
              title="Full Keyword Intelligence Report"
              description={`Upgrade to Pro to unlock ${data.opportunities.length - 3} more keyword opportunities with full difficulty analysis and traffic estimates.`}
              gate="upgrade"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {data.opportunities.slice(3).map((kw, i) => (
                  <KeywordCard key={i} kw={kw} index={i + 3} />
                ))}
              </div>
            </PremiumLock>
          </div>
        )}
      </div>
    </div>
  );
}
