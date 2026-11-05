import UrlAnalyzer from "./UrlAnalyzer";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  "5 Free Website Audits",
  "No Credit Card Required",
  "Mobile & Desktop Analysis",
  "PDF Report Exports",
];

const Hero = () => {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="mt-[76px] overflow-hidden border-b border-[#e8e6dc] bg-[#f5f4ed]"
    >
      <div className="container-page">
        <div className="grid min-h-[calc(100dvh-76px)] items-center gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">

          {/* Hero Content */}
          <div className="flex flex-col items-start justify-center">

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.52,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#87867f]"
            >
              AI-POWERED WEBSITE SEO ANALYSIS
            </motion.p>

            {/* Main Heading */}
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.05,
                duration: 0.58,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-[18ch] font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.04em] text-[#141413] sm:text-[56px] lg:text-[62px]"
            >
       Find Issues, Get Fixes.

            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.12,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-6 max-w-[32rem] text-[17px] leading-[1.65] text-[#5e5d59] sm:text-[18px]"
            >
           Uncover technical SEO issues, analyze Core Web Vitals, and discover
  actionable insights to improve your website&apos;s search performance.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.16,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-3 mt-8 flex items-center gap-2"
            >
              <p className="text-[11px] font-medium text-[#5e5d59]">
                For marketers, SEO professionals and website owners.
              </p>
            </motion.div>

            {/* URL Analyzer */}
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.2,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full"
            >
              <UrlAnalyzer className="max-w-[38rem]" />

              {/* Free Audit Benefits */}
              <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#87867f]">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-[#c96442]"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              delay: 0.16,
              duration: 0.78,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full lg:ml-auto lg:max-w-[540px]"
          >
            <img
              src="/seo-hero-illustration.svg"
              alt="Website SEO audit dashboard displaying technical SEO analysis, website performance and Core Web Vitals insights"
              className="hero-card-float h-auto w-full drop-shadow-[0_22px_70px_rgba(20,20,19,0.08)]"
              fetchPriority="high"
            />
          </motion.div>
        </div>

        {/* Product Capabilities */}
        <div className="border-t border-[#e8e6dc]/60 py-8 text-center">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#87867f]">
            Everything you need to understand your website&apos;s SEO health
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 grayscale opacity-60 md:gap-16">
            <span className="font-serif text-xl font-bold text-[#141413]">
              Technical SEO
            </span>

            <span className="font-sans text-lg font-black tracking-tighter text-[#141413]">
              CORE WEB VITALS
            </span>

            <span className="font-serif text-xl italic text-[#141413]">
              On-Page SEO
            </span>

            <span className="font-sans text-xl font-bold tracking-widest text-[#141413]">
              PERFORMANCE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;