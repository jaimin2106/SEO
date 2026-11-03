import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import Footer from "@/components/seohub/Footer";
import { useAuth } from "@/contexts/AuthContext";
import MetaTags from "@/seo/MetaTags";
import { PAGE_META } from "@/seo/pageMeta";
import { buildFaqSchema } from "@/seo/schemas";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: EASE }
  })
} as const;


const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    tagline: "For teams just getting started.",
    popular: false,
    cta: "Start for free",
    ctaVariant: "outline" as const,
    features: [
      "5 reports — lifetime",
      "Core SEO audit",
      "Mobile + desktop preview",
      "Technical issue detection",
      "Overall health score",
    ],
    missing: ["AI remediation", "PDF exports", "Keyword intelligence", "Historical tracking"]
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    tagline: "For individuals and growing teams.",
    popular: true,
    cta: "Upgrade to Pro",
    ctaVariant: "primary" as const,
    features: [
      "50 reports per month",
      "Full forensic crawl (no depth limits)",
      "AI-powered fixes & code snippets",
      "Performance analysis & Core Web Vitals",
      "Keyword intelligence data",
      "Branded PDF report exports",
      "Email report delivery",
      "Priority issue queue",
    ],
    missing: ["Team workspace", "Historical scan comparisons", "Priority support"]
  },
  {
    name: "Scale",
    price: "$99",
    period: "/month",
    tagline: "For agencies and enterprise teams.",
    popular: false,
    cta: "Start Scale",
    ctaVariant: "outline" as const,
    features: [
      "100 reports per month",
      "Everything in Pro",
      "Team workspace & sharing",
      "Historical scan comparisons",
      "Unbranded PDF exports",
      "Priority support",
      "Custom crawl configurations",
      "API access (beta)",
    ],
    missing: []
  },
];

const faqs = [
  {
    q: "Is the free plan really free forever?",
    a: "Yes. You get 5 lifetime reports at no cost, no credit card required. They don't expire. When you need more, you can upgrade at any time."
  },
  {
    q: "What counts as a report?",
    a: "Each URL you scan generates one report. Re-scanning the same URL generates a new report and uses one credit."
  },
  {
    q: "Can I cancel my Pro or Scale subscription anytime?",
    a: "Absolutely. There are no long-term commitments. Cancel before your next billing cycle and you'll never be charged again."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) via Stripe's secure checkout. We do not store card details."
  },
  {
    q: "Do unused reports roll over?",
    a: "No — reports reset each billing cycle. We recommend upgrading to the plan that fits your average monthly volume."
  },
  {
    q: "Is there a team discount?",
    a: "Scale plan seats are shared across a team workspace. For organizations needing custom volumes, contact us for enterprise pricing."
  },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const meta = PAGE_META.pricing;
  const faqSchema = buildFaqSchema(faqs);

  const handlePlanCta = (planName: string) => {
    if (planName === "Free") {
      navigate("/dashboard");
    } else {
      // Pro / Scale: route to dashboard where UpgradeModal is wired.
      // If the user is already logged in go straight to dashboard;
      // otherwise send them to the homepage which triggers the auth modal.
      navigate(user ? "/dashboard" : "/");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      <MetaTags
        title={meta.title}
        description={meta.description}
        canonical={meta.canonical}
        ogImage={meta.ogImage}
        schema={faqSchema}
      />
      {/* Hero */}
      <section className="pt-[120px] pb-20 border-b border-[#e8e6dc]">
        <div className="container-page text-center">
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-5"
          >
            Pricing
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif font-medium text-[48px] sm:text-[58px] leading-[1.08] tracking-[-0.03em] text-[#141413] max-w-[16ch] mx-auto mb-6"
          >
            Simple, transparent pricing.
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[18px] leading-[1.65] text-[#5e5d59] max-w-[38rem] mx-auto"
          >
            Start free, upgrade when you're ready. Every plan includes the core forensic audit engine 
            — Pro and Scale unlock the AI intelligence layer.
          </motion.p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1}
                className={`relative rounded-[24px] border p-8 ${
                  plan.popular
                    ? "border-[#141413] bg-[#141413] shadow-[0_12px_40px_rgba(20,20,19,0.2)]"
                    : "border-[#e8e6dc] bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex rounded-full bg-[#c96442] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <p className={`text-[12px] font-semibold uppercase tracking-[0.2em] mb-2 ${plan.popular ? "text-[#87867f]" : "text-[#87867f]"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`font-serif font-medium text-[48px] leading-none ${plan.popular ? "text-[#faf9f5]" : "text-[#141413]"}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-[15px] ${plan.popular ? "text-[#87867f]" : "text-[#87867f]"}`}>{plan.period}</span>
                    )}
                  </div>
                  <p className={`text-[14px] ${plan.popular ? "text-[#87867f]" : "text-[#5e5d59]"}`}>{plan.tagline}</p>
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 rounded-full p-0.5 border ${plan.popular ? "bg-[#c96442]/10 border-[#c96442]/30" : "bg-[#f0fdf4] border-[#bbf7d0]"}`}>
                        <Check className={`h-3.5 w-3.5 ${plan.popular ? "text-[#c96442]" : "text-[#16a34a]"}`} />
                      </div>
                      <span className={`text-[14px] leading-snug ${plan.popular ? "text-[#e8e6dc]" : "text-[#141413]"}`}>{f}</span>
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-3 opacity-35">
                      <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full border border-current flex items-center justify-center">
                        <span className="text-[10px]">—</span>
                      </div>
                      <span className={`text-[14px] leading-snug line-through ${plan.popular ? "text-[#87867f]" : "text-[#87867f]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanCta(plan.name)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-medium transition-all hover:-translate-y-0.5 cursor-pointer ${
                    plan.ctaVariant === "primary"
                      ? "bg-[#c96442] text-white hover:bg-[#b05637]"
                      : plan.popular
                      ? "bg-[#30302e] text-[#faf9f5] hover:bg-[#3d3d3a]"
                      : "border border-[#e8e6dc] bg-[#faf9f5] text-[#141413] hover:bg-[#f0eee6]"
                  }`}
                >
                  {plan.cta} <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center text-[13px] text-[#87867f] mt-8"
          >
            Cancel anytime. No long-term contracts. Secure checkout via Stripe.
          </motion.p>
        </div>
      </section>

      {/* ROI Callout */}
      <section className="py-16 border-y border-[#e8e6dc]">
        <div className="container-page">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            {[
              { metric: "43%", label: "Average ranking improvement after fixing top 3 issues" },
              { metric: "< 30s", label: "Time to a complete forensic SEO report" },
              { metric: "60+", label: "Technical checkpoints evaluated per scan" },
            ].map((stat, i) => (
              <motion.div
                key={stat.metric}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.1}
              >
                <div className="font-serif font-medium text-[48px] text-[#c96442] leading-none mb-3">{stat.metric}</div>
                <p className="text-[14px] text-[#5e5d59] leading-[1.6] max-w-[18ch] mx-auto">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container-page max-w-[700px]">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-4">FAQ</p>
            <h2 className="font-serif font-medium text-[36px] leading-[1.2] text-[#141413] mb-12">
              Common questions.
            </h2>
          </motion.div>

          <div className="space-y-1">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.05}
                className="border-b border-[#e8e6dc]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-[16px] font-medium text-[#141413] hover:text-[#c96442] transition-colors"
                >
                  {faq.q}
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 shrink-0 text-[#87867f]" />
                    : <ChevronDown className="h-4 w-4 shrink-0 text-[#87867f]" />
                  }
                </button>
                {openFaq === i && (
                  <p className="pb-5 text-[15px] leading-[1.75] text-[#5e5d59]">{faq.a}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
