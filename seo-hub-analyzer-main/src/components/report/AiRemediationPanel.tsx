import { useState } from "react";
import type { AuditIssue } from "@/lib/forensicTypes";
import { Badge } from "@/components/ui/badge";

interface AiTarget {
  id: string;
  label: string;
  emoji: string;
  color: string;
  promptPrefix: string;
}

const AI_TARGETS: AiTarget[] = [
  {
    id: "claude",
    label: "Claude",
    emoji: "🤖",
    color: "bg-[#f5f0e8] text-[#7c5a3c] border-[#e8d9c0]",
    promptPrefix: "You are an expert technical SEO engineer and web performance specialist. Please analyze the following issue and provide a precise, production-ready fix.",
  },
  {
    id: "cursor",
    label: "Cursor",
    emoji: "⚡",
    color: "bg-[#f0f4ff] text-[#3b4fc4] border-[#c9d3f5]",
    promptPrefix: "Act as a senior software engineer. Fix the following SEO and performance issue in this codebase. Provide exact file changes and code.",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    emoji: "💬",
    color: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
    promptPrefix: "You are a technical SEO consultant and full-stack engineer. Explain and fix this issue with code examples and step-by-step implementation guidance.",
  },
  {
    id: "gemini",
    label: "Gemini",
    emoji: "✨",
    color: "bg-[#fef9f0] text-[#9a3412] border-[#fed7aa]",
    promptPrefix: "Act as a Google SEO engineer and web performance expert. Resolve this technical issue with framework-agnostic implementation guidance.",
  },
];

function buildPrompt(target: AiTarget, issue: AuditIssue, url: string): string {
  return `${target.promptPrefix}

---

WEBSITE: ${url}
ISSUE PILLAR: ${issue.pillar}
SEVERITY: ${issue.severity.toUpperCase()}
ISSUE TITLE: ${issue.title}
ISSUE SUMMARY: ${issue.summary}

WHY IT MATTERS:
${issue.why_it_matters}

EVIDENCE FROM AUDIT:
${issue.evidence.map((e, i) => `${i + 1}. ${e}`).join("\n")}

AFFECTED URLS:
${issue.affected_urls.length > 0 ? issue.affected_urls.join("\n") : "Entire site / homepage"}

EXPECTED IMPROVEMENT AFTER FIX:
${issue.expected_after}

ESTIMATED GAIN:
${issue.estimated_gain}

BUSINESS IMPACT:
${issue.business_impact}

DEVELOPER FIX GUIDE (use as starting context):
${issue.developer_fix_guide}

---

Please provide:
1. A clear explanation of ROOT CAUSE
2. Exact code implementation (HTML/JS/framework-specific)
3. Step-by-step deployment guide
4. How to verify the fix is working
5. Any edge cases or risks to watch for

Be precise, actionable, and production-ready.`;
}

interface Props {
  issue: AuditIssue;
  url: string;
}

export function AiRemediationPanel({ issue, url }: Props) {
  const [activeTarget, setActiveTarget] = useState<string>("claude");
  const [copied, setCopied] = useState(false);

  const target = AI_TARGETS.find((t) => t.id === activeTarget) ?? AI_TARGETS[0];
  const prompt = buildPrompt(target, issue, url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select textarea
    }
  };

  return (
    <div className="mt-6 rounded-[22px] border border-[#ebe6db] bg-[#faf9f5] p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#87867f]">AI Remediation Prompt</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-[#5e5d59]">
            Copy a tailored prompt into your AI tool of choice to get an exact, production-ready fix.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {AI_TARGETS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTarget(t.id)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
                activeTarget === t.id
                  ? t.color + " shadow-sm"
                  : "border-[#e8e6dc] bg-[#ffffff] text-[#5e5d59] hover:bg-[#f5f3ee]"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-[#e0dbd0] bg-[#ffffff] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#f0eee6] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Badge className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] shadow-none ${target.color}`}>
              {target.label}
            </Badge>
            <span className="text-[11px] text-[#87867f]">Tailored remediation prompt</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full bg-[#141413] px-3 py-1.5 text-[11px] font-medium text-[#faf9f5] transition-opacity hover:opacity-80"
          >
            {copied ? "✓ Copied!" : "Copy prompt"}
          </button>
        </div>
        <textarea
          readOnly
          value={prompt}
          rows={10}
          className="w-full resize-none bg-[#faf9f5] px-4 py-3 font-mono text-[12px] leading-[1.7] text-[#5e5d59] outline-none"
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
      </div>
    </div>
  );
}
