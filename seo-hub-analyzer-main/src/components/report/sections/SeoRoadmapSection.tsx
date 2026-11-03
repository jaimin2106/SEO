import { useState } from "react";
import type { SeoRoadmap, RoadmapTask } from "@/lib/forensicTypes";
import { PremiumLock } from "@/components/report/PremiumLock";

interface Props { data: SeoRoadmap; }

const PHASES = [
  { key: "immediate",   label: "Immediate",    emoji: "🔴", description: "Fix this week — high impact, often low effort" },
  { key: "this_week",   label: "This Week",    emoji: "🟠", description: "Achievable within 7 days" },
  { key: "this_month",  label: "This Month",   emoji: "🟡", description: "Sprint-level improvements" },
  { key: "long_term",   label: "Long-Term",    emoji: "🟢", description: "Strategic growth investments" },
] as const;

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "bg-[#fff5f2] text-[#c96442] border-[#efd0c7]",
  High:     "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]",
  Medium:   "bg-[#fefce8] text-[#a16207] border-[#fde68a]",
  Low:      "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
};

const EFFORT_ICONS: Record<string, string> = { Low: "⚡", Medium: "🔧", High: "🏗️" };

function TaskCard({ task }: { task: RoadmapTask }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-[#e8e6dc] rounded-[14px] overflow-hidden hover:shadow-sm transition-shadow">
      <button
        type="button"
        className="w-full text-left px-4 py-4 flex items-start gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className={`text-[10px] border px-1.5 py-0.5 rounded-full font-medium shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-[10px] text-[#87867f] border border-[#e8e6dc] px-1.5 py-0.5 rounded-full shrink-0">
              {EFFORT_ICONS[task.effort]} {task.effort} effort
            </span>
            {task.developer_required && (
              <span className="text-[10px] text-[#5e5d59] border border-[#e8e6dc] px-1.5 py-0.5 rounded-full shrink-0">
                👩‍💻 Dev required
              </span>
            )}
          </div>
          <h4 className="text-[13px] font-semibold text-[#141413] mt-1.5 leading-snug">{task.title}</h4>
        </div>
        <span className="text-[#87867f] text-[11px] shrink-0 mt-1">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#f0eee6] pt-3 space-y-3">
          <p className="text-[12px] text-[#5e5d59] leading-relaxed">{task.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "SEO Gain", value: `+${task.seo_score_gain} pts`, color: "text-[#166534]" },
              { label: "Traffic", value: task.traffic_gain_estimate, color: "text-[#1d4ed8]" },
              { label: "CTR", value: task.ctr_gain, color: "text-[#6d28d9]" },
              { label: "Time Est.", value: task.estimated_hours, color: "text-[#5e5d59]" },
            ].map(m => (
              <div key={m.label} className="bg-[#faf9f5] rounded-[10px] p-2.5">
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#87867f]">{m.label}</p>
                <p className={`text-[12px] font-semibold mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#87867f] mb-1">Business Impact</p>
            <p className="text-[12px] text-[#141413]">{task.business_impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SeoRoadmapSection({ data }: Props) {
  const [activePhase, setActivePhase] = useState<typeof PHASES[number]["key"]>("immediate");
  const phaseData = data[activePhase];

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <div className="bg-[#141413] text-[#faf9f5] rounded-[20px] p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Total Score Potential</p>
          <p className="text-[28px] font-bold mt-1">+{data.total_potential_score_gain} <span className="text-[14px] text-[#87867f]">pts</span></p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#87867f]">Traffic Potential</p>
          <p className="text-[15px] font-semibold mt-1 text-[#b0aea5]">{data.total_estimated_traffic_gain}</p>
          <div className="flex gap-3 mt-2 flex-wrap">
            {PHASES.map(p => {
              const count = data[p.key].length;
              return (
                <span key={p.key} className="text-[11px] text-[#87867f]">
                  {p.emoji} {count} {p.label.toLowerCase()} task{count !== 1 ? "s" : ""}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 flex-wrap">
        {PHASES.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePhase(p.key)}
            className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all border ${
              activePhase === p.key
                ? "border-[#141413] bg-[#141413] text-white"
                : "border-[#e8e6dc] bg-white text-[#5e5d59] hover:border-[#141413]"
            }`}
          >
            {p.emoji} {p.label} <span className="opacity-60 ml-1">({data[p.key].length})</span>
          </button>
        ))}
      </div>

      {/* Phase description */}
      <p className="text-[12px] text-[#87867f]">
        {PHASES.find(p => p.key === activePhase)?.description}
      </p>

      {/* Task list */}
      {activePhase === "immediate" ? (
        phaseData.length === 0 ? (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[14px] p-4 text-center text-[13px] text-[#166534]">✓ No immediate critical issues detected.</div>
        ) : (
          <div className="space-y-3">
            {phaseData.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )
      ) : activePhase === "this_week" ? (
        <div className="space-y-3">
          {phaseData.slice(0, 2).map(task => <TaskCard key={task.id} task={task} />)}
          {phaseData.length > 2 && (
            <PremiumLock title="More This-Week Tasks" description="Upgrade to Pro to see all this-week tasks with full impact forecasts." gate="upgrade">
              <div className="space-y-3">
                {phaseData.slice(2).map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </PremiumLock>
          )}
        </div>
      ) : (
        <PremiumLock title={`${PHASES.find(p => p.key === activePhase)?.label} Roadmap`} description="Upgrade to Pro to unlock the full strategic roadmap with impact forecasts, business cases, and time estimates." gate="upgrade">
          <div className="space-y-3">
            {phaseData.length === 0 ? (
              <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-[14px] p-4 text-center text-[13px] text-[#87867f]">No tasks in this phase based on current audit.</div>
            ) : (
              phaseData.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </PremiumLock>
      )}
    </div>
  );
}
