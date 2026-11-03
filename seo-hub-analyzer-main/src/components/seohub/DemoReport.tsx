import { CheckCircle2, AlertTriangle, Zap, Image as ImageIcon, Link2 } from "lucide-react";

const issues = [
  { icon: AlertTriangle, label: "Missing meta description on /pricing", level: "warn" },
  { icon: ImageIcon, label: "12 images without alt attributes", level: "warn" },
  { icon: Link2, label: "3 broken internal links found", level: "error" },
  { icon: CheckCircle2, label: "Robots.txt configured correctly", level: "ok" },
];

const DemoReport = () => {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-accent text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">acme.com</p>
              <p className="text-xs text-muted-foreground">Audited just now · 23 pages</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2 py-1 text-xs font-medium text-success-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Healthy
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4 sm:gap-4">
          <Stat label="SEO Score" value="82" suffix="/100" accent />
          <Stat label="Issues" value="14" />
          <Stat label="LCP" value="1.8" suffix="s" />
          <Stat label="Mobile" value="96" suffix="/100" />
        </div>

        {/* Issues */}
        <div className="rounded-lg border border-border">
          <div className="border-b border-border px-4 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Top fixes
            </p>
          </div>
          <ul className="divide-y divide-border">
            {issues.map((it, i) => {
              const Icon = it.icon;
              const color =
                it.level === "ok"
                  ? "text-success-foreground"
                  : it.level === "error"
                  ? "text-destructive"
                  : "text-label";
              return (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  <span className="flex-1 text-sm text-foreground">{it.label}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">View</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Stat = ({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) => (
  <div className="rounded-lg border border-border bg-background p-3.5 sm:p-4">
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p
      className={`mt-1.5 text-2xl font-semibold tracking-tight sm:text-[28px] ${
        accent ? "text-primary" : "text-foreground"
      }`}
    >
      {value}
      {suffix && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{suffix}</span>}
    </p>
  </div>
);

export default DemoReport;