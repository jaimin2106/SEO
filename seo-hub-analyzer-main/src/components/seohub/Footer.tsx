import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const Footer = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  const columns = [
    {
      heading: "Website SEO Analysis",
      links: [
        { label: "Analyze your website", to: sectionHref("hero") },
        { label: "Sample SEO report", to: "/sample-report" },
        { label: "Pricing", to: sectionHref("pricing") },
      ],
    },
    {
      heading: "Technical SEO",
      links: [
        { label: "Technical SEO capabilities", to: "/capabilities" },
        { label: "Audit workflow", to: sectionHref("workflow") },
        { label: "Documentation", to: "/docs" },
      ],
    },
    {
      heading: "Core Web Vitals",
      links: [
        { label: "Performance analysis", to: sectionHref("features") },
        { label: "SEO insights and guides", to: sectionHref("blog") },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Blog", to: "/blog" },
        { label: "Case studies", to: "/case-studies" },
        { label: "About", to: "/about" },
        { label: "Contact support", to: "/support" },
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-[#141413] border-t border-[#232320]">
      <div className="container-page py-16 sm:py-20">

        {/* Top row — Brand + nav columns */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_3fr]">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to={sectionHref("hero")} className="inline-flex mb-6">
              <BrandLogo variant="light" className="gap-2" iconClassName="h-8 w-8" />
            </Link>
            <p className="text-[13px] leading-[1.75] text-[#5e5d59] max-w-[22rem]">
              Analyze technical SEO signals, page performance and on-page
              structure, then review recommendations for your website.
            </p>
          </div>

          {/* Link columns */}
          <nav aria-label="Footer" className="col-span-2 grid grid-cols-2 gap-10 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#3d3d3a] mb-5">
                  {col.heading}
                </h2>
                <ul className="space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-[13px] text-[#5e5d59] hover:text-[#b0aea5] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-[#232320]" />

        {/* Bottom row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#3d3d3a]">
            &copy; {new Date().getFullYear()} SEO Hub Analyzer
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
