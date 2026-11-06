
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bug,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  FileDown,
  FileText,
  Headphones,
  LifeBuoy,
  Link2,
  Loader2,
  MessageCircle,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/seohub/Navbar";
import Footer from "@/components/seohub/Footer";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TicketType =
  | "billing"
  | "technical"
  | "seo_report"
  | "scan_failure"
  | "pdf_export"
  | "account"
  | "feature_request"
  | "bug_report"
  | "general";

type TicketPriority = "low" | "normal" | "high" | "urgent";

interface FormState {
  type: TicketType | "";
  subject: string;
  description: string;
  pageUrl: string;
  priority: TicketPriority;
  name: string;
  email: string;
}

interface Category {
  value: TicketType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  background: string;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const INITIAL_FORM: FormState = {
  type: "",
  subject: "",
  description: "",
  pageUrl: "",
  priority: "normal",
  name: "",
  email: "",
};

const CATEGORIES: Category[] = [
  {
    value: "technical",
    label: "Technical issue",
    description: "Something isn't working correctly.",
    icon: AlertCircle,
    color: "text-[#c96442]",
    background: "bg-[#f8eee9]",
  },
  {
    value: "scan_failure",
    label: "Scan failure",
    description: "A website scan failed or got stuck.",
    icon: Zap,
    color: "text-[#c96442]",
    background: "bg-[#f8eee9]",
  },
  {
    value: "billing",
    label: "Billing & payments",
    description: "Plans, charges, credits, or payments.",
    icon: CreditCard,
    color: "text-[#8a713e]",
    background: "bg-[#f5f0e4]",
  },
  {
    value: "seo_report",
    label: "SEO report",
    description: "Questions about audit findings or scores.",
    icon: FileText,
    color: "text-[#657b9c]",
    background: "bg-[#edf1f7]",
  },
  {
    value: "pdf_export",
    label: "PDF export",
    description: "Report downloads or PDF problems.",
    icon: FileDown,
    color: "text-[#756a9b]",
    background: "bg-[#f0edf7]",
  },
  {
    value: "account",
    label: "Account & access",
    description: "Login, profile, or account access.",
    icon: User,
    color: "text-[#577d78]",
    background: "bg-[#edf4f1]",
  },
  {
    value: "bug_report",
    label: "Report a bug",
    description: "Report unexpected behaviour.",
    icon: Bug,
    color: "text-[#a35c62]",
    background: "bg-[#f7edee]",
  },
  {
    value: "feature_request",
    label: "Feature request",
    description: "Suggest a feature or improvement.",
    icon: Sparkles,
    color: "text-[#92704d]",
    background: "bg-[#f6f0e8]",
  },
  {
    value: "general",
    label: "Something else",
    description: "Other questions and general support.",
    icon: Headphones,
    color: "text-[#c96442]",
    background: "bg-[#f8eee9]",
  },
];

const PRIORITIES: {
  value: TicketPriority;
  label: string;
  description: string;
  style: string;
  activeStyle: string;
}[] = [
  {
    value: "low",
    label: "Low",
    description: "General question",
    style: "border-[#e8e6dc] text-[#77746c]",
    activeStyle: "border-[#77746c] bg-[#f1f0eb] text-[#44423c]",
  },
  {
    value: "normal",
    label: "Normal",
    description: "Standard request",
    style: "border-[#e8e6dc] text-[#77746c]",
    activeStyle: "border-[#657b9c] bg-[#edf1f7] text-[#506887]",
  },
  {
    value: "high",
    label: "High",
    description: "Work is affected",
    style: "border-[#e8e6dc] text-[#77746c]",
    activeStyle: "border-[#c18a42] bg-[#faf3e7] text-[#936524]",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Critical disruption",
    style: "border-[#e8e6dc] text-[#77746c]",
    activeStyle: "border-[#bf716c] bg-[#faeeee] text-[#a54d48]",
  },
];

const FAQ_ITEMS: FAQ[] = [
  {
    category: "Scanning",
    question: "How long does a website scan take?",
    answer:
      "Most scans complete in approximately 30–90 seconds. Larger websites or complex rendering requirements may take longer. You can monitor available progress from your dashboard.",
  },
  {
    category: "Credits",
    question: "What happens when I run out of credits?",
    answer:
      "You will need an eligible plan or additional available credits to initiate another scan. Your dashboard displays your remaining credit balance.",
  },
  {
    category: "Reports",
    question: "Can I export my SEO report as a PDF?",
    answer:
      "PDF export is available on eligible plans. Open a completed report and use its Export PDF action when the feature is available on your account.",
  },
  {
    category: "Billing",
    question: "How can I upgrade my subscription?",
    answer:
      "Open your account dashboard and explore the available subscription plans. Select the plan that matches your requirements and follow the billing flow.",
  },
  {
    category: "Reports",
    question: "Can I run another scan for the same website?",
    answer:
      "Yes. When a recent completed scan is detected, the application may offer you the option to open the existing report or start another scan.",
  },
  {
    category: "Account",
    question: "How do I contact the support team?",
    answer:
      "Choose the appropriate issue category on this page, describe your question, and submit your contact details. Our support team can follow up using the email address provided.",
  },
];

const RESOURCES = [
  {
    title: "Documentation",
    description: "Learn how to use the platform.",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "API reference",
    description: "Explore developer integration details.",
    href: "/api-reference",
    icon: Zap,
  },
  {
    title: "Sample report",
    description: "Understand your SEO audit output.",
    href: "/sample-report",
    icon: FileText,
  },
  {
    title: "Blog & guides",
    description: "Explore practical SEO resources.",
    href: "/blog",
    icon: MessageSquare,
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/* Animation                                                                  */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [
        number,
        number,
        number,
        number
      ],
    },
  },
};

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : 24,
  }),
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function updateFormField<K extends keyof FormState>(
  setForm: Dispatch<SetStateAction<FormState>>,
  key: K,
  value: FormState[K]
) {
  setForm((previous) => ({
    ...previous,
    [key]: value,
  }));
}

function validateOptionalUrl(value: string): boolean {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);

    return (
      ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function getCategory(value: TicketType | "") {
  return CATEGORIES.find((category) => category.value === value);
}

function getContactName(user: {
  user_metadata?: Record<string, unknown>;
}): string {
  const metadata = user.user_metadata;

  if (!metadata) return "";

  const possibleName =
    metadata.full_name ||
    metadata.name ||
    metadata.display_name;

  return typeof possibleName === "string"
    ? possibleName
    : "";
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const Support = () => {
  const [faqSearch, setFaqSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    const query = faqSearch.trim().toLowerCase();

    if (!query) return FAQ_ITEMS;

    return FAQ_ITEMS.filter((item) =>
      `${item.question} ${item.answer} ${item.category}`
        .toLowerCase()
        .includes(query)
    );
  }, [faqSearch]);

  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans text-[#141413]">
      <Navbar />

      <main className="pt-[76px]">

        {/* ============================================================ */}
        {/* HERO                                                         */}
        {/* ============================================================ */}

        <section className="relative overflow-hidden border-b border-[#30302e] bg-[#141413]">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(to right,#aaa79e 1px,transparent 1px),linear-gradient(to bottom,#aaa79e 1px,transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-40 h-[450px] w-[450px] rounded-full border border-[#c96442]/20"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-24 h-[320px] w-[320px] rounded-full border border-[#c96442]/15"
          />

          <div className="relative mx-auto max-w-[1320px] px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12 lg:pt-24">

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.12,
                  },
                },
              }}
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 border border-[#c96442]/30 bg-[#c96442]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d18a64]">
                  <LifeBuoy className="h-3.5 w-3.5" />
                  Customer support
                </span>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 grid gap-10 lg:grid-cols-[1fr_310px] lg:items-end"
              >
                <div>
                  <h1 className="max-w-[790px] font-serif text-[43px] font-medium leading-[1.08] tracking-[-0.04em] text-[#faf9f5] sm:text-[60px] lg:text-[70px]">
                    We're here to help you{" "}
                    <span className="text-[#c96442]">
                      move forward.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-[600px] text-[14px] leading-[1.9] text-[#aaa79e] sm:text-[16px]">
                    Find answers, get help with your account, or
                    tell us what's happening. We'll make sure
                    your request reaches the right place.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div>
                    <MessageCircle className="h-5 w-5 text-[#d18a64]" />

                    <p className="mt-3 text-[11px] font-semibold text-[#faf9f5]">
                      Personal support
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-[#87867f]">
                      Get help with your request.
                    </p>
                  </div>

                  <div>
                    <ShieldCheck className="h-5 w-5 text-[#d18a64]" />

                    <p className="mt-3 text-[11px] font-semibold text-[#faf9f5]">
                      Context included
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-[#87867f]">
                      Share details to speed things up.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* SUPPORT CONTENT                                              */}
        {/* ============================================================ */}

        <section className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-16">

            {/* Ticket workflow */}
            <div className="min-w-0">

              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c96442]">
                    Support request
                  </span>

                  <h2 className="mt-2 font-serif text-[29px] font-medium tracking-[-0.025em] text-[#171715] sm:text-[34px]">
                    How can we assist?
                  </h2>
                </div>

                <p className="text-[11px] text-[#89867d]">
                  Usually takes 2–3 minutes
                </p>
              </div>

              <TicketWizard />
            </div>

            {/* Right sidebar */}
            <aside className="space-y-10 lg:sticky lg:top-28">

              {/* What happens next */}
              <section>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c96442]">
                  What happens next
                </span>

                <div className="mt-6 space-y-6">

                  {[
                    {
                      number: "01",
                      title: "Submit your request",
                      description:
                        "Tell us what happened and share the details we need.",
                    },
                    {
                      number: "02",
                      title: "We review the issue",
                      description:
                        "Your request is recorded for the support team to review.",
                    },
                    {
                      number: "03",
                      title: "We get back to you",
                      description:
                        "We'll follow up using the email address you provided.",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.number}
                      className="flex gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#e1ddd3] bg-white font-mono text-[10px] font-semibold text-[#c96442]">
                        {item.number}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[13px] font-semibold text-[#272620]">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-[11px] leading-[1.8] text-[#858279]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Resources */}
              <section className="border-t border-[#e3e0d7] pt-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c96442]">
                  Self-service resources
                </span>

                <div className="mt-5 divide-y divide-[#e8e6dc] border-y border-[#e8e6dc] bg-white">
                  {RESOURCES.map((resource) => {
                    const Icon = resource.icon;

                    return (
                      <Link
                        key={resource.href}
                        to={resource.href}
                        className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#faf9f5]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#f3f1ea] text-[#77746c] transition-colors group-hover:bg-[#f8eee9] group-hover:text-[#c96442]">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-[#292822]">
                            {resource.title}
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#89867d]">
                            {resource.description}
                          </p>
                        </div>

                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-[#a7a297] transition-colors group-hover:text-[#c96442]"
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* FAQ */}
              <section className="border-t border-[#e3e0d7] pt-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c96442]">
                    Knowledge base
                  </span>

                  <h2 className="mt-2 font-serif text-[24px] font-medium text-[#171715]">
                    Common questions
                  </h2>
                </div>

                <div className="relative mt-5">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#979387]" />

                  <input
                    type="search"
                    value={faqSearch}
                    onChange={(event) =>
                      setFaqSearch(event.target.value)
                    }
                    placeholder="Search questions..."
                    aria-label="Search frequently asked questions"
                    className="h-10 w-full border border-[#e4e1d8] bg-white pl-9 pr-3 text-[11px] text-[#292822] outline-none placeholder:text-[#a09c92] focus:border-[#c96442]"
                  />
                </div>

                <div className="mt-4 divide-y divide-[#e8e6dc]">
                  {filteredFaqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0">
                          <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.13em] text-[#c96442]">
                            {faq.category}
                          </span>

                          <span className="text-[12px] font-semibold leading-[1.6] text-[#33312b]">
                            {faq.question}
                          </span>
                        </div>

                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[#89867d] transition-transform group-open:rotate-180" />
                      </summary>

                      <p className="pt-3 text-[11px] leading-[1.9] text-[#77746c]">
                        {faq.answer}
                      </p>
                    </details>
                  ))}

                  {filteredFaqs.length === 0 && (
                    <p className="py-8 text-center text-[11px] text-[#89867d]">
                      No matching questions found.
                    </p>
                  )}
                </div>
              </section>

              {/* Contact note */}
              <div className="border border-[#dedbd1] bg-[#efede5] p-5">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-[#c96442]" />

                  <h3 className="text-[12px] font-semibold text-[#292822]">
                    Still need assistance?
                  </h3>
                </div>

                <p className="mt-2 text-[11px] leading-[1.8] text-[#77746c]">
                  Submit a support request with as much relevant
                  information as possible so the team can investigate.
                </p>
              </div>

            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Ticket Wizard                                                              */
/* -------------------------------------------------------------------------- */

const TicketWizard = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");

  /* ---------------------------------------------------------------------- */
  /* Prefill contact details                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session?.user) return;

      const user = session.user;

      setForm((previous) => ({
        ...previous,
        name: previous.name || getContactName(user),
        email: previous.email || user.email || "",
      }));
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                             */
  /* ---------------------------------------------------------------------- */

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
    setSubmitError("");
  };

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    updateFormField(setForm, key, value);
  };

  const selectedCategory = getCategory(form.type);

  /* ---------------------------------------------------------------------- */
  /* Validation                                                             */
  /* ---------------------------------------------------------------------- */

  const validateDetails = (): boolean => {
    if (!form.type) {
      toast.error("Please select a support category.");
      return false;
    }

    if (form.subject.trim().length < 5) {
      toast.error("Your subject must contain at least 5 characters.");
      return false;
    }

    if (form.description.trim().length < 15) {
      toast.error("Please provide at least 15 characters of detail.");
      return false;
    }

    if (form.description.length > 2000) {
      toast.error("Your description must be under 2,000 characters.");
      return false;
    }

    if (!validateOptionalUrl(form.pageUrl)) {
      toast.error("Please enter a valid HTTP or HTTPS page URL.");
      return false;
    }

    return true;
  };

  const validateContact = (): boolean => {
    if (form.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return false;
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  /* ---------------------------------------------------------------------- */
  /* Submit ticket                                                          */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (submitting) return;

    if (!validateContact()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id ?? null;

      const browserInfo = [
        typeof navigator !== "undefined"
          ? navigator.userAgent
          : "Unavailable",
        typeof window !== "undefined"
          ? `Screen: ${window.screen.width}x${window.screen.height}`
          : "Screen: unavailable",
        typeof navigator !== "undefined"
          ? `Language: ${navigator.language}`
          : "Language: unavailable",
      ].join(" | ");

      const payload = {
        user_id: userId,
        type: form.type || "general",
        status: "open",
        priority: form.priority,
        subject: form.subject.trim(),
        description: form.description.trim(),
        reporter_name: form.name.trim(),
        reporter_email: form.email.trim().toLowerCase(),
        page_url: form.pageUrl.trim() || null,
        browser_info: browserInfo,
      };

      /*
       * Keep separate insert paths:
       * Anonymous users may have INSERT permission but no SELECT
       * permission under the support_tickets RLS policy.
       */
      if (userId) {
        const { data, error } = await supabase
          .from("support_tickets")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        setTicketId(data?.id ?? null);
      } else {
        const { error } = await supabase
          .from("support_tickets")
          .insert(payload);

        if (error) throw error;

        setTicketId(null);
      }

      setDirection(1);
      setStep(3);

      toast.success("Your support request has been submitted.");
    } catch (error) {
      console.error("Support ticket submission failed:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Please try submitting your request again.";

      setSubmitError(message);

      toast.error("We couldn't submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Reset                                                                  */
  /* ---------------------------------------------------------------------- */

  const resetWizard = () => {
    setForm(INITIAL_FORM);
    setTicketId(null);
    setSubmitError("");
    goToStep(0);
  };

  /* ---------------------------------------------------------------------- */
  /* Steps                                                                  */
  /* ---------------------------------------------------------------------- */

  const stepLabels = [
    "Topic",
    "Details",
    "Contact",
  ];

  return (
    <div className="overflow-hidden border border-[#e5e2d8] bg-white shadow-[0_8px_40px_rgba(20,20,19,0.055)]">

      {/* ================================================================ */}
      {/* PROGRESS                                                         */}
      {/* ================================================================ */}

      {step < 3 && (
        <div className="border-b border-[#e8e6dc] bg-[#faf9f5] px-5 py-5 sm:px-8 sm:py-6">

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#77746c]">
              Request process
            </p>

            <p className="text-[10px] font-semibold text-[#c96442]">
              Step {step + 1} of 3
            </p>
          </div>

          <div className="mt-5 flex items-center">
            {stepLabels.map((label, index) => {
              const completed = index < step;
              const active = index === step;

              return (
                <div
                  key={label}
                  className="flex min-w-0 flex-1 items-center"
                >
                  <div className="flex shrink-0 items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                        completed
                          ? "border-[#c96442] bg-[#c96442] text-white"
                          : active
                            ? "border-[#171715] bg-[#171715] text-white"
                            : "border-[#e3e0d7] bg-white text-[#9a968b]"
                      }`}
                    >
                      {completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        `0${index + 1}`
                      )}
                    </div>

                    <span
                      className={`hidden text-[10px] font-semibold sm:block ${
                        active
                          ? "text-[#171715]"
                          : completed
                            ? "text-[#c96442]"
                            : "text-[#9a968b]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  {index < stepLabels.length - 1 && (
                    <div
                      className={`mx-2 h-px min-w-3 flex-1 sm:mx-4 ${
                        completed
                          ? "bg-[#c96442]"
                          : "bg-[#e3e0d7]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP CONTENT                                                     */}
      {/* ================================================================ */}

      <div className="min-w-0 p-5 sm:p-8 lg:p-9">

        <AnimatePresence
          mode="wait"
          custom={direction}
        >
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
          >

            {step === 0 && (
              <StepCategory
                selected={form.type}
                onSelect={(type) => updateField("type", type)}
                onContinue={() => {
                  if (!form.type) {
                    toast.error("Please choose a support category.");
                    return;
                  }

                  goToStep(1);
                }}
              />
            )}

            {step === 1 && (
              <StepDetails
                form={form}
                setForm={setForm}
                onBack={() => goToStep(0)}
                onNext={() => {
                  if (validateDetails()) {
                    goToStep(2);
                  }
                }}
              />
            )}

            {step === 2 && (
              <StepContact
                form={form}
                setForm={setForm}
                onBack={() => goToStep(1)}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitError={submitError}
              />
            )}

            {step === 3 && (
              <StepSuccess
                email={form.email}
                ticketId={ticketId}
                onReset={resetWizard}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Step 1 — Category                                                         */
/* -------------------------------------------------------------------------- */

function StepCategory({
  selected,
  onSelect,
  onContinue,
}: {
  selected: TicketType | "";
  onSelect: (value: TicketType) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c96442]">
          Step 01
        </p>

        <h3 className="mt-3 font-serif text-[25px] font-medium tracking-[-0.02em] text-[#171715] sm:text-[29px]">
          What can we help you with?
        </h3>

        <p className="mt-3 max-w-[550px] text-[12px] leading-[1.8] text-[#858279] sm:text-[13px]">
          Select the topic closest to your issue. We'll use
          your selection to organize your support request.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Support category"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const active = selected === category.value;

          return (
            <button
              key={category.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(category.value)}
              className={`group flex min-h-[82px] items-center gap-3 border p-4 text-left transition-all duration-200 ${
                active
                  ? "border-[#171715] bg-[#171715] shadow-[0_3px_12px_rgba(0,0,0,0.08)]"
                  : "border-[#e8e6dc] bg-white hover:border-[#c96442]/60 hover:bg-[#faf9f5]"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center transition-colors ${
                  active
                    ? "bg-white/10"
                    : category.background
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${
                    active ? "text-[#e0a084]" : category.color
                  }`}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[12px] font-semibold ${
                    active ? "text-white" : "text-[#292822]"
                  }`}
                >
                  {category.label}
                </p>

                <p
                  className={`mt-1 text-[10px] leading-[1.6] ${
                    active ? "text-white/55" : "text-[#89867d]"
                  }`}
                >
                  {category.description}
                </p>
              </div>

              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  active
                    ? "border-[#c96442] bg-[#c96442] text-white"
                    : "border-[#dedbd2] text-transparent"
                }`}
              >
                <Check className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-[#eeeae2] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-[#89867d]">
          Choose one category to continue.
        </p>

        <button
          type="button"
          onClick={onContinue}
          disabled={!selected}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#171715] px-6 text-[11px] font-semibold text-white transition-colors hover:bg-[#30302e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Details                                                          */
/* -------------------------------------------------------------------------- */

function FormLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-[#6d6a62]">
      {children}

      {required && (
        <span className="ml-1 text-[#c96442]">*</span>
      )}
    </label>
  );
}

const inputClass =
  "h-11 w-full border border-[#e5e2d9] bg-[#faf9f5] px-3.5 text-[12px] text-[#24231f] outline-none transition-colors placeholder:text-[#a09c92] focus:border-[#c96442] focus:bg-white";

const textareaClass =
  "w-full resize-y border border-[#e5e2d9] bg-[#faf9f5] px-3.5 py-3 text-[12px] leading-[1.8] text-[#24231f] outline-none transition-colors placeholder:text-[#a09c92] focus:border-[#c96442] focus:bg-white";

function StepDetails({
  form,
  setForm,
  onBack,
  onNext,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const category = getCategory(form.type);
  const Icon = category?.icon;

  return (
    <div>
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c96442]">
          Step 02
        </p>

        <h3 className="mt-3 font-serif text-[25px] font-medium text-[#171715] sm:text-[29px]">
          Tell us what happened.
        </h3>

        <p className="mt-3 text-[12px] leading-[1.8] text-[#858279] sm:text-[13px]">
          Include enough detail so the support team can
          understand and investigate your request.
        </p>
      </div>

      {category && Icon && (
        <div className="mb-7 flex items-center justify-between gap-3 border border-[#e8e6dc] bg-[#faf9f5] p-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${category.background}`}>
              <Icon className={`h-4 w-4 ${category.color}`} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#292822]">
                {category.label}
              </p>

              <p className="text-[10px] text-[#89867d]">
                Selected category
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-[10px] font-semibold text-[#c96442] hover:text-[#a94f31]"
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-6">

        {/* Subject */}
        <div>
          <FormLabel required>Subject</FormLabel>

          <input
            type="text"
            value={form.subject}
            maxLength={120}
            onChange={(event) =>
              updateFormField(setForm, "subject", event.target.value)
            }
            placeholder={
              form.type === "bug_report"
                ? "e.g. Dashboard is not loading on mobile"
                : "Briefly describe your issue"
            }
            className={inputClass}
          />

          <p className="mt-1.5 text-right text-[9px] text-[#9c988e]">
            {form.subject.length}/120
          </p>
        </div>

        {/* Description */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <FormLabel required>Describe your issue</FormLabel>

            <span className="text-[9px] text-[#a09c92]">
              15–2,000 characters
            </span>
          </div>

          <textarea
            value={form.description}
            maxLength={2000}
            rows={6}
            onChange={(event) =>
              updateFormField(
                setForm,
                "description",
                event.target.value
              )
            }
            placeholder={
              form.type === "bug_report"
                ? "What were you doing when the problem occurred? What happened? What did you expect to happen?"
                : form.type === "scan_failure"
                  ? "Which website were you scanning? What happened during the scan? Was there an error message?"
                  : "Explain what happened, what you expected, and any relevant details that could help us."
            }
            className={textareaClass}
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p
              className={`text-[10px] ${
                form.description.trim().length >= 15
                  ? "text-emerald-700"
                  : "text-[#99958a]"
              }`}
            >
              {form.description.trim().length >= 15
                ? "Description looks good"
                : "A little more detail will help us."}
            </p>

            <span className="text-[10px] tabular-nums text-[#99958a]">
              {form.description.length}/2000
            </span>
          </div>
        </div>

        {/* Optional page URL */}
        <div>
          <FormLabel>
            Related page URL{" "}
            <span className="ml-1 font-normal normal-case tracking-normal text-[#99958a]">
              (optional)
            </span>
          </FormLabel>

          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#99958a]" />

            <input
              type="url"
              value={form.pageUrl}
              onChange={(event) =>
                updateFormField(setForm, "pageUrl", event.target.value)
              }
              placeholder="https://example.com/report"
              className={`${inputClass} pl-10`}
            />
          </div>

          <p className="mt-1.5 text-[10px] leading-[1.6] text-[#99958a]">
            Add the page where you experienced the problem.
          </p>
        </div>

        {/* Priority */}
        <div>
          <FormLabel>How important is this?</FormLabel>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRIORITIES.map((priority) => {
              const active = form.priority === priority.value;

              return (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() =>
                    updateFormField(
                      setForm,
                      "priority",
                      priority.value
                    )
                  }
                  aria-pressed={active}
                  className={`flex min-h-[65px] flex-col items-start justify-center border px-3 py-2 text-left transition-colors ${
                    active
                      ? priority.activeStyle
                      : `${priority.style} bg-white hover:bg-[#faf9f5]`
                  }`}
                >
                  <span className="text-[11px] font-semibold">
                    {priority.label}
                  </span>

                  <span className="mt-1 text-[9px] opacity-75">
                    {priority.description}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-[#99958a]">
            Choose urgent only when a critical issue is disrupting
            your ability to use the platform.
          </p>
        </div>

      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#eeeae2] pt-6 sm:flex-row sm:items-center sm:justify-between">

        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#e5e2d9] px-5 text-[11px] font-semibold text-[#555148] transition-colors hover:bg-[#f7f5ef]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#171715] px-6 text-[11px] font-semibold text-white transition-colors hover:bg-[#30302e]"
        >
          Continue to contact
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Contact and Review                                                */
/* -------------------------------------------------------------------------- */

function StepContact({
  form,
  setForm,
  onBack,
  onSubmit,
  submitting,
  submitError,
}: {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  onBack: () => void;
  onSubmit: (event?: FormEvent) => Promise<void>;
  submitting: boolean;
  submitError: string;
}) {
  const category = getCategory(form.type);
  const Icon = category?.icon;

  const isValid =
    form.name.trim().length >= 2 &&
    EMAIL_PATTERN.test(form.email.trim());

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      <div className="mb-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c96442]">
          Step 03
        </p>

        <h3 className="mt-3 font-serif text-[25px] font-medium text-[#171715] sm:text-[29px]">
          Where should we reach you?
        </h3>

        <p className="mt-3 text-[12px] leading-[1.8] text-[#858279] sm:text-[13px]">
          Provide your contact details and review your request
          before submitting.
        </p>
      </div>

      {/* Request summary */}
      <div className="mb-7 border border-[#e8e6dc] bg-[#faf9f5] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {category && Icon && (
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${category.background}`}>
                <Icon className={`h-4 w-4 ${category.color}`} />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#99958a]">
                Your request
              </p>

              <h4 className="mt-1 break-words text-[13px] font-semibold text-[#24231f]">
                {form.subject}
              </h4>

              <p className="mt-1 text-[10px] text-[#89867d]">
                {category?.label} · {form.priority} priority
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-[10px] font-semibold text-[#c96442] hover:text-[#a94f31]"
          >
            Edit
          </button>
        </div>

        <div className="mt-4 border-t border-[#e5e2d9] pt-3">
          <p className="whitespace-pre-wrap break-words text-[11px] leading-[1.8] text-[#77746c] line-clamp-4">
            {form.description}
          </p>
        </div>

        {form.pageUrl && (
          <p className="mt-3 break-all text-[10px] text-[#89867d]">
            Related page: {form.pageUrl}
          </p>
        )}
      </div>

      {/* Contact fields */}
      <div className="space-y-5">

        <div>
          <FormLabel required>Full name</FormLabel>

          <input
            type="text"
            value={form.name}
            autoComplete="name"
            maxLength={100}
            onChange={(event) =>
              updateFormField(setForm, "name", event.target.value)
            }
            placeholder="Your full name"
            className={inputClass}
            required
          />
        </div>

        <div>
          <FormLabel required>Email address</FormLabel>

          <input
            type="email"
            value={form.email}
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            onChange={(event) =>
              updateFormField(setForm, "email", event.target.value)
            }
            placeholder="you@company.com"
            className={inputClass}
            required
          />

          <p className="mt-2 text-[10px] text-[#99958a]">
            We'll use this email address to respond to your request.
          </p>
        </div>

      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 border border-[#f0d2ca] bg-[#fff5f1] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#c96442]" />

          <div>
            <p className="text-[11px] font-semibold text-[#9d4c35]">
              Submission failed
            </p>

            <p className="mt-1 break-words text-[10px] leading-[1.7] text-[#8a6457]">
              {submitError}
            </p>
          </div>
        </div>
      )}

      {/* Consent / privacy */}
      <div className="mt-6 border-t border-[#eeeae2] pt-5">
        <p className="text-[10px] leading-[1.8] text-[#89867d]">
          By submitting this request, you acknowledge that the
          information provided will be used to handle your support
          request in accordance with our{" "}
          <Link
            to="/privacy"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#c96442] underline underline-offset-2 hover:text-[#a94f31]"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#e5e2d9] px-5 text-[11px] font-semibold text-[#555148] transition-colors hover:bg-[#f7f5ef] disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#c96442] px-6 text-[11px] font-semibold text-white shadow-[0_5px_18px_rgba(201,100,66,0.18)] transition-colors hover:bg-[#b25538] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting request...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Submit support request
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 4 — Success                                                           */
/* -------------------------------------------------------------------------- */

function StepSuccess({
  email,
  ticketId,
  onReset,
}: {
  email: string;
  ticketId: string | null;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyTicketId = async () => {
    if (!ticketId) return;

    try {
      await navigator.clipboard.writeText(ticketId);

      setCopied(true);

      toast.success("Ticket ID copied.");
    } catch (error) {
      console.error("Could not copy ticket ID:", error);

      toast.error("Unable to copy the ticket ID.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-6 text-center sm:py-10"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
        <CheckCircle2
          className="h-8 w-8 text-emerald-700"
          strokeWidth={1.6}
        />
      </div>

      <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c96442]">
        Request received
      </p>

      <h3 className="mt-3 font-serif text-[30px] font-medium tracking-[-0.025em] text-[#171715] sm:text-[35px]">
        Thank you for reaching out.
      </h3>

      <p className="mx-auto mt-4 max-w-[440px] text-[12px] leading-[1.9] text-[#77746c] sm:text-[13px]">
        Your support request has been submitted. We will use
        the following email address to contact you:
      </p>

      <div className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 border border-[#e8e6dc] bg-[#faf9f5] px-4 py-3">
        <MessageCircle className="h-4 w-4 shrink-0 text-[#c96442]" />

        <span className="break-all text-[12px] font-semibold text-[#292822]">
          {email}
        </span>
      </div>

      {ticketId && (
        <div className="mx-auto mt-6 max-w-sm border border-[#e8e6dc] bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#99958a]">
            Ticket reference
          </p>

          <div className="mt-2 flex items-center justify-center gap-3">
            <code className="break-all text-[12px] font-semibold text-[#24231f]">
              {ticketId}
            </code>

            <button
              type="button"
              onClick={() => void copyTicketId()}
              aria-label="Copy ticket reference"
              className="shrink-0 text-[#89867d] transition-colors hover:text-[#c96442]"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-700" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto mt-8 max-w-[380px] border-t border-[#e8e6dc] pt-6">
        <p className="text-[11px] leading-[1.8] text-[#89867d]">
          Keep your ticket reference if one was provided. You can
          use it when following up about this request.
        </p>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#e2dfd6] px-5 text-[11px] font-semibold text-[#555148] transition-colors hover:bg-[#f7f5ef]"
        >
          Submit another request
        </button>

        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#171715] px-5 text-[11px] font-semibold text-white transition-colors hover:bg-[#30302e]"
        >
          Back to homepage
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export default Support;
