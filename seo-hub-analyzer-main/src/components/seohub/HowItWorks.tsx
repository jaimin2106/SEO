import { Activity, LayoutList, Code2 } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  { 
    icon: Activity, 
    title: "Start audit", 
    desc: "Enter a domain to launch a live crawl across technical, rendering, and performance layers." 
  },
  { 
    icon: LayoutList, 
    title: "Validate site signals", 
    desc: "Review crawlability, metadata, Core Web Vitals, and rendered output in one structured view." 
  },
  { 
    icon: Code2, 
    title: "Prioritized remediation", 
    desc: "Export severity-ranked issues with implementation context for engineering or content teams." 
  },
];

const HowItWorks = () => {
  return (
    <section id="workflow" className="bg-[#f5f4ed] py-24 sm:py-32 border-b border-[#e8e6dc]">
      <div className="container-page">
        <Reveal className="max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <h2 className="text-[42px] leading-[1.1] tracking-tight font-serif font-medium text-[#141413] sm:text-[48px]">
              Built for rapid issue triage.
            </h2>
            <p className="mt-6 text-[18px] leading-[1.6] text-[#5e5d59]">
              Run a crawl, review detected issues, and hand off prioritized fixes without slowing down content or engineering workflows.
            </p>
          </div>

          <div className="lg:col-span-7 relative">
            {/* Vertical Workflow Rail Line */}
            <div className="absolute left-[27px] top-4 bottom-12 w-px bg-[#e8e6dc] hidden sm:block" />

            <div className="flex flex-col gap-12">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Reveal key={i} delayMs={i * 100} className="relative sm:pl-20">
                    {/* Rail Node */}
                    <div className="absolute left-0 top-0 hidden sm:flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#f5f4ed] bg-[#faf9f5] shadow-[0_0_0_1px_#d1cfc5] z-10">
                       <Icon className="h-5 w-5 text-[#c96442]" />
                    </div>

                    <div className="rounded-[12px] border border-[#e8e6dc] bg-[#faf9f5] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#c96442]/30 hover:shadow-[0_8px_32px_rgba(201,100,66,0.05)]">
                      <div className="sm:hidden mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e6dc] text-[#c96442]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[12px] font-mono font-medium text-[#87867f] uppercase tracking-wider mb-2 block">
                        Phase {i + 1}
                      </span>
                      <h3 className="font-serif text-[24px] font-medium text-[#141413]">{s.title}</h3>
                      <p className="mt-3 text-[16px] leading-[1.6] text-[#5e5d59]">
                        {s.desc}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;