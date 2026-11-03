import { useState } from "react";
import type { ForensicReport } from "@/lib/forensicTypes";

type PreviewMode = "serp" | "og" | "twitter" | "ai-snippet" | "desktop" | "mobile";

const MODES: Array<{ id: PreviewMode; label: string }> = [
  { id: "serp", label: "Google SERP" },
  { id: "og", label: "Open Graph" },
  { id: "twitter", label: "Twitter Card" },
  { id: "ai-snippet", label: "AI Snippet" },
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
];

function truncate(str: string, max: number) {
  if (!str || str === "Missing") return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function SerpPreview({ report }: { report: ForensicReport }) {
  const hostname = (() => { try { return new URL(report.url).hostname; } catch { return report.url; } })();
  const title = report.on_page?.title?.text && report.on_page.title.text !== "Missing"
    ? truncate(report.on_page.title.text, 60)
    : hostname + " — Homepage";
  const desc = report.on_page?.meta_desc?.text && report.on_page.meta_desc.text !== "Missing"
    ? truncate(report.on_page.meta_desc.text, 160)
    : "No meta description detected. Google will auto-generate a snippet, which may not be optimized for your target keywords.";

  return (
    <div className="rounded-[22px] border border-[#e8e6dc] bg-[#ffffff] p-6">
      <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Google Search Preview</p>
      <div className="rounded-[16px] border border-[#f0eee6] bg-[#faf9f5] p-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="h-4 w-4 rounded-full bg-[#e8e6dc] flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-[#87867f]" />
          </div>
          <span className="text-[12px] text-[#5e5d59]">{hostname}</span>
          <span className="text-[12px] text-[#87867f]">›</span>
          <span className="text-[12px] text-[#87867f]">{new URL(report.url).pathname.replace(/\//g, "") || "home"}</span>
        </div>
        {/* Title */}
        <h3 className="text-[18px] font-normal leading-[1.3] text-[#1a0dab] hover:underline cursor-pointer">
          {title}
        </h3>
        {/* URL */}
        <p className="mt-1 text-[12px] text-[#006621]">{truncate(report.url, 70)}</p>
        {/* Description */}
        <p className="mt-2 text-[13px] leading-[1.65] text-[#4d5156]">{desc}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={`rounded-[14px] border px-3 py-2.5 ${report.on_page?.title?.status === "Pass" ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecaca] bg-[#fff5f5]"}`}>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f]">Title</p>
          <p className={`mt-1 text-[13px] font-medium ${report.on_page?.title?.status === "Pass" ? "text-[#166534]" : "text-[#c96442]"}`}>
            {report.on_page?.title?.length ?? 0} chars · {report.on_page?.title?.status ?? "—"}
          </p>
        </div>
        <div className={`rounded-[14px] border px-3 py-2.5 ${report.on_page?.meta_desc?.status === "Pass" ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fecaca] bg-[#fff5f5]"}`}>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f]">Description</p>
          <p className={`mt-1 text-[13px] font-medium ${report.on_page?.meta_desc?.status === "Pass" ? "text-[#166534]" : "text-[#c96442]"}`}>
            {report.on_page?.meta_desc?.length ?? 0} chars · {report.on_page?.meta_desc?.status ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function OgPreview({ report }: { report: ForensicReport }) {
  const hostname = (() => { try { return new URL(report.url).hostname; } catch { return report.url; } })();
  const hasOg = report.technical?.og_tags ?? false;
  const title = report.on_page?.title?.text && report.on_page.title.text !== "Missing"
    ? truncate(report.on_page.title.text, 88)
    : hostname;
  const desc = report.on_page?.meta_desc?.text && report.on_page.meta_desc.text !== "Missing"
    ? truncate(report.on_page.meta_desc.text, 200)
    : "No Open Graph description detected.";

  return (
    <div className="rounded-[22px] border border-[#e8e6dc] bg-[#ffffff] p-6">
      <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Open Graph / Social Card Preview</p>
      {!hasOg && (
        <div className="mb-4 rounded-[14px] border border-[#fecaca] bg-[#fff5f5] px-4 py-3">
          <p className="text-[13px] text-[#c96442]">⚠ No Open Graph tags detected — social shares will use a generic fallback preview.</p>
        </div>
      )}
      <div className="rounded-[16px] border border-[#e0dbd0] overflow-hidden">
        <div className="h-44 bg-gradient-to-br from-[#ebe6db] to-[#f5f3ee] flex items-center justify-center">
          <div className="text-center">
            <div className="h-14 w-14 rounded-[16px] bg-[#d9d3c7] mx-auto mb-3 flex items-center justify-center">
              <span className="text-[22px]">🌐</span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#87867f]">{hasOg ? "og:image" : "No og:image"}</p>
          </div>
        </div>
        <div className="border-t border-[#ebe6db] bg-[#f5f3ee] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#87867f]">{hostname.toUpperCase()}</p>
          <p className="mt-1 text-[15px] font-semibold leading-[1.3] text-[#141413]">{title}</p>
          <p className="mt-1 text-[12px] leading-[1.6] text-[#5e5d59]">{truncate(desc, 100)}</p>
        </div>
      </div>
    </div>
  );
}

function TwitterPreview({ report }: { report: ForensicReport }) {
  const hostname = (() => { try { return new URL(report.url).hostname; } catch { return report.url; } })();
  const hasTwitter = report.technical?.twitter_card ?? false;
  const title = report.on_page?.title?.text && report.on_page.title.text !== "Missing"
    ? truncate(report.on_page.title.text, 70)
    : hostname;
  const desc = report.on_page?.meta_desc?.text && report.on_page.meta_desc.text !== "Missing"
    ? truncate(report.on_page.meta_desc.text, 120)
    : "No Twitter card description.";

  return (
    <div className="rounded-[22px] border border-[#e8e6dc] bg-[#ffffff] p-6">
      <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#87867f]">Twitter / X Card Preview</p>
      {!hasTwitter && (
        <div className="mb-4 rounded-[14px] border border-[#fecaca] bg-[#fff5f5] px-4 py-3">
          <p className="text-[13px] text-[#c96442]">⚠ No Twitter Card meta tags detected.</p>
        </div>
      )}
      <div className="rounded-[18px] border border-[#e5e7eb] overflow-hidden max-w-[440px]">
        <div className="h-36 bg-gradient-to-br from-[#dde8f0] to-[#eef4f9] flex items-center justify-center">
          <span className="text-[32px]">🌐</span>
        </div>
        <div className="border-t border-[#e5e7eb] bg-white px-4 py-3">
          <p className="text-[13px] font-semibold text-[#141413]">{title}</p>
          <p className="mt-1 text-[12px] leading-[1.5] text-[#6b7280]">{desc}</p>
          <p className="mt-2 flex items-center gap-1 text-[12px] text-[#9ca3af]">
            <span>🔗</span> {hostname}
          </p>
        </div>
      </div>
    </div>
  );
}

function AiSnippetPreview({ report }: { report: ForensicReport }) {
  const aiScore = report.scores?.ai_visibility ?? 0;
  const hostname = (() => { try { return new URL(report.url).hostname; } catch { return report.url; } })();
  const title = report.on_page?.title?.text && report.on_page.title.text !== "Missing"
    ? report.on_page.title.text
    : hostname;
  const desc = report.on_page?.meta_desc?.text && report.on_page.meta_desc.text !== "Missing"
    ? report.on_page.meta_desc.text
    : "Content not structured for AI snippet extraction.";
  const hasFaq = report.ai_visibility?.structured_answer_readiness ?? false;

  return (
    <div className="rounded-[22px] border border-[#e8e6dc] bg-[#ffffff] p-6">
      <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#87867f]">AI Snippet / LLM Readiness Preview</p>
      <div className="rounded-[16px] border border-[#ebe6db] bg-[#faf9f5] p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#c96442] to-[#e8834a] flex items-center justify-center">
            <span className="text-[12px]">✦</span>
          </div>
          <span className="text-[13px] font-medium text-[#141413]">AI Overview candidate</span>
          <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${aiScore >= 70 ? "bg-[#f0fdf4] text-[#166534]" : aiScore >= 40 ? "bg-[#fefce8] text-[#a16207]" : "bg-[#fff5f2] text-[#c96442]"}`}>
            {aiScore >= 70 ? "High potential" : aiScore >= 40 ? "Moderate potential" : "Low potential"}
          </span>
        </div>
        <h4 className="text-[15px] font-semibold text-[#141413]">{truncate(title, 80)}</h4>
        <p className="mt-2 text-[13px] leading-[1.7] text-[#5e5d59]">{truncate(desc, 180)}</p>
        <p className="mt-2 text-[11px] text-[#87867f]">— {hostname}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "FAQ Schema", ok: hasFaq },
          { label: "Structured content", ok: report.ai_visibility?.llm_friendly_structure ?? false },
          { label: "Snippet optimized", ok: report.ai_visibility?.snippet_optimized ?? false },
        ].map((item) => (
          <div key={item.label} className={`rounded-[14px] border px-3 py-2.5 text-center ${item.ok ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#e8e6dc] bg-[#faf9f5]"}`}>
            <p className={`text-[18px] ${item.ok ? "" : "opacity-30"}`}>{item.ok ? "✓" : "✗"}</p>
            <p className="mt-1 text-[11px] text-[#87867f]">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenshotPreview({ url, mode }: { url: string; mode: "desktop" | "mobile" }) {
  const isMobile = mode === "mobile";
  const screenshotSrc = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url${isMobile ? "&viewport.width=375&viewport.height=812&viewport.isMobile=true" : ""}`;

  return (
    <div className="rounded-[22px] border border-[#e8e6dc] bg-[#ffffff] p-6">
      <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#87867f]">{isMobile ? "Mobile" : "Desktop"} Render Preview</p>
      {isMobile ? (
        <div className="flex justify-center">
          <div className="w-[240px] rounded-[32px] border-[8px] border-[#141413] bg-[#faf9f5] shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-20 bg-[#141413] rounded-b-[10px] z-10" />
            <img src={screenshotSrc} alt="Mobile preview" className="w-full object-cover object-top" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] overflow-hidden border border-[#e0dbd0] bg-[#141413]">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#30302e]">
            <div className="h-2.5 w-2.5 rounded-full bg-[#30302e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#30302e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#30302e]" />
            <div className="ml-3 flex-1 max-w-xs rounded bg-[#1f1e1a] px-2 py-1 text-[10px] font-mono text-[#87867f] truncate">{url}</div>
          </div>
          <img src={screenshotSrc} alt="Desktop preview" className="w-full object-cover object-top max-h-[420px]" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}

interface Props {
  report: ForensicReport;
}

export function PreviewEngine({ report }: Props) {
  const [mode, setMode] = useState<PreviewMode>("serp");

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-2 rounded-[20px] border border-[#e8e6dc] bg-[#faf9f5] p-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-[14px] px-4 py-2 text-[13px] font-medium transition-colors ${
              mode === m.id
                ? "bg-[#141413] text-[#faf9f5]"
                : "text-[#5e5d59] hover:bg-[#f0eee6]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Preview Content */}
      <div className="animate-in fade-in duration-300">
        {mode === "serp" && <SerpPreview report={report} />}
        {mode === "og" && <OgPreview report={report} />}
        {mode === "twitter" && <TwitterPreview report={report} />}
        {mode === "ai-snippet" && <AiSnippetPreview report={report} />}
        {mode === "desktop" && <ScreenshotPreview url={report.url} mode="desktop" />}
        {mode === "mobile" && <ScreenshotPreview url={report.url} mode="mobile" />}
      </div>
    </div>
  );
}
