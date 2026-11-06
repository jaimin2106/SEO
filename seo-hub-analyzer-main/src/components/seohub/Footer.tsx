
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

import BrandLogo from "./BrandLogo";

const footerColumns = [
  {
    heading: "Product",
    links: [
      { label: "Home", to: "/" },
      { label: "Overview", to: "/overview" },
      { label: "Capabilities", to: "/capabilities" },
      { label: "Workflow", to: "/workflow" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Sample report", to: "/sample-report" },
      { label: "Documentation", to: "/docs" },
      { label: "API reference", to: "/api-reference" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog & insights", to: "/blog" },
      { label: "Case studies", to: "/case-studies" },
      { label: "Support", to: "/support" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms of service", to: "/terms" },
    ],
  },
] as const;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#30302e] bg-[#141413] text-[#faf9f5]">

      {/* Main footer */}
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_2.9fr] lg:gap-16">

          {/* Brand and description */}
          <div className="max-w-[350px]">

            <Link
              to="/"
              aria-label="SEO Hub Analyzer home"
              className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442] focus-visible:ring-offset-4 focus-visible:ring-offset-[#141413]"
            >
              <BrandLogo
                variant="light"
                className="gap-2.5"
                iconClassName="h-9 w-9"
              />
            </Link>

            <p className="mt-7 text-[14px] leading-[1.9] text-[#aaa79e]">
              Understand your website beyond rankings. Analyze technical
              SEO, evaluate performance signals, and turn website findings
              into practical improvements.
            </p>

            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#d18a64] transition-colors hover:text-[#f0b08e]"
            >
              Analyze your website
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#77746c]">
              Technical SEO intelligence
            </p>
          </div>

          {/* Navigation columns */}
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8"
          >
            {footerColumns.map((column) => (
              <div key={column.heading}>

                <h2 className="mb-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d18a64]">
                  {column.heading}
                </h2>

                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.to}>

                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1.5 text-[13px] leading-relaxed text-[#aaa79e] transition-colors duration-200 hover:text-[#faf9f5] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]"
                      >
                        <span>{link.label}</span>

                        <ChevronRight
                          aria-hidden="true"
                          className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </Link>

                    </li>
                  ))}
                </ul>

              </div>
            ))}
          </nav>

        </div>

        {/* Featured navigation strip */}
        <div className="mt-16 flex flex-col gap-5 border-y border-[#30302e] py-7 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-[14px] font-medium text-[#faf9f5]">
              Explore the platform
            </p>

            <p className="mt-1 text-[12px] text-[#88857c]">
              Understand the product before starting your website analysis.
            </p>
          </div>

          <Link
            to="/capabilities"
            className="inline-flex shrink-0 items-center gap-2 text-[12px] font-semibold text-[#d18a64] transition-colors hover:text-[#f0b08e]"
          >
            Explore capabilities
            <ArrowUpRight className="h-4 w-4" />
          </Link>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 pt-8 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[11px] text-[#858279]">
            © {currentYear} SEO Hub Analyzer. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

            <Link
              to="/privacy"
              className="text-[11px] text-[#858279] transition-colors hover:text-[#faf9f5]"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="text-[11px] text-[#858279] transition-colors hover:text-[#faf9f5]"
            >
              Terms
            </Link>

            <Link
              to="/support"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#d18a64] transition-colors hover:text-[#f0b08e]"
            >
              Get support
              <ArrowUpRight className="h-3 w-3" />
            </Link>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
