import Reveal from "./Reveal";
import { motion, Variants } from "framer-motion";
import { Activity, Layers, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

const VisualPreview = () => {
  return (
    <section id="report-preview" className="bg-[#f5f4ed] py-24 sm:py-32 relative overflow-hidden">
      {/* Ambient background blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        viewport={{ once: true }}
        className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#eab308]/5 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="container-page relative z-10">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-3 py-1 text-[12px] font-medium text-[#c96442] shadow-[0_0_0_1px_#e8e6dc] cursor-default"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#c96442] animate-pulse" />
              Deep Scan Engine
            </motion.div>

            <h2 className="mt-6 text-[42px] leading-[1.1] tracking-tight text-[#141413] font-serif font-medium sm:text-[56px]">
              Analyze and fix issues in unlimited depth and width.
            </h2>
            <p className="mt-6 text-[18px] leading-[1.6] text-[#5e5d59]">
              Instantly understand what blocks growth with snapshots, issue clusters, and performance signals in one coherent view. No more guesswork, just a clear path to ranked growth.
            </p>
            <ul className="mt-8 space-y-4 text-[16px] text-[#4d4c48]">
              {[
                { icon: Layers, text: "Detect hidden content bottlenecks" },
                { icon: Zap, text: "See weak UX patterns instantly" },
                { icon: Activity, text: "Prioritize high-impact SEO fixes" }
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 group cursor-default"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8e6dc] text-[#c96442] text-sm transition-colors group-hover:bg-[#c96442] group-hover:text-white">
                    <item.icon className="h-3 w-3" />
                  </span>
                  <span className="transition-colors group-hover:text-[#141413]">{item.text}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="mt-10">
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                whileTap={{ y: 0 }}
              >
                <Link
                  to="/sample-report"
                  className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#e8e6dc] px-6 text-[15px] font-medium text-[#4d4c48] transition-colors hover:bg-[#d1cfc5] shadow-[0_0_0_1px_#d1cfc5]"
                >
                  Explore report structure
                </Link>
              </motion.div>
            </div>
          </Reveal>

          <Reveal delayMs={120}>
            <div className="rounded-[16px] border border-[#e8e6dc] bg-[#faf9f5] p-3 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
              <div className="overflow-hidden rounded-[12px] border border-[#e8e6dc] bg-white h-[320px] flex flex-col relative group">
                <div className="h-10 bg-[#faf9f5] border-b border-[#e8e6dc] flex items-center px-4 gap-2 z-10">
                   <div className="h-3 w-3 rounded-full bg-[#f0eee6]" />
                   <div className="h-3 w-3 rounded-full bg-[#f0eee6]" />
                   <div className="h-3 w-3 rounded-full bg-[#f0eee6]" />
                   <div className="ml-auto text-[11px] font-mono text-[#87867f]">Analysis_View.jsx</div>
                </div>
                
                {/* CSS Based UI Artifact replacing Unsplash Image */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex-1 bg-[#f5f4ed] p-6 relative overflow-hidden"
                >
                   {/* Animated Grid Lines */}
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#e8e6dc_1px,transparent_1px),linear-gradient(to_bottom,#e8e6dc_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40 pointer-events-none" />
                   
                   <div className="relative z-10 space-y-4">
                     {/* Graphic rows */}
                     <motion.div variants={itemVariants} className="h-16 w-full rounded-lg bg-white border border-[#e8e6dc] shadow-sm flex items-center px-4 justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded bg-[#c96442]/10 flex items-center justify-center">
                              <Activity className="h-4 w-4 text-[#c96442]" />
                           </div>
                           <div className="space-y-1.5">
                              <div className="h-2 w-24 bg-[#e8e6dc] rounded-full" />
                              <div className="h-2 w-16 bg-[#f0eee6] rounded-full" />
                           </div>
                        </div>
                        <div className="h-6 w-16 bg-[#22c55e]/10 rounded border border-[#22c55e]/20" />
                     </motion.div>
                     
                     <motion.div variants={itemVariants} className="h-16 w-[90%] rounded-lg bg-white border border-[#e8e6dc] shadow-sm flex items-center px-4 justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded bg-[#eab308]/10 flex items-center justify-center">
                              <Zap className="h-4 w-4 text-[#eab308]" />
                           </div>
                           <div className="space-y-1.5">
                              <div className="h-2 w-32 bg-[#e8e6dc] rounded-full" />
                              <div className="h-2 w-20 bg-[#f0eee6] rounded-full" />
                           </div>
                        </div>
                        <div className="h-6 w-16 bg-[#eab308]/10 rounded border border-[#eab308]/20" />
                     </motion.div>

                     <motion.div variants={itemVariants} className="h-16 w-[95%] rounded-lg bg-white border border-[#e8e6dc] shadow-sm flex items-center px-4 justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded bg-[#141413]/5 flex items-center justify-center">
                              <Layers className="h-4 w-4 text-[#141413]/40" />
                           </div>
                           <div className="space-y-1.5">
                              <div className="h-2 w-20 bg-[#e8e6dc] rounded-full" />
                              <div className="h-2 w-12 bg-[#f0eee6] rounded-full" />
                           </div>
                        </div>
                        <div className="h-6 w-16 bg-[#141413]/5 rounded border border-[#141413]/10" />
                     </motion.div>
                   </div>
                </motion.div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ y: -4, backgroundColor: "#ffffff" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-[12px] border border-[#e8e6dc] bg-[#faf9f5] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors cursor-default"
              >
                <h3 className="font-serif text-[24px] font-medium text-[#141413]">JS Rendering</h3>
                <p className="mt-1 text-[14px] text-[#5e5d59]">Executes full hydration to catch client-side blocking issues.</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -4, backgroundColor: "#ffffff" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-[12px] border border-[#e8e6dc] bg-[#faf9f5] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-colors cursor-default"
              >
                 <h3 className="font-serif text-[24px] font-medium text-[#141413]">CrUX API</h3>
                 <p className="mt-1 text-[14px] text-[#5e5d59]">Validates performance data against real-world user metrics.</p>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default VisualPreview;
