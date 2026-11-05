import UrlAnalyzer from "./UrlAnalyzer";
import Reveal from "./Reveal";

const FinalCta = () => {
  return (
    <section className="bg-[#f5f4ed] py-24 sm:py-32">
      <div className="container-page">
        <Reveal className="mx-auto max-w-[1000px]">
          <div className="relative overflow-hidden rounded-[24px] border border-[#30302e] bg-[#141413] px-6 py-20 text-center shadow-[0_24px_64px_rgba(20,20,19,0.15)] sm:px-12 sm:py-24">
             {/* Subtle Glow */}
             <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[#c96442]/10 blur-[100px]"
            />
            
            <div className="relative z-10">
              <h2 className="font-serif text-[42px] font-medium leading-[1.1] tracking-tight text-[#faf9f5] sm:text-[56px]">
                Start Understanding Your Website&apos;s SEO Performance.
              </h2>
              <p className="mx-auto mt-6 max-w-[32rem] text-[18px] leading-[1.6] text-[#b0aea5]">
                Run a website SEO analysis to uncover technical issues, evaluate
                Core Web Vitals and find actionable opportunities to improve
                your website.
              </p>
              
              <div className="mx-auto mt-12 max-w-[38rem]">
                <UrlAnalyzer submitLabel="Analyze Your Website Free" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCta;