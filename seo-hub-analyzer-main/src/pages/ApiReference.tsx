
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Copy,
  FileCode2,
  KeyRound,
  Lock,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "@/components/seohub/Footer";

/* -------------------------------------------------------------------------- */
/* Animation                                                                  */
/* -------------------------------------------------------------------------- */

const ease = [0.22, 1, 0.36, 1] as [
  number,
  number,
  number,
  number
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease,
    },
  },
};

/* -------------------------------------------------------------------------- */
/* API Data                                                                   */
/* -------------------------------------------------------------------------- */

interface Endpoint {
  id: string;
  method: "GET" | "POST" | "DELETE" | "PATCH";
  path: string;
  summary: string;
  description: string;
  request: string;
  response: string;
}

const endpoints: Endpoint[] = [
  {
    id: "create-scan",
    method: "POST",
    path: "/api/v1/scan",
    summary: "Trigger a new SEO scan",
    description:
      "Initiates a scan for the provided website URL. The API returns a job identifier that can be used to retrieve the scan status and results.",
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
    id: "scan-results",
    method: "GET",
    path: "/api/v1/scan/:job_id",
    summary: "Get scan results",
    description:
      "Retrieves the processing status and available results for a previously submitted scan. Poll this endpoint until the status is complete.",
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
    id: "scan-issues",
    method: "GET",
    path: "/api/v1/scan/:job_id/issues",
    summary: "List scan issues",
    description:
      "Returns the detected issues associated with a scan, including severity, classification, estimated impact, and remediation guidance.",
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
    id: "list-reports",
    method: "GET",
    path: "/api/v1/reports",
    summary: "List generated reports",
    description:
      "Returns a paginated list of reports generated under your account.",
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

const methodStyles: Record<
  Endpoint["method"],
  string
> = {
  GET: "bg-emerald-50 text-emerald-800 border-emerald-200",
  POST: "bg-blue-50 text-blue-800 border-blue-200",
  DELETE: "bg-rose-50 text-rose-800 border-rose-200",
  PATCH: "bg-amber-50 text-amber-800 border-amber-200",
};

const rateLimits = [
  {
    plan: "Pro",
    scans: "50",
    requests: "10",
  },
  {
    plan: "Scale",
    scans: "100",
    requests: "30",
  },
  {
    plan: "Enterprise",
    scans: "Custom",
    requests: "Custom",
  },
];

/* -------------------------------------------------------------------------- */
/* Code Block                                                                 */
/* -------------------------------------------------------------------------- */

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({
  code,
  language = "text",
}: CodeBlockProps) {
  const [copyState, setCopyState] = useState<
    "idle" | "copied" | "error"
  >("idle");

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(code);

      setCopyState("copied");
    } catch (error) {
      console.error("Unable to copy code:", error);
      setCopyState("error");
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopyState("idle");
    }, 2200);
  };

  return (
    <div className="group overflow-hidden rounded-lg border border-[#30302e] bg-[#181816]">

      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-5">

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#c96442]" />
            <span className="h-2 w-2 rounded-full bg-[#b5a16c]" />
            <span className="h-2 w-2 rounded-full bg-[#748a70]" />
          </div>

          <span className="ml-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#969287]">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={
            copyState === "copied"
              ? "Code copied"
              : "Copy code"
          }
          className="inline-flex min-h-8 items-center gap-2 rounded-md px-2.5 text-[11px] font-medium text-[#aaa79e] transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]"
        >
          {copyState === "copied" ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : copyState === "error" ? (
            <Copy className="h-3.5 w-3.5 text-rose-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}

          {copyState === "copied"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy"}
        </button>
      </div>

      <pre className="max-w-full overflow-x-auto p-4 text-[12px] leading-[1.85] text-[#e4e1d8] sm:p-5 sm:text-[13px]">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Method Badge                                                               */
/* -------------------------------------------------------------------------- */

function MethodBadge({
  method,
}: {
  method: Endpoint["method"];
}) {
  return (
    <span
      className={`inline-flex min-w-[58px] justify-center rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-wide ${methodStyles[method]}`}
    >
      {method}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Heading                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#c96442]">
        {eyebrow}
      </p>

      <h2 className="font-serif text-[29px] font-medium leading-tight tracking-[-0.025em] text-[#171715] sm:text-[34px]">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-[650px] text-[14px] leading-[1.85] text-[#69675f] sm:text-[15px]">
          {description}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Endpoint Component                                                         */
/* -------------------------------------------------------------------------- */

function EndpointCard({
  endpoint,
}: {
  endpoint: Endpoint;
}) {
  return (
    <motion.section
      id={endpoint.id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={fadeUp}
      className="scroll-mt-28 overflow-hidden rounded-lg border border-[#e4e1d8] bg-white"
    >

      {/* Endpoint header */}
      <div className="border-b border-[#e8e6dc] px-5 py-6 sm:px-7">

        <div className="flex flex-wrap items-center gap-3">
          <MethodBadge method={endpoint.method} />

          <code className="break-all font-mono text-[12px] font-medium text-[#282722] sm:text-[14px]">
            {endpoint.path}
          </code>
        </div>

        <h3 className="mt-5 font-serif text-[23px] font-medium text-[#171715] sm:text-[26px]">
          {endpoint.summary}
        </h3>

        <p className="mt-2 max-w-[690px] text-[13px] leading-[1.8] text-[#77746c] sm:text-[14px]">
          {endpoint.description}
        </p>

      </div>

      {/* Request / Response */}
      <div className="grid min-w-0 gap-7 p-5 sm:p-7">

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#c96442]" />

              <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#514f48]">
                Request
              </h4>
            </div>

            <span className="text-[10px] text-[#9a968b]">
              Example
            </span>
          </div>

          <CodeBlock
            language="http"
            code={endpoint.request}
          />
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#c96442]" />

              <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#514f48]">
                Response
              </h4>
            </div>

            <span className="text-[10px] text-[#9a968b]">
              Example JSON
            </span>
          </div>

          <CodeBlock
            language="json"
            code={endpoint.response}
          />
        </div>

      </div>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function ApiReference() {
  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans text-[#171715]">

      {/* ================================================================ */}
      {/* HEADER                                                           */}
      {/* ================================================================ */}

      <header className="border-b border-[#e5e2d8] bg-[#faf9f5] pt-[76px]">

        <div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.div variants={fadeUp}>
              <Link
                to="/docs"
                className="mb-9 inline-flex items-center gap-2 text-[12px] font-medium text-[#77746c] transition-colors hover:text-[#c96442]"
              >
                Documentation
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-[#c96442]">
                  API Reference
                </span>
              </Link>
            </motion.div>

            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">

              <div>
                <motion.div
                  variants={fadeUp}
                  className="mb-6 flex flex-wrap items-center gap-3"
                >
                  <span className="inline-flex items-center gap-2 border border-[#e3d0c4] bg-[#f5ece6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a65335]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c96442]" />
                    Developer resources
                  </span>

                  <span className="text-[11px] text-[#89867d]">
                    REST API
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="max-w-[850px] font-serif text-[40px] font-medium leading-[1.1] tracking-[-0.04em] text-[#171715] sm:text-[54px] lg:text-[64px]"
                >
                  Build with the{" "}
                  <span className="text-[#c96442]">
                    SEO Hub API.
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-7 max-w-[680px] text-[15px] leading-[1.9] text-[#69675f] sm:text-[17px]"
                >
                  Explore the API authentication process, available
                  endpoints, request formats, and example responses
                  for programmatic access to SEO Hub Analyzer.
                </motion.p>
              </div>

              <motion.div
                variants={fadeUp}
                className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start"
              >
                <Link
                  to="/pricing"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#c96442] px-5 text-[12px] font-semibold text-white transition-colors hover:bg-[#ac5437]"
                >
                  Explore plans
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/support"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d9d6cc] px-5 text-[12px] font-semibold text-[#494740] transition-colors hover:border-[#c96442] hover:text-[#c96442]"
                >
                  Contact support
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </header>

      {/* ================================================================ */}
      {/* DOCUMENTATION LAYOUT                                             */}
      {/* ================================================================ */}

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-16">

        {/* ============================================================ */}
        {/* SIDEBAR                                                      */}
        {/* ============================================================ */}

        <aside className="min-w-0">

          <div className="lg:sticky lg:top-28">

            <div className="mb-8 border-b border-[#e5e2d8] pb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#99958a]">
                Documentation
              </p>

              <h2 className="mt-3 text-[14px] font-semibold text-[#272620]">
                API Reference
              </h2>
            </div>

            <nav
              aria-label="API documentation sections"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0"
            >
              {[
                {
                  label: "Authentication",
                  href: "#authentication",
                },
                {
                  label: "Rate limits",
                  href: "#rate-limits",
                },
                {
                  label: "Endpoints",
                  href: "#endpoints",
                },
                ...endpoints.map((endpoint) => ({
                  label: endpoint.summary,
                  href: `#${endpoint.id}`,
                })),
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-9 items-center justify-between gap-2 rounded-md px-3 py-2 text-[12px] text-[#77746c] transition-colors hover:bg-[#f0eee6] hover:text-[#c96442] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442] lg:rounded-none lg:border-l lg:border-[#e5e2d8] lg:py-2.5"
                >
                  <span>{item.label}</span>

                  <ChevronRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </nav>

            {/* Access notice */}
            <div className="mt-8 hidden border border-[#e5e2d8] bg-white p-4 lg:block">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#c96442]" />

                <span className="text-[11px] font-semibold text-[#35332e]">
                  API access
                </span>
              </div>

              <p className="mt-3 text-[11px] leading-[1.8] text-[#77746c]">
                API access is currently described as available
                to Scale plan accounts in beta.
              </p>

              <Link
                to="/pricing"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c96442] hover:text-[#a94f31]"
              >
                View plans
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN DOCUMENTATION                                          */}
        {/* ============================================================ */}

        <main className="min-w-0 space-y-16">

          {/* ======================================================== */}
          {/* INTRODUCTION                                             */}
          {/* ======================================================== */}

          <section
            id="introduction"
            className="scroll-mt-28"
          >
            <div className="flex items-start gap-4 border border-[#e5e2d8] bg-white p-5 sm:p-7">

              <div className="hidden h-11 w-11 shrink-0 items-center justify-center bg-[#f5ece6] text-[#c96442] sm:flex">
                <FileCode2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-serif text-[22px] font-medium text-[#171715]">
                  Getting started
                </h2>

                <p className="mt-3 text-[13px] leading-[1.9] text-[#69675f] sm:text-[14px]">
                  The SEO Hub Analyzer REST API provides a programmatic
                  interface for submitting scans, retrieving scan
                  results, inspecting issues, and listing generated
                  reports.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#eeeae1] pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9a968b]">
                      Protocol
                    </p>

                    <p className="mt-1 text-[12px] font-semibold text-[#494740]">
                      HTTPS
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9a968b]">
                      Format
                    </p>

                    <p className="mt-1 text-[12px] font-semibold text-[#494740]">
                      JSON
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9a968b]">
                      Authentication
                    </p>

                    <p className="mt-1 text-[12px] font-semibold text-[#494740]">
                      Bearer token
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ======================================================== */}
          {/* AUTHENTICATION                                           */}
          {/* ======================================================== */}

          <section
            id="authentication"
            className="scroll-mt-28"
          >
            <SectionHeading
              eyebrow="01 / Authentication"
              title="Authenticate your requests"
              description="Every API request requires an API key supplied through the Authorization header."
            />

            <div className="mb-5 flex gap-4 border-l-[3px] border-[#c96442] bg-[#f1eee6] p-4 sm:p-5">
              <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-[#c96442]" />

              <div>
                <p className="text-[13px] font-semibold text-[#33312c]">
                  API key management
                </p>

                <p className="mt-1 text-[12px] leading-[1.8] text-[#69675f]">
                  The supplied documentation describes API keys
                  as being available from your account dashboard
                  under Settings → API Keys.
                </p>
              </div>
            </div>

            <CodeBlock
              language="bash"
              code={`curl -X POST https://api.seohubanalyzer.com/api/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "depth": "full",
    "include_ai_remediation": true
  }'`}
            />

            <div className="mt-5 flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#8c887d]" />

              <p className="text-[12px] leading-[1.8] text-[#77746c]">
                Keep API keys on your server. Never expose secret
                credentials in browser JavaScript, public repositories,
                or client-side environment variables.
              </p>
            </div>
          </section>

          {/* ======================================================== */}
          {/* RATE LIMITS                                              */}
          {/* ======================================================== */}

          <section
            id="rate-limits"
            className="scroll-mt-28"
          >
            <SectionHeading
              eyebrow="02 / Usage"
              title="Rate limits"
              description="The supplied plan reference lists the following scan allowances and request limits."
            />

            {/* Desktop table */}
            <div className="hidden overflow-hidden border border-[#e5e2d8] bg-white md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#e5e2d8] bg-[#f4f2eb]">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#79766e]">
                      Subscription
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#79766e]">
                      Scans / month
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#79766e]">
                      Requests / minute
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rateLimits.map((plan) => (
                    <tr
                      key={plan.plan}
                      className="border-b border-[#eeeae1] last:border-0 transition-colors hover:bg-[#faf9f5]"
                    >
                      <td className="px-6 py-5 text-[13px] font-semibold text-[#272620]">
                        {plan.plan}
                      </td>

                      <td className="px-6 py-5 font-mono text-[13px] text-[#59574f]">
                        {plan.scans}
                      </td>

                      <td className="px-6 py-5 font-mono text-[13px] text-[#59574f]">
                        {plan.requests}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
              {rateLimits.map((plan) => (
                <div
                  key={plan.plan}
                  className="border border-[#e5e2d8] bg-white p-5"
                >
                  <h3 className="text-[14px] font-semibold text-[#272620]">
                    {plan.plan}
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#99958a]">
                        Scans / month
                      </p>

                      <p className="mt-2 font-mono text-[18px] text-[#34322c]">
                        {plan.scans}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#99958a]">
                        Requests / min
                      </p>

                      <p className="mt-2 font-mono text-[18px] text-[#34322c]">
                        {plan.requests}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* ENDPOINT DIRECTORY                                       */}
          {/* ======================================================== */}

          <section
            id="endpoints"
            className="scroll-mt-28"
          >
            <div className="mb-8">
              <SectionHeading
                eyebrow="03 / API endpoints"
                title="Available endpoints"
                description="Browse the documented API methods and their request and response examples."
              />

              <div className="border-y border-[#e5e2d8] bg-white">
                {endpoints.map((endpoint, index) => (
                  <a
                    key={endpoint.id}
                    href={`#${endpoint.id}`}
                    className="group flex min-w-0 items-center gap-3 border-b border-[#eeeae1] px-4 py-4 last:border-0 transition-colors hover:bg-[#faf9f5] sm:px-5"
                  >
                    <MethodBadge method={endpoint.method} />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[11px] text-[#494740] sm:text-[12px]">
                        {endpoint.path}
                      </span>

                      <span className="mt-1 block truncate text-[11px] text-[#929087]">
                        {endpoint.summary}
                      </span>
                    </span>

                    <span className="hidden font-mono text-[10px] text-[#aaa69b] sm:block">
                      0{index + 1}
                    </span>

                    <ChevronRight className="h-4 w-4 shrink-0 text-[#aaa69b] transition-transform group-hover:translate-x-1 group-hover:text-[#c96442]" />
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-7">
              {endpoints.map((endpoint) => (
                <EndpointCard
                  key={endpoint.id}
                  endpoint={endpoint}
                />
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* SUPPORT                                                  */}
          {/* ======================================================== */}

          <section className="border border-[#30302e] bg-[#191916] p-6 text-[#faf9f5] sm:p-8">

            <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">

              <div className="max-w-[520px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d18a64]">
                  Need assistance?
                </p>

                <h2 className="mt-4 font-serif text-[26px] font-medium leading-tight sm:text-[30px]">
                  Building an integration?
                </h2>

                <p className="mt-3 text-[13px] leading-[1.8] text-[#aaa79e]">
                  Contact the support team for questions about API access,
                  authentication, or integration requirements.
                </p>
              </div>

              <Link
                to="/support"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[#c96442] px-5 text-[12px] font-semibold text-white transition-colors hover:bg-[#ad5436]"
              >
                Contact support
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>
          </section>

        </main>
      </div>

      {/* ================================================================ */}
      {/* FOOTER                                                           */}
      {/* ================================================================ */}

      <Footer />
    </div>
  );
}
