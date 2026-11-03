import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import Footer from "@/components/seohub/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  })
};

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-[14px] bg-[#141413] border border-[#30302e] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#30302e]">
        <span className="text-[11px] font-mono text-[#87867f] uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#87867f] hover:text-[#faf9f5] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-[13px] leading-relaxed font-mono text-[#e8e6dc]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/scan",
    summary: "Trigger a new SEO scan",
    description: "Initiates a forensic scan of the provided URL. Returns a job ID which can be polled for results.",
    request: `POST /api/v1/scan
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://example.com",
  "depth": "full",
  "include_ai_remediation": true
}`,
    response: `{
  "job_id": "scan_01JGH3X2P7",
  "status": "queued",
  "url": "https://example.com",
  "estimated_seconds": 15,
  "created_at": "2025-01-15T10:23:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/scan/:job_id",
    summary: "Get scan results",
    description: "Retrieves the status and results of a scan. Poll this endpoint until status is 'complete'.",
    request: `GET /api/v1/scan/scan_01JGH3X2P7
Authorization: Bearer YOUR_API_KEY`,
    response: `{
  "job_id": "scan_01JGH3X2P7",
  "status": "complete",
  "url": "https://example.com",
  "scores": {
    "overall": 74,
    "technical": 68,
    "performance": 81,
    "on_page": 72,
    "ux": 77
  },
  "issues_count": 12,
  "report_url": "https://seohubanalyzer.com/report?id=scan_01JGH3X2P7",
  "completed_at": "2025-01-15T10:23:19Z"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/scan/:job_id/issues",
    summary: "List all issues",
    description: "Returns the full list of detected issues with severity, pillar classification, and remediation instructions.",
    request: `GET /api/v1/scan/scan_01JGH3X2P7/issues
Authorization: Bearer YOUR_API_KEY`,
    response: `{
  "total": 12,
  "issues": [
    {
      "id": "missing_meta_description",
      "title": "Missing meta description",
      "severity": "high",
      "pillar": "on-page",
      "score_impact": -8,
      "effort": "Low",
      "fix": "Add a meta description tag between 150–160 characters..."
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/reports",
    summary: "List all reports",
    description: "Returns a paginated list of all reports generated under your account.",
    request: `GET /api/v1/reports?limit=20&page=1
Authorization: Bearer YOUR_API_KEY`,
    response: `{
  "reports": [
    {
      "id": "scan_01JGH3X2P7",
      "url": "https://example.com",
      "overall_score": 74,
      "created_at": "2025-01-15T10:23:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total_pages": 3,
    "total_count": 47
  }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POST: "bg-blue-50 text-blue-700 border-blue-200",
  DELETE: "bg-rose-50 text-rose-700 border-rose-200",
  PATCH: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      {/* Header */}
      <div className="pt-[76px] border-b border-[#e8e6dc] bg-[#faf9f5]">
        <div className="container-page py-10">
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-3"
          >
            API Reference
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif font-medium text-[36px] sm:text-[44px] leading-[1.1] text-[#141413] mb-3"
          >
            SEO Hub Analyzer REST API
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[15px] text-[#5e5d59] max-w-[40rem]"
          >
            Programmatic access to the forensic scanning engine. Available to Scale plan accounts in beta.
          </motion.p>
        </div>
      </div>

      <div className="container-page py-12 max-w-[900px]">

        {/* Auth */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <h2 className="font-serif font-medium text-[28px] text-[#141413] mb-4">Authentication</h2>
          <p className="text-[15px] leading-[1.75] text-[#5e5d59] mb-6">
            All API requests require a Bearer token in the Authorization header. 
            Retrieve your API key from your account dashboard under Settings → API Keys.
          </p>
          <CodeBlock language="bash" code={`curl -X POST https://api.seohubanalyzer.com/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`} />
        </motion.section>

        {/* Rate limits */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <h2 className="font-serif font-medium text-[28px] text-[#141413] mb-4">Rate Limits</h2>
          <div className="rounded-[16px] border border-[#e8e6dc] bg-white overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[#e8e6dc] bg-[#faf9f5]">
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#87867f] font-semibold">Plan</th>
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#87867f] font-semibold">Scans/month</th>
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#87867f] font-semibold">Requests/min</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Pro", "50", "10"],
                  ["Scale", "100", "30"],
                  ["Enterprise", "Custom", "Custom"],
                ].map(([plan, scans, rpm]) => (
                  <tr key={plan} className="border-b border-[#f0eee6] last:border-0">
                    <td className="px-5 py-3.5 font-medium text-[#141413]">{plan}</td>
                    <td className="px-5 py-3.5 text-[#5e5d59]">{scans}</td>
                    <td className="px-5 py-3.5 text-[#5e5d59]">{rpm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Endpoints */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="font-serif font-medium text-[28px] text-[#141413] mb-8">Endpoints</h2>
          <div className="space-y-10">
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05}
                className="rounded-[20px] border border-[#e8e6dc] bg-white overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-[#e8e6dc]">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${methodColors[ep.method]}`}>
                      {ep.method}
                    </span>
                    <code className="font-mono text-[14px] text-[#141413]">{ep.path}</code>
                  </div>
                  <p className="text-[15px] font-medium text-[#141413] mb-1">{ep.summary}</p>
                  <p className="text-[13px] text-[#5e5d59] leading-[1.65]">{ep.description}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#87867f] mb-3">Request</p>
                    <CodeBlock language="http" code={ep.request} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#87867f] mb-3">Response</p>
                    <CodeBlock language="json" code={ep.response} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>

      <Footer />
    </div>
  );
}
