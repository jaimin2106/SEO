import Reveal from "./Reveal";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

// Premium Glow Card for magnetic hover effects
const GlowCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative h-full rounded-[12px] border border-[#30302e] bg-[#1f1e1a] overflow-hidden transition-colors hover:border-[#5e5d59] ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(201, 100, 66, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full z-10 flex flex-col justify-between p-8">
        {children}
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section id="features" className="bg-[#141413] py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#30302e_1px,transparent_1px),linear-gradient(to_bottom,#30302e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      
      <div className="container-page relative z-10">
        <Reveal className="max-w-3xl mb-16">
          <span className="text-[13px] font-medium tracking-wide text-[#87867f] uppercase">
            Platform Capabilities
          </span>
          <h2 className="mt-4 text-[42px] leading-[1.1] tracking-tight text-[#faf9f5] font-serif font-medium sm:text-[56px]">
            Forensic intelligence modules.
          </h2>
          <p className="mt-6 text-[18px] leading-[1.6] text-[#b0aea5] max-w-[32rem]">
            A premium audit stack for technical SEO, frontend engineering, AI visibility, conversion psychology, and enterprise trust analysis. Built to think like a senior consultant, not a checklist.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-[1200px] gap-6 md:grid-cols-12">
          
          {/* Module 1: Crawler (Col span 7) */}
          <Reveal delayMs={0} className="md:col-span-7">
            <GlowCard>
              <div className="w-full max-w-[24rem]">
                <h3 className="font-serif text-[24px] font-medium text-[#faf9f5]">Crawl Graph & Indexation Forensics</h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-[#b0aea5]">
                  Map internal link equity, expose orphan-risk pages, validate robots and sitemap coverage, and surface canonical, duplication, and crawl-budget conflicts before rankings decay.
                </p>
              </div>
              
              {/* Product Artifact Visual */}
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-10 rounded-[8px] border border-[#30302e] bg-[#141413] p-4 shadow-inner"
              >
                 <div className="flex items-center justify-between border-b border-[#30302e] pb-3 mb-3">
                   <div className="flex items-center gap-4">
                      <span className="text-[12px] text-[#87867f] uppercase tracking-wider font-medium">Crawl Status</span>
                      <span className="flex items-center gap-1.5 rounded bg-[#22c55e]/10 px-2 py-0.5 text-[11px] font-medium text-[#22c55e]">
                         <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" /> Active
                      </span>
                   </div>
                   <span className="text-[12px] font-mono text-[#b0aea5]">Depth: 4</span>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[13px] group/row">
                       <span className="text-[#5e5d59] transition-colors group-hover/row:text-[#87867f]">URLs Discovered</span>
                       <span className="text-[#faf9f5] font-mono">14,208</span>
                    </div>
                    <div className="flex justify-between text-[13px] group/row">
                       <span className="text-[#5e5d59] transition-colors group-hover/row:text-[#87867f]">Blocked by robots.txt</span>
                       <span className="text-[#c96442] font-mono">241</span>
                    </div>
                    <div className="flex justify-between text-[13px] group/row">
                       <span className="text-[#5e5d59] transition-colors group-hover/row:text-[#87867f]">Noindex tags</span>
                       <span className="text-[#eab308] font-mono">89</span>
                    </div>
                 </div>
              </motion.div>
            </GlowCard>
          </Reveal>

          {/* Module 2: CWV (Col span 5) */}
          <Reveal delayMs={100} className="md:col-span-5">
             <GlowCard>
                <div>
                  <h3 className="font-serif text-[24px] font-medium text-[#faf9f5]">Performance Engineering</h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-[#b0aea5]">
                    Measure LCP, CLS, INP, and the critical rendering path while estimating bundle bloat, unused code, cache weakness, compression gaps, and request-waterfall friction.
                  </p>
                </div>
                
                {/* Product Artifact Visual */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mt-10 w-full rounded-[8px] border border-[#30302e] bg-[#141413] p-4 flex flex-col gap-4"
                >
                   <div className="flex flex-col gap-1">
                     <div className="flex justify-between text-[12px]">
                       <span className="text-[#5e5d59] uppercase tracking-wider font-medium">LCP Time</span>
                       <span className="text-[#c96442] font-mono">3.2s</span>
                     </div>
                     <div className="h-1.5 w-full bg-[#30302e] rounded-full overflow-hidden flex">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "60%" }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#22c55e]" />
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "20%" }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-[#eab308]" />
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "20%" }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-[#c96442]" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                     <div className="flex justify-between text-[12px]">
                       <span className="text-[#5e5d59] uppercase tracking-wider font-medium">CLS Score</span>
                       <span className="text-[#faf9f5] font-mono">0.04</span>
                     </div>
                     <div className="h-1.5 w-full bg-[#30302e] rounded-full overflow-hidden flex">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "85%" }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-[#22c55e]" />
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "15%" }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-[#eab308]" />
                     </div>
                   </div>
                </motion.div>
             </GlowCard>
          </Reveal>

          {/* Module 3: DOM/Rendering (Col span 5) */}
          <Reveal delayMs={200} className="md:col-span-5">
            <GlowCard>
               <div>
                 <h3 className="font-serif text-[24px] font-medium text-[#faf9f5]">Rendering, UX & AI Readiness</h3>
                 <p className="mt-3 text-[15px] leading-[1.6] text-[#b0aea5]">
                   Compare raw HTML against hydrated output, judge semantic chunk quality for LLMs, and inspect the visual hierarchy, trust cues, and conversion psychology seen by real users.
                 </p>
               </div>
               
               {/* Product Artifact Visual */}
               <motion.div 
                 whileHover={{ y: -4 }}
                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
                 className="mt-10 rounded-[8px] border border-[#30302e] bg-[#141413] overflow-hidden"
               >
                 <div className="flex items-center gap-px bg-[#30302e]">
                    <div className="bg-[#141413] px-3 py-1.5 text-[11px] font-mono text-[#87867f]">Raw HTML</div>
                    <div className="bg-[#1f1e1a] px-3 py-1.5 text-[11px] font-mono text-[#faf9f5]">Rendered DOM</div>
                 </div>
                 <div className="p-3 text-[11px] font-mono text-[#87867f] whitespace-pre opacity-80 leading-relaxed">
                   <span className="text-[#c96442]">{'<div id="app">'}</span>{'\n'}
                   {'  '}<span className="text-[#22c55e]">{'<main class="hydrated">'}</span>{'\n'}
                   {'    '}<span className="text-[#eab308]">{'<h1>'}</span>{'Optimized Output'}<span className="text-[#eab308]">{'</h1>'}</span>{'\n'}
                   {'  '}<span className="text-[#22c55e]">{'</main>'}</span>{'\n'}
                   <span className="text-[#c96442]">{'</div>'}</span>
                 </div>
               </motion.div>
            </GlowCard>
          </Reveal>

          {/* Module 4: Remediation (Col span 7) */}
          <Reveal delayMs={300} className="md:col-span-7">
             <GlowCard className="border-[#c96442]/30 bg-gradient-to-br from-[#1f1e1a] to-[#141413]">
               <div className="flex flex-col md:flex-row justify-between gap-8 w-full">
                 <div className="w-full md:w-1/2">
                   <h3 className="font-serif text-[24px] font-medium text-[#faf9f5]">Priority Command Center</h3>
                   <p className="mt-3 text-[15px] leading-[1.6] text-[#b0aea5]">
                     Turn findings into executive-ready action plans. Every anomaly is ranked by severity, score loss, effort, business impact, and developer remediation detail.
                   </p>
                 </div>
                 
                 {/* Product Artifact Visual */}
                 <div className="w-full md:w-1/2 flex flex-col gap-2">
                   <motion.div whileHover={{ scale: 1.02 }} className="rounded-[6px] border border-[#c96442]/30 bg-[#c96442]/10 p-3 flex justify-between items-center cursor-default">
                      <div className="flex flex-col">
                         <span className="text-[12px] font-medium text-[#faf9f5]">Multiple canonical tags</span>
                         <span className="text-[11px] font-mono text-[#87867f] mt-0.5">/product/shoes</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#c96442] uppercase tracking-wide animate-pulse">Critical</span>
                   </motion.div>
                   <motion.div whileHover={{ scale: 1.02 }} className="rounded-[6px] border border-[#30302e] bg-[#141413] p-3 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity cursor-default">
                      <div className="flex flex-col">
                         <span className="text-[12px] font-medium text-[#faf9f5]">Image missing alt attr</span>
                         <span className="text-[11px] font-mono text-[#87867f] mt-0.5">/blog/post-1</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#eab308] uppercase tracking-wide">Warning</span>
                   </motion.div>
                   <motion.div whileHover={{ scale: 1.02 }} className="rounded-[6px] border border-[#30302e] bg-[#141413] p-3 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity cursor-default">
                      <div className="flex flex-col">
                         <span className="text-[12px] font-medium text-[#faf9f5]">Tap target too small</span>
                         <span className="text-[11px] font-mono text-[#87867f] mt-0.5">/contact</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#87867f] uppercase tracking-wide">Notice</span>
                   </motion.div>
                 </div>
               </div>
             </GlowCard>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

export default Features;
