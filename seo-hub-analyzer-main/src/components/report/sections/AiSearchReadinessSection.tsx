import { useState } from "react";
import type { AiSearchReadiness } from "@/lib/forensicTypes";
import { PremiumLock } from "@/components/report/PremiumLock";

interface Props { data: AiSearchReadiness; }

const AI_ENGINES = [
  { key: "chatgpt_readiness",     label: "ChatGPT",         emoji: "💬", color: "#10a37f" },
  { key: "claude_readiness",      label: "Claude",          emoji: "🤖", color: "#7c5a3c" },
  { key: "gemini_readiness",      label: "Gemini",          emoji: "✨", color: "#4285f4" },
  { key: "perplexity_readiness",  label: "Perplexity",      emoji: "🔮", color: "#6366f1" },
  { key: "google_aio_readiness",  label: "Google AIO",      emoji: "🔍", color: "#ea4335" },
  { key: "copilot_readiness",     label: "Copilot",         emoji: "🪁", color: "#0078d4" },
] as const;

const BREAKDOWN_ITEMS = [
  { key: "citation_readiness",      label: "Citation Readiness",      desc: "How likely AI models will cite your content as a source" },
  { key: "answer_readiness",        label: "Answer Readiness",        desc: "Ability to provide direct, quotable answers to user queries" },
  { key: "structured_content_score",label: "Structured Content",      desc: "Schema markup, FAQPage, lists, and machine-readable formatting" },
  { key: "semantic_clarity_score",  label: "Semantic Clarity",        desc: "Topic coherence and semantic chunk quality for LLM parsing" },
  { key: "authority_signals_score", label: "Authority Signals",       desc: "E-E-A-T signals: expertise, authoritativeness, trustworthiness" },
] as const;

function RadialScore({ score, label, color, emoji }: { score: number; label: string; color: string; emoji: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#f0eee6" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[13px]">{emoji}</span>
          <span className="text-[11px] font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-[#87867f] text-center leading-tight">{label}</span>
    </div>
  );
}

function BarScore({ label, score, desc }: { label: string; score: number; desc: string }) {
  const color = score >= 75 ? "bg-[#22c55e]" : score >= 50 ? "bg-[#eab308]" : "bg-[#c96442]";
  const textColor = score >= 75 ? "text-[#166534]" : score >= 50 ? "text-[#a16207]" : "text-[#c96442]";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div>
          <span className="text-[12px] font-semibold text-[#141413]">{label}</span>
          <span className="text-[11px] text-[#87867f] ml-2 hidden sm:inline">{desc}</span>
        </div>
        <span className={`text-[13px] font-bold ${textColor}`}>{score}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#f0eee6] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function AiSearchReadinessSection({ data }: Props) {
  const [activeEngine, setActiveEngine] = useState("chatgpt_readiness");
  const activeScore = (data as any)[activeEngine] ?? 0;
  const activeInfo = AI_ENGINES.find(e => e.key === activeEngine)!;

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="bg-[#141413] text-[#faf9f5] rounded-[20px] p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#87867f]">Overall AI Search Readiness</p>
          <p className="text-[42px] font-bold leading-none mt-2">{data.overall_score}<span className="text-[18px] text-[#87867f] ml-1">/100</span></p>
          <p className="text-[13px] text-[#b0aea5] mt-2">
            {data.overall_score >= 75 ? "Strong AI visibility. Your content is well-positioned for AI-generated answers." :
             data.overall_score >= 50 ? "Moderate AI visibility. Several optimizations can dramatically improve inclusion." :
             "Low AI visibility. Immediate structural improvements needed to appear in AI answers."}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          {AI_ENGINES.slice(0, 3).map(e => (
            <RadialScore key={e.key} score={(data as any)[e.key]} label={e.label} color={e.color} emoji={e.emoji} />
          ))}
        </div>
      </div>

      {/* Per-engine breakdown */}
      <PremiumLock title="Full AI Engine Breakdown" description="Upgrade to Pro to unlock per-engine AI readiness scores, citation analysis, and targeted optimization recommendations." gate="upgrade">
        <div className="space-y-4">
          {/* Engine tabs */}
          <div className="flex flex-wrap gap-2">
            {AI_ENGINES.map(e => (
              <button
                key={e.key}
                onClick={() => setActiveEngine(e.key)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
                  activeEngine === e.key
                    ? "border-[#141413] bg-[#141413] text-white"
                    : "border-[#e8e6dc] bg-white text-[#5e5d59] hover:border-[#141413]"
                }`}
              >
                {e.emoji} {e.label}
              </button>
            ))}
          </div>

          {/* Active engine detail */}
          <div className="bg-white border border-[#e8e6dc] rounded-[16px] p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[24px]">{activeInfo.emoji}</span>
              <div>
                <h4 className="text-[15px] font-semibold text-[#141413]">{activeInfo.label} Readiness</h4>
                <p className="text-[12px] text-[#87867f]">Score: <strong style={{ color: activeInfo.color }}>{activeScore}/100</strong></p>
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-[#f0eee6] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${activeScore}%`, backgroundColor: activeInfo.color }} />
            </div>
            <p className="text-[12px] text-[#5e5d59] mt-3">
              {activeScore >= 75 ? `Your content is well-optimized for ${activeInfo.label} inclusion.` :
               activeScore >= 50 ? `${activeInfo.label} readiness is moderate. Apply the recommendations below.` :
               `${activeInfo.label} readiness is low. Structured content and authority signals are needed.`}
            </p>
          </div>

          {/* Signal breakdown */}
          <div className="bg-white border border-[#e8e6dc] rounded-[16px] p-5 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#87867f]">Signal Breakdown</p>
            {BREAKDOWN_ITEMS.map(item => (
              <BarScore key={item.key} label={item.label} score={(data as any)[item.key]} desc={item.desc} />
            ))}
          </div>

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-[16px] p-5 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#87867f]">AI Optimization Recommendations</p>
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#c96442] text-[14px] shrink-0 mt-0.5">→</span>
                  <p className="text-[13px] text-[#141413] leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumLock>
    </div>
  );
}
