import { Check, Info, FileText, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Start with a free website SEO analysis.",
    features: ["5 reports lifetime", "Partial report access", "Mobile & desktop preview", "AI summary preview", "Watermarked PDF export"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For regular website SEO analysis.",
    features: ["50 reports / month", "Full forensic SEO analysis", "Complete report unlock", "Premium PDF exports", "AI remediation prompts", "Performance analysis", "Historical tracking"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Scale",
    price: "$99",
    period: "/month",
    desc: "For teams with ongoing analysis needs.",
    features: ["100 reports / month", "Full site crawling", "Team workspace", "White-label PDF exports", "Advanced AI exports", "Priority support", "Advanced dashboard"],
    cta: "Start Scale",
    highlight: false,
  },
];

const faqs = [
  {
    q: "What are Core Web Vitals?",
    a: "Core Web Vitals are Google's user-experience metrics for loading (LCP), interaction responsiveness (INP) and visual stability (CLS). The performance view here uses available Lighthouse lab data, not real-user field measurements.",
  },
  {
    q: "How do Core Web Vitals affect SEO?",
    a: "Core Web Vitals are part of Google's page-experience signals, but they are not the only factor that determines search rankings. Content relevance and many other signals also matter.",
  },
  {
    q: "How can I improve Core Web Vitals?",
    a: "Start with the specific LCP, INP or CLS opportunities in your report, then test changes. SEO Hub Analyzer highlights issues and recommendations; it does not automatically change your website.",
  },
  {
    q: "What does a Google SEO audit check?",
    a: "This analyzer reviews available page titles, meta descriptions, headings, link structure, canonical and robots directives, structured data, image alt attributes and performance signals. It does not replace Google Search Console.",
  },
  {
    q: "What is an AI SEO analyzer?",
    a: "An AI SEO analyzer combines website checks with AI-assisted summaries or recommendations to help explain findings. Recommendations are guidance, not a guarantee of ranking improvements.",
  },
  {
    q: "How does a website SEO analyzer work?",
    a: "Submit a page URL to generate an SEO report. Review the detected on-page and technical signals alongside available mobile and desktop PageSpeed Insights results.",
  },
  {
    q: "What does a technical SEO audit include?",
    a: "The report can include page metadata, heading structure, links, canonical and robots signals, structured data, image alt attributes and performance diagnostics.",
  },
  {
    q: "How can I identify website SEO issues?",
    a: "Run an analysis and review each finding's evidence, affected page and recommended next step. Validate important changes on your site after implementation.",
  },
  {
    q: "Can I analyze mobile and desktop website performance?",
    a: "Yes. The analyzer requests PageSpeed Insights results for mobile and desktop. These Lighthouse results are simulated lab measurements, not CrUX or other real-user field data.",
  },
  {
    q: "How can I track Core Web Vitals for SEO success?",
    a: "Compare reports over time where your plan provides report history. For real-user Core Web Vitals trends, use Google Search Console or CrUX field data alongside lab testing.",
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="bg-[#faf9f5] py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8e6dc_1px,transparent_1px),linear-gradient(to_bottom,#e8e6dc_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="container-page relative z-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#87867f]">
            SIMPLE, TRANSPARENT PRICING
          </p>
          <h2 className="text-[42px] leading-[1.1] tracking-tight font-serif font-medium text-[#141413] sm:text-[56px]">
            The Right SEO Analysis Plan for Every Website.
          </h2>
          <p className="mt-6 text-[18px] leading-[1.6] text-[#5e5d59]">
            Start with free website SEO audits, explore performance insights and
            choose a plan that fits your website analysis needs.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-[1000px] gap-6 sm:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delayMs={i * 100}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative flex h-full flex-col rounded-[16px] border bg-[#ffffff] p-8 ${
                  t.highlight
                    ? "border-[#c96442] shadow-[0_8px_32px_rgba(201,100,66,0.15),0_0_0_1px_#c96442]"
                    : "border-[#e8e6dc] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
                }`}
              >
                {t.highlight && (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-3 left-8 rounded-[8px] bg-[#c96442] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#faf9f5] shadow-sm"
                  >
                    Featured plan
                  </motion.span>
                )}
                <h3 className="font-serif text-[28px] font-medium text-[#141413]">{t.name}</h3>
                <p className="mt-2 text-[15px] text-[#5e5d59]">{t.desc}</p>
                <div className="mt-6 flex items-baseline gap-1 border-b border-[#f0eee6] pb-6">
                  <span className="text-[48px] font-serif font-medium leading-none text-[#141413]">{t.price}</span>
                  <span className="text-[15px] text-[#87867f]">{t.period}</span>
                </div>
                <ul className="mt-6 space-y-4 flex-1">
                  {t.features.map((f, j) => (
                    <motion.li 
                      key={f} 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (j * 0.1) }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 text-[14px] text-[#4d4c48]"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c96442]" />
                      <span>{f}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#hero"
                  className={`mt-10 inline-flex h-12 w-full items-center justify-center rounded-[8px] text-[15px] font-medium transition-colors ${
                    t.highlight
                      ? "bg-[#c96442] text-[#faf9f5] hover:bg-[#d97757] shadow-[0_0_0_1px_#c96442]"
                      : "bg-[#e8e6dc] text-[#4d4c48] hover:bg-[#d1cfc5] shadow-[0_0_0_1px_#d1cfc5]"
                  }`}
                >
                  {t.cta}
                </motion.a>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Sample Report CTA */}
        <Reveal delayMs={400}>
          <div className="mt-20 mx-auto max-w-[800px] bg-white border border-[#e8e6dc] rounded-[24px] p-10 text-center shadow-sm">
            <FileText className="w-12 h-12 text-[#c96442] mx-auto mb-4" />
            <h3 className="text-[28px] font-serif font-semibold mb-3">See exactly what you'll get.</h3>
            <p className="text-[#5e5d59] text-[16px] mb-8 max-w-lg mx-auto">
              Not sure yet? View our interactive sample report to experience the depth of our Pro technical analysis.
            </p>
            <Link to="/sample-report" className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-8 bg-[#141413] text-white hover:bg-[#30302e] transition-colors text-[15px] font-medium">
              View Sample Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        {/* Practical value */}
        <Reveal delayMs={200}>
           <div className="mt-32 max-w-4xl mx-auto border-t border-[#e8e6dc] pt-20">
              <h2 className="text-center text-[32px] font-serif font-medium mb-5">
                Turn Website SEO Data Into Better Decisions.
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-center text-[16px] leading-[1.6] text-[#5e5d59]">
                Understand your website&apos;s technical health, identify
                optimization opportunities and prioritize the work that can
                improve performance and search visibility.
              </p>
              <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                 <div>
                   <h3 className="font-serif text-[22px] font-medium text-[#141413]">Understand technical health</h3>
                   <p className="mt-3 text-[14px] leading-[1.6] text-[#5e5d59]">Review page-level SEO signals and the evidence behind reported issues.</p>
                 </div>
                 <div>
                   <h3 className="font-serif text-[22px] font-medium text-[#141413]">Evaluate performance</h3>
                   <p className="mt-3 text-[14px] leading-[1.6] text-[#5e5d59]">Compare available PageSpeed Insights lab results for mobile and desktop.</p>
                 </div>
                 <div>
                   <h3 className="font-serif text-[22px] font-medium text-[#141413]">Prioritize next steps</h3>
                   <p className="mt-3 text-[14px] leading-[1.6] text-[#5e5d59]">Use severity and recommendations to plan your website improvements.</p>
                 </div>
              </div>
           </div>
        </Reveal>

        {/* FAQ Section */}
        <Reveal delayMs={300}>
          <div className="mt-32 max-w-3xl mx-auto">
            <h2 className="text-[32px] font-serif font-medium mb-8 text-center">
              Frequently Asked Questions About Website SEO Audits and Core Web Vitals
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b-[#e8e6dc]">
                  <AccordionTrigger className="text-[16px] text-left hover:no-underline hover:text-[#c96442] font-medium py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#5e5d59] text-[15px] leading-relaxed pb-6">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>

      </div>
    </section>
  );
};

export default Pricing;