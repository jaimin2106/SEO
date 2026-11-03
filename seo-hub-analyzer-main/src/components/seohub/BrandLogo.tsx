interface BrandLogoProps {
  variant?: "dark" | "light";
  showWordmark?: boolean;
  className?: string;
  iconClassName?: string;
}

const BrandLogo = ({
  variant = "dark",
  showWordmark = true,
  className = "",
  iconClassName = "",
}: BrandLogoProps) => {
  const primary = variant === "light" ? "#faf9f5" : "#141413";
  const secondary = variant === "light" ? "#b0aea5" : "#5e5d59";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className={`h-10 w-10 shrink-0 ${iconClassName}`}
      >
        <circle cx="16" cy="16" r="9.5" fill="none" stroke="#c96442" strokeWidth="3" />
        <path
          d="M23.2 23.2L31 31"
          fill="none"
          stroke={primary}
          strokeLinecap="round"
          strokeWidth="3.25"
        />
        <rect x="10.5" y="15.5" width="3.2" height="6" rx="1.2" fill={primary} />
        <rect x="15.7" y="12.8" width="3.2" height="8.7" rx="1.2" fill={primary} />
        <rect x="20.9" y="10" width="3.2" height="11.5" rx="1.2" fill={primary} />
      </svg>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className="font-serif text-[1.15rem] font-medium tracking-[-0.03em]"
            style={{ color: primary }}
          >
            SEO Hub
          </span>
          <span
            className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.28em]"
            style={{ color: secondary }}
          >
            Analyzer
          </span>
        </span>
      )}
    </span>
  );
};

export default BrandLogo;
