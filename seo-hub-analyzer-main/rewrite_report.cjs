const fs = require('fs');
const file = 'c:\\\\Users\\\\JAIMIN\\\\Desktop\\\\seo-hub-analyzer-main\\\\seo-hub-analyzer-main\\\\src\\\\pages\\\\Report.tsx';
let content = fs.readFileSync(file, 'utf8');

const splitPoint = content.indexOf('  if (error) {');
if (splitPoint === -1) {
  console.error("Could not find split point");
  process.exit(1);
}

const topPart = content.substring(0, splitPoint);
const newMainPart = `  if (error) {
    return (
       <div className="min-h-screen flex flex-col bg-[#faf9f5] items-center justify-center font-sans">
         <div className="flex items-center gap-3 text-[#c96442] mb-4">
           <AlertTriangle className="h-8 w-8" />
           <h2 className="text-[24px] font-serif font-medium text-[#141413]">Analysis Failed</h2>
         </div>
         <p className="text-[#87867f] text-[15px] max-w-md text-center leading-relaxed">
           {error}
         </p>
         <Button onClick={() => window.location.href = '/'} className="mt-8 bg-[#141413] text-[#faf9f5] hover:bg-[#1f1e1a] rounded-full px-8">
           Return Home
         </Button>
       </div>
    );
  }

  // Calculate some derived states for the redesign
  const displayDomain = targetUrl.replace(/^https?:\\/\\//, "");
  const topIssues = reportData.weaknesses || [];
  const quickWins = reportData.quick_wins || [];
  
  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] font-sans selection:bg-[#c96442]/15">
      <Navbar />
      
      {/* --- HERO SUMMARY CARD --- */}
      <header className="bg-[#141413] pt-32 pb-16 border-b border-[#30302e]">
        <div className="container-page flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
               <Globe className="h-5 w-5 text-[#87867f]" />
               <h1 className="text-[32px] md:text-[42px] font-serif font-medium text-[#faf9f5] leading-none tracking-tight">
                 {displayDomain}
               </h1>
            </div>
            <p className="text-[16px] md:text-[18px] text-[#b0aea5] leading-[1.65]">
              {reportData.ai_summary || "Technical SEO audit complete. Review the findings below to improve search visibility and performance."}
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-[#1f1e1a] p-6 rounded-[24px] border border-[#30302e] shadow-2xl shrink-0">
            <ScoreRing score={reportData.overall_score} size={100} strokeWidth={6} />
            <div className="flex flex-col gap-4">
              <div>
                 <p className="text-[11px] uppercase tracking-[0.15em] text-[#87867f] mb-1 font-semibold">Priority Issues</p>
                 <span className="font-serif text-[32px] leading-none text-[#c96442]">{topIssues.length}</span>
              </div>
              <div className="flex gap-2">
                 <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="h-8 rounded-full border-[#5e5d59] text-[#faf9f5] hover:bg-[#30302e] hover:text-white bg-transparent">
                   <RefreshCw className="mr-1.5 h-3 w-3" /> Re-scan
                 </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- STICKY NAVIGATION TABS --- */}
      <div className="sticky top-0 z-40 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e8e6dc]">
        <div className="h-[2px] bg-[#ebe6db] w-full absolute top-0 left-0">
          <div className="h-full bg-[#c96442] transition-all duration-300" style={{ width: \`\${scrollProgress * 100}%\` }} />
        </div>
        <div className="container-page overflow-x-auto no-scrollbar py-4">
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'diagnostics', label: 'Diagnostics & Tech' },
              { id: 'rendering', label: 'Visual Rendering' },
              { id: 'action-plan', label: 'Action Plan' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className={\`px-5 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap \${
                  activeSection === tab.id 
                    ? 'bg-[#141413] text-[#faf9f5] shadow-md' 
                    : 'bg-transparent text-[#5e5d59] hover:bg-[#ebe6db] hover:text-[#141413]'
                }\`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container-page py-16 min-h-[60vh]">
        
        {/* === TAB: OVERVIEW === */}
        {activeSection === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
             
             {/* Category Horizontal Bars */}
             <div className="bg-[#ffffff] p-8 rounded-[24px] border border-[#e8e6dc] shadow-[0_8px_30px_rgba(20,20,19,0.03)]">
               <h3 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#87867f] mb-8">Category Scores</h3>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                 {[
                    { label: 'On-Page', score: reportData.category_scores.on_page },
                    { label: 'Performance', score: reportData.category_scores.performance },
                    { label: 'Technical', score: reportData.category_scores.technical },
                    { label: 'Content', score: reportData.category_scores.content },
                    { label: 'Links', score: reportData.category_scores.links },
                    { label: 'Schema/GEO', score: reportData.category_scores.geo },
                  ].map((cat) => (
                    <div key={cat.label}>
                       <div className="flex justify-between items-end mb-2">
                         <span className="text-[14px] font-medium text-[#141413]">{cat.label}</span>
                         <span className={\`font-serif text-[20px] leading-none \${cat.score >= 80 ? 'text-[#22c55e]' : cat.score >= 50 ? 'text-[#eab308]' : 'text-[#c96442]'}\`}>{cat.score}</span>
                       </div>
                       <div className="h-1.5 w-full bg-[#ebe6db] rounded-full overflow-hidden">
                         <div 
                           className={\`h-full transition-all duration-1000 \${cat.score >= 80 ? 'bg-[#22c55e]' : cat.score >= 50 ? 'bg-[#eab308]' : 'bg-[#c96442]'}\`}
                           style={{ width: \`\${cat.score}%\` }}
                         />
                       </div>
                    </div>
                  ))}
               </div>
             </div>

             {/* Strengths and Weaknesses Cards */}
             <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-[#ffffff] rounded-[24px] border border-[#e8e6dc] shadow-sm overflow-hidden flex flex-col">
                 <div className="bg-[#faf9f5] border-b border-[#e8e6dc] px-6 py-4 flex items-center gap-3">
                   <AlertCircle className="h-5 w-5 text-[#c96442]" />
                   <h3 className="font-semibold text-[#141413]">Critical Issues</h3>
                 </div>
                 <div className="p-6 flex-1">
                   {topIssues.length > 0 ? (
                     <ul className="space-y-4">
                       {topIssues.map((w: string, i: number) => (
                         <li key={i} className="flex items-start gap-3">
                           <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#c96442] shrink-0" />
                           <span className="text-[14px] text-[#5e5d59] leading-[1.6]">{w}</span>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-[14px] text-[#87867f]">No critical issues detected.</p>
                   )}
                 </div>
               </div>

               <div className="flex flex-col gap-8">
                 <div className="bg-[#ffffff] rounded-[24px] border border-[#e8e6dc] shadow-sm overflow-hidden">
                   <div className="bg-[#faf9f5] border-b border-[#e8e6dc] px-6 py-4 flex items-center gap-3">
                     <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                     <h3 className="font-semibold text-[#141413]">Top Strengths</h3>
                   </div>
                   <div className="p-6">
                     <ul className="space-y-4">
                       {reportData.strengths.slice(0, 4).map((s: string, i: number) => (
                         <li key={i} className="flex items-start gap-3">
                           <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#22c55e] shrink-0" />
                           <span className="text-[14px] text-[#5e5d59] leading-[1.6]">{s}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </div>

                 {quickWins.length > 0 && (
                   <div className="bg-[#ffffff] rounded-[24px] border border-[#e8e6dc] shadow-sm overflow-hidden">
                     <div className="bg-[#faf9f5] border-b border-[#e8e6dc] px-6 py-4 flex items-center gap-3">
                       <Zap className="h-5 w-5 text-[#eab308]" />
                       <h3 className="font-semibold text-[#141413]">Quick Opportunities</h3>
                     </div>
                     <div className="p-6">
                       <ul className="space-y-4">
                         {quickWins.map((qw: any, i: number) => (
                           <li key={i} className="flex justify-between items-start gap-4">
                             <span className="text-[14px] font-medium text-[#141413]">{qw.title}</span>
                             <span className="text-[10px] uppercase tracking-wider font-semibold text-[#87867f] border border-[#e8e6dc] px-2 py-0.5 rounded-full bg-[#faf9f5] whitespace-nowrap">{qw.category}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        )}

        {/* === TAB: DIAGNOSTICS === */}
        {activeSection === 'diagnostics' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-16">
            
            {/* Core Web Vitals */}
            <div>
              <div className="mb-6">
                <h2 className="text-[24px] font-serif font-medium text-[#141413]">Performance (Core Web Vitals)</h2>
                <p className="text-[#87867f] text-[14px] mt-1">Live metrics from Google PageSpeed Insights.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: "LCP", value: reportData.performance.mobile.lcp, status: reportData.performance.mobile.score >= 80 ? 'pass' : 'warn', desc: "Largest Contentful Paint", fix: "Optimize images & server response." },
                   { label: "CLS", value: reportData.performance.mobile.cls, status: reportData.performance.mobile.score >= 80 ? 'pass' : 'warn', desc: "Cumulative Layout Shift", fix: "Set explicit width/height." },
                   { label: "FCP", value: reportData.performance.mobile.fcp, status: reportData.performance.mobile.score >= 80 ? 'pass' : 'warn', desc: "First Contentful Paint", fix: "Eliminate render-blocking resources." },
                   { label: "TBT", value: reportData.performance.mobile.tbt, status: reportData.performance.mobile.score >= 80 ? 'pass' : 'fail', desc: "Total Blocking Time", fix: "Reduce JavaScript execution." }
                 ].map((metric) => (
                   <div key={metric.label} className="bg-[#ffffff] p-5 rounded-[20px] border border-[#e8e6dc] shadow-sm flex flex-col justify-between hover:border-[#d1cfc5] transition-colors">
                     <div>
                       <div className="flex justify-between items-center mb-4">
                         <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#87867f]">{metric.label}</span>
                         {metric.status === 'pass' ? <CheckCircle2 className="h-4 w-4 text-[#22c55e]" /> : <AlertTriangle className={\`h-4 w-4 \${metric.status==='fail'?'text-[#c96442]':'text-[#eab308]'}\`} />}
                       </div>
                       <div className="font-serif text-[32px] text-[#141413] leading-none mb-1">{metric.value}</div>
                       <div className="text-[12px] text-[#5e5d59]">{metric.desc}</div>
                     </div>
                     {metric.status !== 'pass' && (
                       <div className="mt-4 pt-3 border-t border-[#f0eee6] text-[12px] font-medium text-[#c96442]">
                         Fix: {metric.fix}
                       </div>
                     )}
                   </div>
                 ))}
              </div>
            </div>

            {/* Technical Checks */}
            <div>
              <div className="mb-6">
                <h2 className="text-[24px] font-serif font-medium text-[#141413]">Technical Checks</h2>
                <p className="text-[#87867f] text-[14px] mt-1">Crawlability, indexing, and security signals.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[
                    { label: "SSL (HTTPS)", value: reportData.technical.ssl, detail: "Secure protocol active." },
                    { label: "Robots.txt", value: reportData.technical.robots, detail: "Valid format found." },
                    { label: "XML Sitemap", value: reportData.technical.sitemap, detail: "Sitemap referenced." },
                    { label: "Canonical Tag", value: reportData.technical.canonical, detail: "Canonical defined." },
                    { label: "Open Graph", value: reportData.technical.og_tags, detail: "Social tags present." },
                    { label: "Schema Markup", value: reportData.technical.schema, detail: "Structured data active." },
                 ].map((item, i) => (
                   <div key={i} className="flex items-start gap-4 bg-[#ffffff] p-5 rounded-[16px] border border-[#e8e6dc]">
                     <StatusIcon status={item.value ? "Pass" : "Fail"} />
                     <div>
                       <p className="text-[14px] font-medium text-[#141413]">{item.label}</p>
                       <p className="text-[12px] text-[#87867f] mt-0.5">{item.value ? item.detail : "Missing or invalid configuration."}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Content Quality */}
            <div>
              <div className="mb-6">
                <h2 className="text-[24px] font-serif font-medium text-[#141413]">Content Quality</h2>
                <p className="text-[#87867f] text-[14px] mt-1">On-page text and media assets.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#e8e6dc] shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#87867f] mb-3">Scraped Word Count</p>
                    <div className="flex items-end gap-3 mb-2">
                       <span className="font-serif text-[42px] leading-none text-[#141413]">{reportData.content.word_count}</span>
                       <span className="text-[14px] text-[#87867f] pb-1">words</span>
                    </div>
                    {reportData.content.word_count === 0 ? (
                      <span className="inline-block bg-[#f0eee6] text-[#5e5d59] text-[12px] font-medium px-2.5 py-1 rounded-md mt-2">Unable to Verify (JS Rendered)</span>
                    ) : reportData.content.word_count < 300 ? (
                      <span className="inline-block bg-[#fff5f2] text-[#c96442] text-[12px] font-medium px-2.5 py-1 rounded-md mt-2">Thin Content</span>
                    ) : (
                      <span className="inline-block bg-[#f0fdf4] text-[#22c55e] text-[12px] font-medium px-2.5 py-1 rounded-md mt-2">Good Length</span>
                    )}
                 </div>
                 <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#e8e6dc] shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#87867f] mb-3">Images Missing Alt Text</p>
                    <div className="flex items-end gap-3 mb-2">
                       <span className="font-serif text-[42px] leading-none text-[#141413]">{reportData.on_page.images.missing_alt}</span>
                       <span className="text-[14px] text-[#87867f] pb-1">/ {reportData.on_page.images.total} images</span>
                    </div>
                    {reportData.content.word_count === 0 ? (
                       <span className="inline-block bg-[#f0eee6] text-[#5e5d59] text-[12px] font-medium px-2.5 py-1 rounded-md mt-2">Unable to Verify</span>
                    ) : reportData.on_page.images.missing_alt > 0 ? (
                       <span className="inline-block bg-[#fff5f2] text-[#c96442] text-[12px] font-medium px-2.5 py-1 rounded-md mt-2">Action Required</span>
                    ) : (
                       <span className="inline-block bg-[#f0fdf4] text-[#22c55e] text-[12px] font-medium px-2.5 py-1 rounded-md mt-2">Perfect</span>
                    )}
                 </div>
              </div>
            </div>

          </div>
        )}

        {/* === TAB: RENDERING === */}
        {activeSection === 'rendering' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8">
               <h2 className="text-[28px] font-serif font-medium text-[#141413]">Live Visual Rendering</h2>
               <p className="text-[#5e5d59] text-[15px] mt-2">Real-time desktop and mobile viewport captures via Thum.io.</p>
             </div>
             
             <div className="grid lg:grid-cols-12 gap-8">
                {/* Desktop */}
                <div className="lg:col-span-8 bg-[#141413] rounded-[24px] border border-[#30302e] shadow-xl overflow-hidden flex flex-col">
                  <div className="bg-[#1f1e1a] h-12 border-b border-[#30302e] flex items-center px-4 gap-2">
                     <div className="h-3 w-3 rounded-full bg-[#30302e]" />
                     <div className="h-3 w-3 rounded-full bg-[#30302e]" />
                     <div className="h-3 w-3 rounded-full bg-[#30302e]" />
                     <div className="ml-4 bg-[#141413] border border-[#30302e] rounded-md px-3 py-1 text-[11px] font-mono text-[#87867f] flex-1 max-w-sm truncate">{targetUrl}</div>
                  </div>
                  <div className="flex-1 w-full bg-[#faf9f5] min-h-[400px]">
                     <img 
                      src={\`https://api.microlink.io?url=\${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&embed=screenshot.url\`}
                      alt="Desktop rendering"
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="w-[300px] h-[600px] bg-[#141413] rounded-[40px] border-[12px] border-[#141413] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#141413] rounded-b-[16px] z-20" />
                     <div className="w-full h-full bg-[#faf9f5]">
                        <img 
                          src={\`https://api.microlink.io?url=\${encodeURIComponent(targetUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=375&viewport.height=812&viewport.isMobile=true\`}
                          alt="Mobile rendering"
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                     </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* === TAB: ACTION PLAN === */}
        {activeSection === 'action-plan' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
               <h2 className="text-[28px] font-serif font-medium text-[#141413]">Dynamic Action Plan</h2>
               <p className="text-[#5e5d59] text-[15px] mt-2">Prioritized roadmap generated from live scan data.</p>
            </div>

            {reportData.recommendations.length === 0 ? (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[24px] p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="h-16 w-16 text-[#22c55e] mb-4" />
                <h3 className="text-[24px] font-serif font-medium text-[#141413] mb-2">Perfect Score</h3>
                <p className="text-[#5e5d59] max-w-md">No critical issues or warnings found. Your site structure is optimally configured.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportData.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="bg-[#ffffff] border border-[#e8e6dc] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(20,20,19,0.02)] transition-shadow hover:shadow-[0_8px_30px_rgba(20,20,19,0.06)]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           {rec.priority === "High" ? <Badge className="bg-[#fff5f2] text-[#c96442] hover:bg-[#fff5f2] border-transparent shadow-none px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">High Priority</Badge>
                           : rec.priority === "Medium" ? <Badge className="bg-[#fefce8] text-[#eab308] hover:bg-[#fefce8] border-transparent shadow-none px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">Medium Priority</Badge>
                           : <Badge className="bg-[#f0eee6] text-[#5e5d59] hover:bg-[#f0eee6] border-transparent shadow-none px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">Low Priority</Badge>}
                           
                           <span className="text-[11px] uppercase tracking-wider font-medium text-[#87867f] border border-[#e8e6dc] px-2 py-0.5 rounded-full">{rec.category}</span>
                        </div>
                        <h3 className="text-[18px] font-medium text-[#141413] mb-2">{rec.title}</h3>
                        <p className="text-[14px] text-[#5e5d59] leading-[1.6] mb-4">{rec.impact}</p>
                        
                        <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-[12px] p-4 flex gap-3">
                           <div className="mt-0.5 bg-[#ffffff] border border-[#e8e6dc] p-1 rounded-md shrink-0"><Code className="h-4 w-4 text-[#87867f]" /></div>
                           <div>
                             <span className="text-[11px] uppercase tracking-wider font-bold text-[#87867f] block mb-1">Recommended Fix</span>
                             <span className="text-[13px] text-[#141413] font-medium">{rec.fix}</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 pt-2 md:pl-8 md:border-l border-[#f0eee6] flex flex-col gap-4 min-w-[140px]">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#87867f] block mb-1">Effort</span>
                          <span className="text-[13px] font-medium text-[#141413] flex items-center gap-1.5">
                            {rec.effort === "Low" ? <div className="h-2 w-2 rounded-full bg-[#22c55e]" /> : rec.effort === "Medium" ? <div className="h-2 w-2 rounded-full bg-[#eab308]" /> : <div className="h-2 w-2 rounded-full bg-[#c96442]" />}
                            {rec.effort}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default Report;
`;

content = content.replace(/import {([^}]+)} from "lucide-react";/, 'import { $1, Wrench } from "lucide-react";');
fs.writeFileSync(file, topPart + newMainPart);
console.log("Successfully rewrote Report.tsx");
