import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import BrandLogo from "./BrandLogo";
import { ArrowUpRight } from "lucide-react";

const Footer = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  const columns = [
    {
      heading: "Product",
      links: [
        { label: "Overview", to: "/overview" },
        { label: "Capabilities", to: "/capabilities" },
        { label: "Workflow", to: "/workflow" },
        { label: "Pricing", to: "/pricing" },
        { label: "Sample Report", to: "/sample-report" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Documentation", to: "/docs" },
        { label: "API Reference", to: "/api-reference" },
        { label: "Blog", to: "/blog" },
        { label: "Case Studies", to: "/case-studies" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", to: "/about" },
        { label: "Support", to: "/support" },
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
      ],
    },
  ];

  const socials = [
    { label: "X", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "LinkedIn", href: "#" },
  ];

  return (
    <footer className="bg-[#141413] border-t border-[#232320]">
      <div className="container-page py-16 sm:py-20">

        {/* Top row — Brand + nav columns */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to={sectionHref("hero")} className="inline-flex mb-6">
              <BrandLogo variant="light" className="gap-2" iconClassName="h-8 w-8" />
            </Link>
            <p className="text-[13px] leading-[1.75] text-[#5e5d59] max-w-[22rem]">
              Forensic SEO intelligence that turns website data into 
              developer-ready fixes — in under 30 seconds.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#3d3d3a] mb-5">
                {col.heading}
              </p>
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
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-[#232320]" />

        {/* Bottom row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#3d3d3a]">
            &copy; {new Date().getFullYear()} SEO Hub Analyzer
          </p>

          {/* Social links */}
          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[12px] text-[#3d3d3a] hover:text-[#87867f] transition-colors duration-200"
              >
                {s.label}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
