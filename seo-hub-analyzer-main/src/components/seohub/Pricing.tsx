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
    desc: "Try before committing",
    features: ["5 reports lifetime", "Partial report access", "Mobile & desktop preview", "AI summary preview", "Watermarked PDF export"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For serious optimization",
    features: ["50 reports / month", "Full forensic SEO analysis", "Complete report unlock", "Premium PDF exports", "AI remediation prompts", "Performance analysis", "Historical tracking"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Scale",
    price: "$99",
    period: "/month",
    desc: "For agencies & teams",
    features: ["100 reports / month", "Full site crawling", "Team workspace", "White-label PDF exports", "Advanced AI exports", "Priority support", "Advanced dashboard"],
    cta: "Start Scale",
    highlight: false,
  },
];

const faqs = [
  { q: "Do I need a credit card for the Free plan?", a: "No, you can sign up and generate up to 5 lifetime reports completely free, no credit card required." },
  { q: "Can I upgrade or downgrade anytime?", a: "Yes, you can manage your subscription directly from your dashboard and changes will take effect at the end of your billing cycle." },
  { q: "What is a 'Report'?", a: "A single report consumes 1 credit and analyzes one specific URL for technical SEO, UX, performance, and keyword intelligence." },
  { q: "Are the PDF exports customizable?", a: "Pro users get premium unbranded PDFs. Scale users can upload their own logo to generate fully white-labeled reports for clients." },
];

const Pricing = () => {
  return (
    <section id="pricing" className="bg-[#faf9f5] py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8e6dc_1px,transparent_1px),linear-gradient(to_bottom,#e8e6dc_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="container-page relative z-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-[42px] leading-[1.1] tracking-tight font-serif font-medium text-[#141413] sm:text-[56px]">
            Transparent value.
          </h2>
          <p className="mt-6 text-[18px] leading-[1.6] text-[#5e5d59]">
            Choose the plan that matches your growth. Cancel anytime.
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
                    Most popular
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

        {/* ROI & Social Proof */}
        <Reveal delayMs={200}>
           <div className="mt-32 max-w-4xl mx-auto border-t border-[#e8e6dc] pt-20">
              <h3 className="text-center text-[32px] font-serif font-medium mb-12">The Return on Intelligence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                 <div>
                   <div className="text-[48px] font-bold text-[#c96442] font-serif mb-2">314%</div>
                   <div className="text-[14px] text-[#5e5d59] uppercase tracking-widest">Avg. Traffic Increase</div>
                 </div>
                 <div>
                   <div className="text-[48px] font-bold text-[#c96442] font-serif mb-2">24hrs</div>
                   <div className="text-[14px] text-[#5e5d59] uppercase tracking-widest">To fix critical errors</div>
                 </div>
                 <div>
                   <div className="text-[48px] font-bold text-[#c96442] font-serif mb-2">10x</div>
                   <div className="text-[14px] text-[#5e5d59] uppercase tracking-widest">Faster dev implementation</div>
                 </div>
              </div>
           </div>
        </Reveal>

        {/* FAQ Section */}
        <Reveal delayMs={300}>
          <div className="mt-32 max-w-3xl mx-auto">
            <h3 className="text-[32px] font-serif font-medium mb-8 text-center">Frequently Asked Questions</h3>
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