
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  FileSearch,
  Gauge,
  Layers3,
  Search,
  ShieldCheck,
  Target,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "@/components/seohub/Footer";
import MetaTags from "@/seo/MetaTags";
import { PAGE_META } from "@/seo/pageMeta";
import { organizationSchema } from "@/seo/schemas";

/* -------------------------------------------------------------------------- */
/* Animation                                                                  */
/* -------------------------------------------------------------------------- */

const ease = [0.22, 1, 0.36, 1] as [
  number,
  number,
  number,
  number
];

const reveal = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease,
    },
  },
};

const stagger = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

const capabilities = [
  {
    number: "01",
    icon: FileSearch,
    title: "Technical SEO",
    description:
      "Understand the technical foundations behind your website's search visibility. Examine crawlability, indexability, page structure, metadata, and technical signals that deserve attention.",
    tags: ["Crawlability", "Indexing", "Site structure"],
  },
  {
    number: "02",
    icon: Gauge,
    title: "Performance analysis",
    description:
      "Understand how performance affects the experience of using your website. Review available PageSpeed and Core Web Vitals data to identify potential bottlenecks.",
    tags: ["Core Web Vitals", "PageSpeed", "Performance"],
  },
  {
    number: "03",
    icon: Search,
    title: "On-page intelligence",
    description:
      "Review the elements that communicate page relevance and structure, including titles, descriptions, headings, links, and content organization.",
    tags: ["Metadata", "Content structure", "Page signals"],
  },
  {
    number: "04",
    icon: Code2,
    title: "Actionable remediation",
    description:
      "Turn audit findings into understandable next steps. Use practical recommendations and AI-assisted prompts to help developers investigate and address issues.",
    tags: ["Recommendations", "Developer workflow", "AI assistance"],
  },
];

const workflow = [
  {
    number: "01",
    label: "Discovery",
    title: "Start with a website URL.",
    description:
      "Submit the website you want to understand. The audit begins by examining the available website and page-level signals.",
  },
  {
    number: "02",
    label: "Analysis",
    title: "Understand what the data reveals.",
    description:
      "Review technical SEO, on-page structure, and performance indicators in one organized analysis.",
  },
  {
    number: "03",
    label: "Action",
    title: "Move from findings to improvements.",
    description:
      "Explore the recommendations, understand their implications, and prioritize the work that matters to your website.",
  },
];

const principles = [
  {
    number: "01",
    title: "Evidence before assumptions",
    description:
      "A useful audit should distinguish measured information from estimates, unavailable data, and areas that need further investigation.",
  },
  {
    number: "02",
    title: "Clarity over complexity",
    description:
      "Technical findings should be understandable to the people making decisions, not hidden behind unexplained scores and jargon.",
  },
  {
    number: "03",
    title: "Recommendations that lead somewhere",
    description:
      "An audit is only the beginning. Findings should help teams identify priorities and determine what to investigate or improve next.",
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function About() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#faf9f5] text-[#171715] selection:bg-[#c96442]/20 selection:text-[#a94f31]">
      <MetaTags
        title={PAGE_META.about.title}
        description={PAGE_META.about.description}
        canonical={PAGE_META.about.canonical}
        schema={organizationSchema}
      />

      <main className="pt-[76px]">

        {/* ---------------------------------------------------------------- */}
        {/* HERO                                                             */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative border-b border-[#e7e5dc]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-12 lg:py-32">

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div
                variants={reveal}
                className="mb-8 flex items-center gap-3"
              >
                <span className="h-px w-9 bg-[#c96442]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#78766e]">
                  About SEO Hub Analyzer
                </span>
              </motion.div>

              <motion.h1
                variants={reveal}
                className="max-w-[760px] font-serif text-[43px] font-medium leading-[1.08] tracking-[-0.045em] text-[#171715] sm:text-[56px] lg:text-[68px] xl:text-[76px]"
              >
                Better SEO decisions start with{" "}
                <span className="text-[#c96442]">
                  better insight.
                </span>
              </motion.h1>

              <motion.p
                variants={reveal}
                className="mt-8 max-w-[590px] text-[16px] leading-[1.9] text-[#66645d] sm:text-[18px]"
              >
                SEO Hub Analyzer helps website owners, developers, and SEO
                professionals understand the technical and performance
                factors behind their websites, uncover opportunities, and
                turn audit findings into meaningful improvements.
              </motion.p>

              <motion.div
                variants={reveal}
                className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#c96442] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#ad5436]"
                >
                  Analyze your website
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/sample-report"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#d9d6cc] px-6 text-[13px] font-semibold text-[#34332f] transition-colors hover:border-[#c96442] hover:text-[#c96442]"
                >
                  Explore a sample report
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div
                variants={reveal}
                className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#e7e5dc] pt-6"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.13em] text-[#858279]">
                  Designed for
                </span>

                <span className="text-[13px] font-medium text-[#494740]">
                  Developers
                </span>

                <span className="h-1 w-1 rounded-full bg-[#c96442]" />

                <span className="text-[13px] font-medium text-[#494740]">
                  SEO teams
                </span>

                <span className="h-1 w-1 rounded-full bg-[#c96442]" />

                <span className="text-[13px] font-medium text-[#494740]">
                  Website owners
                </span>
              </motion.div>
            </motion.div>

            {/* Product illustration */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease }}
              className="relative mx-auto w-full max-w-[550px] lg:ml-auto"
            >
              <div className="relative overflow-hidden rounded-lg border border-[#33322e] bg-[#191916] p-5 text-[#f7f5ee] shadow-[0_28px_80px_rgba(25,25,22,0.15)] sm:p-7">

                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b5b0a2]">
                      SEO Hub Analyzer
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      Website analysis
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d18a64]" />

                    <span className="text-[10px] text-[#d5d0c5]">
                      Analysis overview
                    </span>
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#928e82]">
                    An audit is more than a score.
                  </p>

                  <h2 className="mt-3 max-w-[360px] font-serif text-[27px] leading-[1.2] text-[#f8f6ef] sm:text-[34px]">
                    Understand the details behind your website.
                  </h2>
                </div>

                <div className="mt-8 space-y-3">

                  {[
                    {
                      icon: Search,
                      title: "Technical SEO",
                      detail: "Structure and indexability signals",
                      index: "01",
                    },
                    {
                      icon: Gauge,
                      title: "Website performance",
                      detail: "Performance and experience indicators",
                      index: "02",
                    },
                    {
                      icon: Layers3,
                      title: "On-page analysis",
                      detail: "Metadata and content structure",
                      index: "03",
                    },
                    {
                      icon: Workflow,
                      title: "Improvement workflow",
                      detail: "Findings and practical next steps",
                      index: "04",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.index}
                        className="group flex items-center gap-4 border border-white/10 bg-white/[0.035] px-4 py-4 transition-colors hover:border-[#c96442]/60 hover:bg-white/[0.065]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 text-[#d18a64]">
                          <Icon className="h-[17px] w-[17px]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#f5f2e9]">
                            {item.title}
                          </p>

                          <p className="mt-1 text-[11px] text-[#a29e91]">
                            {item.detail}
                          </p>
                        </div>

                        <span className="text-[11px] tabular-nums text-[#817d72]">
                          {item.index}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-[11px] text-[#a29e91]">
                    From analysis to action
                  </span>

                  <span className="inline-flex items-center gap-2 text-[11px] font-medium text-[#d18a64]">
                    Explore the platform
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-5 -right-3 -z-10 hidden h-32 w-32 border border-[#d8d4c8] sm:block" />
              <div className="absolute -left-5 -top-5 -z-10 hidden h-24 w-24 border border-[#d8d4c8] sm:block" />
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* BRAND POSITIONING                                                */}
        {/* ---------------------------------------------------------------- */}

        <section className="bg-[#f0eee6]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-12 lg:py-32">

            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c96442]">
                Why we exist
              </span>

              <div className="mt-6 h-px w-16 bg-[#c96442]" />
            </div>

            <div>
              <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={reveal}
                className="max-w-[900px] font-serif text-[34px] font-medium leading-[1.2] tracking-[-0.025em] text-[#171715] sm:text-[42px] lg:text-[53px]"
              >
                An audit should explain what is happening, why it matters,
                and what to do next.
              </motion.h2>

              <div className="mt-10 grid gap-8 border-t border-[#d9d6cc] pt-8 md:grid-cols-2 md:gap-12">

                <p className="text-[15px] leading-[1.9] text-[#626057]">
                  Website audits often produce long lists of warnings,
                  numbers, and technical terminology. But identifying an
                  issue is only one part of the work. Understanding its
                  relevance and deciding how to address it takes a different
                  level of clarity.
                </p>

                <p className="text-[15px] leading-[1.9] text-[#626057]">
                  We built SEO Hub Analyzer around that distinction. Our
                  focus is to bring relevant website signals together,
                  make technical findings easier to interpret, and give
                  teams a more structured starting point for improving
                  their websites.
                </p>

              </div>

              <div className="mt-12 border-l-[3px] border-[#c96442] py-2 pl-6">
                <p className="font-serif text-[23px] leading-[1.45] text-[#292823] sm:text-[27px]">
                  Better visibility begins with understanding the website
                  behind the search result.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* PLATFORM CAPABILITIES                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32">

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

            <div className="lg:sticky lg:top-32 lg:h-fit">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c96442]">
                The platform
              </span>

              <h2 className="mt-5 max-w-[430px] font-serif text-[39px] font-medium leading-[1.12] tracking-[-0.035em] sm:text-[48px]">
                A clearer view of website performance.
              </h2>

              <p className="mt-6 max-w-[390px] text-[15px] leading-[1.9] text-[#6c6961]">
                Search performance is influenced by more than one factor.
                The platform brings different parts of website analysis
                into a connected workflow.
              </p>

              <Link
                to="/sample-report"
                className="mt-8 inline-flex items-center gap-2 border-b border-[#c96442] pb-1 text-[13px] font-semibold text-[#ad5436] transition-colors hover:text-[#171715]"
              >
                See how an audit is presented
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="border-t border-[#dcd9cf]">

              {capabilities.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.number}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={reveal}
                    className="grid grid-cols-[42px_1fr] gap-4 border-b border-[#dcd9cf] py-8 sm:grid-cols-[58px_1fr] sm:gap-7 sm:py-10"
                  >
                    <div>
                      <span className="font-mono text-[12px] text-[#a19d91]">
                        {item.number}
                      </span>

                      <Icon className="mt-6 h-5 w-5 text-[#c96442]" />
                    </div>

                    <div>
                      <h3 className="font-serif text-[25px] font-medium tracking-[-0.02em] text-[#171715] sm:text-[30px]">
                        {item.title}
                      </h3>

                      <p className="mt-3 max-w-[620px] text-[14px] leading-[1.9] text-[#69675f] sm:text-[15px]">
                        {item.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#969287]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* WORKFLOW                                                          */}
        {/* ---------------------------------------------------------------- */}

        <section className="border-y border-[#e5e2d8] bg-white">
          <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32">

            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c96442]">
                  How it works
                </span>

                <h2 className="mt-5 max-w-[400px] font-serif text-[39px] font-medium leading-[1.12] tracking-[-0.035em] sm:text-[48px]">
                  From a website URL to a clearer action plan.
                </h2>

                <p className="mt-6 max-w-[390px] text-[15px] leading-[1.9] text-[#6c6961]">
                  A structured approach to understanding website issues
                  without losing sight of the people who need to solve them.
                </p>
              </div>

              <div>
                {workflow.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={reveal}
                    className={`grid grid-cols-[54px_1fr] gap-5 py-8 sm:grid-cols-[74px_1fr] sm:gap-8 ${
                      index !== workflow.length - 1
                        ? "border-b border-[#e8e6dc]"
                        : ""
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center border border-[#d9d6cc] font-mono text-[12px] text-[#c96442] sm:h-14 sm:w-14">
                      {step.number}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a19d91]">
                        {step.label}
                      </span>

                      <h3 className="mt-2 font-serif text-[24px] font-medium text-[#171715] sm:text-[29px]">
                        {step.title}
                      </h3>

                      <p className="mt-3 max-w-[560px] text-[14px] leading-[1.85] text-[#69675f]">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* PRINCIPLES                                                        */}
        {/* ---------------------------------------------------------------- */}

        <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32">

          <div className="mb-16 max-w-[690px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c96442]">
              Our approach
            </span>

            <h2 className="mt-5 font-serif text-[38px] font-medium leading-[1.15] tracking-[-0.035em] sm:text-[48px]">
              Built around the quality of the decisions that follow.
            </h2>

            <p className="mt-5 text-[15px] leading-[1.9] text-[#69675f]">
              Technology is useful when it helps people make better
              decisions. These principles shape how we think about
              website analysis.
            </p>
          </div>

          <div className="grid gap-10 border-t border-[#dcd9cf] pt-8 md:grid-cols-3 md:gap-12">

            {principles.map((principle) => (
              <motion.div
                key={principle.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={reveal}
                className="max-w-[360px]"
              >
                <span className="font-mono text-[12px] text-[#c96442]">
                  / {principle.number}
                </span>

                <h3 className="mt-7 font-serif text-[25px] font-medium leading-[1.25] text-[#171715]">
                  {principle.title}
                </h3>

                <p className="mt-4 text-[14px] leading-[1.9] text-[#69675f]">
                  {principle.description}
                </p>
              </motion.div>
            ))}

          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* TRUST / DATA INTEGRITY                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="bg-[#191916] text-[#f7f5ee]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20 lg:px-12 lg:py-28">

            <div>
              <div className="flex h-12 w-12 items-center justify-center border border-white/15 text-[#d18a64]">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <span className="mt-8 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d18a64]">
                A considered approach to analysis
              </span>

              <h2 className="mt-5 max-w-[540px] font-serif text-[36px] font-medium leading-[1.17] tracking-[-0.025em] sm:text-[46px]">
                Understand what the data can tell you.
              </h2>
            </div>

            <div>
              <p className="text-[15px] leading-[1.95] text-[#b7b3a8]">
                Website analysis is most useful when its findings are
                presented with the right context. Measurements,
                recommendations, and unavailable information should not
                be treated as interchangeable.
              </p>

              <p className="mt-6 text-[15px] leading-[1.95] text-[#b7b3a8]">
                Our approach emphasizes understandable findings and
                practical interpretation, helping users make informed
                decisions about their website improvement work.
              </p>

              <div className="mt-9 flex items-center gap-3 border-t border-white/10 pt-7">
                <Target className="h-5 w-5 shrink-0 text-[#d18a64]" />

                <p className="text-[13px] font-medium text-[#e5e1d7]">
                  Useful insights. Clear priorities. Better-informed work.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FINAL CTA                                                         */}
        {/* ---------------------------------------------------------------- */}

        <section className="relative overflow-hidden bg-[#f0eee6]">
          <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-32">

            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">

              <div className="max-w-[760px]">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c96442]">
                  Take the next step
                </span>

                <h2 className="mt-6 font-serif text-[40px] font-medium leading-[1.1] tracking-[-0.035em] sm:text-[54px] lg:text-[64px]">
                  Your website has a story in its data.{" "}
                  <span className="text-[#c96442]">
                    Start understanding it.
                  </span>
                </h2>

                <p className="mt-6 max-w-[600px] text-[15px] leading-[1.9] text-[#69675f] sm:text-[17px]">
                  Explore your website's technical foundations, understand
                  performance signals, and identify opportunities to make
                  informed improvements.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#c96442] px-7 text-[13px] font-semibold text-white transition-colors hover:bg-[#ad5436]"
                >
                  Start your analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/sample-report"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#d4d0c5] px-7 text-[13px] font-semibold text-[#34332f] transition-colors hover:border-[#c96442] hover:text-[#c96442]"
                >
                  View sample report
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
