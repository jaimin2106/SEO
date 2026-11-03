import type { ImageIntelligenceAudit } from "@/lib/forensicTypes";
import { PremiumLock } from "@/components/report/PremiumLock";

interface Props { data: ImageIntelligenceAudit; }

function ScoreBadge({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[16px] border p-4 ${color}`}>
      <span className="text-[28px] font-bold leading-none">{score}</span>
      <span className="text-[10px] uppercase tracking-[0.14em] mt-1.5 opacity-70">{label}</span>
    </div>
  );
}

function MiniBar({ value, max = 100, color = "bg-[#c96442]" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[#f0eee6] overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

const FORMAT_COLORS: Record<string, string> = {
  webp: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
  avif: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
  jpg: "bg-[#fefce8] text-[#a16207] border-[#fde68a]",
  png: "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]",
  svg: "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]",
  gif: "bg-[#fdf4ff] text-[#86198f] border-[#f0abfc]",
  unknown: "bg-[#f9fafb] text-[#374151] border-[#e5e7eb]",
};

const IMPACT_COLORS: Record<string, string> = {
  High: "bg-[#fff5f2] text-[#c96442] border-[#efd0c7]",
  Medium: "bg-[#fefce8] text-[#a16207] border-[#fde68a]",
  Low: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
};

export function ImageIntelligenceSection({ data }: Props) {
  const seoColor = data.seo_score >= 80 ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" : data.seo_score >= 55 ? "border-[#fde68a] bg-[#fefce8] text-[#a16207]" : "border-[#efd0c7] bg-[#fff5f2] text-[#c96442]";
  const a11yColor = data.accessibility_score >= 80 ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" : data.accessibility_score >= 55 ? "border-[#fde68a] bg-[#fefce8] text-[#a16207]" : "border-[#efd0c7] bg-[#fff5f2] text-[#c96442]";
  const perfColor = data.performance_score >= 80 ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" : data.performance_score >= 55 ? "border-[#fde68a] bg-[#fefce8] text-[#a16207]" : "border-[#efd0c7] bg-[#fff5f2] text-[#c96442]";

  return (
    <div className="space-y-5">
      {/* Score Trio */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreBadge label="SEO Score" score={data.seo_score} color={seoColor} />
        <ScoreBadge label="Accessibility" score={data.accessibility_score} color={a11yColor} />
        <ScoreBadge label="Performance" score={data.performance_score} color={perfColor} />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Images", value: data.total_images },
          { label: "Missing Alt", value: data.missing_alt, warn: data.missing_alt > 0 },
          { label: "Generic Alt", value: data.generic_alt, warn: data.generic_alt > 0 },
          { label: "Lazy Load Coverage", value: `${data.lazy_load_coverage}%`, warn: data.lazy_load_coverage < 60 },
        ].map(stat => (
          <div key={stat.label} className={`rounded-[14px] border p-3 ${(stat as { warn?: boolean }).warn ? "border-[#efd0c7] bg-[#fff5f2]" : "border-[#e8e6dc] bg-white"}`}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f]">{stat.label}</p>
            <p className={`text-[20px] font-bold mt-0.5 ${(stat as { warn?: boolean }).warn ? "text-[#c96442]" : "text-[#141413]"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lazy Load Progress */}
      <div className="bg-white border border-[#e8e6dc] rounded-[14px] p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] font-semibold text-[#141413]">Lazy Loading Coverage</span>
          <span className="text-[12px] text-[#87867f]">{data.lazy_loaded} / {data.total_images} images</span>
        </div>
        <MiniBar value={data.lazy_load_coverage} color={data.lazy_load_coverage >= 70 ? "bg-[#22c55e]" : data.lazy_load_coverage >= 40 ? "bg-[#eab308]" : "bg-[#c96442]"} />
      </div>

      {/* Observations */}
      {data.observations.length > 0 && (
        <div className="bg-[#fff5f2] border border-[#efd0c7] rounded-[14px] p-4 space-y-2">
          {data.observations.map((obs, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px] text-[#5e5d59]">
              <span className="text-[#c96442] mt-0.5">•</span>
              <span>{obs}</span>
            </div>
          ))}
        </div>
      )}

      {/* Image Table — Premium Gated */}
      {data.images.length > 0 && (
        <PremiumLock title="Full Image Intelligence Report" description="Upgrade to Pro to unlock per-image analysis with AI-generated alt text suggestions, format detection, and SEO/accessibility impact scoring." gate="upgrade">
          <div className="bg-white border border-[#e8e6dc] rounded-[14px] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0eee6]">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#87867f]">Per-Image Analysis ({data.images.length} images)</p>
            </div>
            <div className="divide-y divide-[#f0eee6]">
              {data.images.map((img, idx) => (
                <div key={idx} className="p-4 hover:bg-[#faf9f5] transition-colors">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {/* URL */}
                      <p className="text-[11px] text-[#87867f] truncate font-mono">{img.src.split("/").slice(-2).join("/") || img.src.slice(0, 50)}</p>
                      {/* Alt text */}
                      <div className="mt-1.5 flex items-start gap-2">
                        {img.alt_missing ? (
                          <span className="text-[11px] font-medium text-[#c96442] bg-[#fff5f2] border border-[#efd0c7] rounded px-1.5 py-0.5 shrink-0">Missing</span>
                        ) : (
                          <span className="text-[12px] text-[#5e5d59] italic">"{img.alt_current}"</span>
                        )}
                      </div>
                      {/* Suggested alt */}
                      {(img.alt_missing || img.alt_current !== img.alt_suggested) && (
                        <div className="mt-1.5 flex items-start gap-1.5">
                          <span className="text-[10px] text-[#87867f] shrink-0 mt-0.5">Suggested:</span>
                          <span className="text-[12px] text-[#22c55e] font-medium">"{img.alt_suggested}"</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Format badge */}
                      <span className={`text-[10px] font-bold uppercase border px-1.5 py-0.5 rounded ${FORMAT_COLORS[img.format_detected] || FORMAT_COLORS.unknown}`}>
                        {img.format_detected}
                      </span>
                      {/* Impact badges */}
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded ${IMPACT_COLORS[img.seo_impact]}`}>SEO: {img.seo_impact}</span>
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded hidden sm:inline ${IMPACT_COLORS[img.accessibility_impact]}`}>A11y: {img.accessibility_impact}</span>
                    </div>
                  </div>
                  {/* Loading + dimensions */}
                  <div className="flex gap-4 mt-2">
                    <span className={`text-[11px] ${img.loading_strategy === "lazy" ? "text-[#22c55e]" : "text-[#c96442]"}`}>
                      {img.loading_strategy === "lazy" ? "✓ Lazy" : "⚠ Not lazy"}
                    </span>
                    <span className={`text-[11px] ${img.dimensions_defined ? "text-[#22c55e]" : "text-[#c96442]"}`}>
                      {img.dimensions_defined ? "✓ Dimensions set" : "⚠ No dimensions"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumLock>
      )}
    </div>
  );
}
