import UrlAnalyzer from "./UrlAnalyzer";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section id="hero" className="mt-[76px] overflow-hidden border-b border-[#e8e6dc] bg-[#f5f4ed]">
      <div className="container-page">
        <div className="grid min-h-[calc(100dvh-76px)] items-center gap-12 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start justify-center">
            <motion.p
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#87867f]"
            >
              Technical clarity for faster SEO decisions
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.05, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[14ch] text-[42px] leading-[1.05] tracking-[-0.04em] text-[#141413] font-serif font-medium sm:text-[56px] lg:text-[62px]"
            >
              See what is quietly costing your rankings.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-[32rem] text-[17px] leading-[1.65] text-[#5e5d59] sm:text-[18px]"
            >
              Run a live audit and get a clearer read on technical SEO, Core Web Vitals, and the
              fixes most likely to improve visibility.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.16, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex items-center gap-2 mb-3"
            >
              <div className="flex -space-x-2">
                <img className="inline-block h-6 w-6 rounded-full border-2 border-[#f5f4ed]" src="https://i.pravatar.cc/100?img=1" alt="" />
                <img className="inline-block h-6 w-6 rounded-full border-2 border-[#f5f4ed]" src="https://i.pravatar.cc/100?img=2" alt="" />
                <img className="inline-block h-6 w-6 rounded-full border-2 border-[#f5f4ed]" src="https://i.pravatar.cc/100?img=3" alt="" />
              </div>
              <p className="text-[11px] font-medium text-[#5e5d59]">
                Trusted by marketers, agencies and founders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <UrlAnalyzer className="max-w-[38rem]" />
              
              {/* Friction reduction pills */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#87867f]">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#c96442]" /> No credit card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#c96442]" /> 5 free audits</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#c96442]" /> Desktop + Mobile analysis</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#c96442]" /> PDF export included</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.16, duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:ml-auto lg:max-w-[540px]"
          >
            <img 
              src="/seo-hero-illustration.svg" 
              alt="SEO Analytics Team" 
              className="w-full h-auto drop-shadow-[0_22px_70px_rgba(20,20,19,0.08)] hero-card-float"
            />
          </motion.div>
        </div>
        
        {/* Social Proof */}
        <div className="border-t border-[#e8e6dc]/60 py-8 text-center opacity-80">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#87867f] mb-6">
            Trusted by SEO teams and agencies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60">
             {/* Placeholder logos using text for now to maintain elegant look */}
             <span className="font-serif text-xl font-bold text-[#141413]">AcmeCorp</span>
             <span className="font-sans text-lg font-black tracking-tighter text-[#141413]">GLOBAL</span>
             <span className="font-serif text-xl italic text-[#141413]">Nexus</span>
             <span className="font-sans text-xl font-bold tracking-widest text-[#141413]">VERTEX</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
