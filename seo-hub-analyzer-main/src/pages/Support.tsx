// src/pages/Support.tsx
// Public support page — 3-step wizard that stores tickets in Supabase with full context

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Navbar from '@/components/seohub/Navbar';
import Footer from '@/components/seohub/Footer';
import {
  LifeBuoy, MessageSquare, Zap, BookOpen, ArrowRight,
  Send, Loader2, CheckCircle2, ChevronDown, ChevronUp,
  CreditCard, AlertTriangle, FileText, Headphones, Link2,
  Bug, Star, User, ChevronRight, ChevronLeft, ScanSearch, FileDown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
type TicketType =
  | 'billing' | 'technical' | 'seo_report' | 'scan_failure'
  | 'pdf_export' | 'account' | 'feature_request' | 'bug_report' | 'general';

type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

// ─── Constants ────────────────────────────────────────────────────
const TICKET_CATEGORIES: {
  value: TicketType; label: string; icon: React.FC<any>; desc: string; color: string; bg: string;
}[] = [
  { value: 'bug_report',      label: 'Bug Report',         icon: Bug,           desc: 'Something is broken',               color: 'text-rose-500',   bg: 'bg-rose-50' },
  { value: 'technical',       label: 'Technical Issue',    icon: AlertTriangle, desc: 'Errors or broken features',          color: 'text-red-500',    bg: 'bg-red-50' },
  { value: 'billing',         label: 'Billing & Payments', icon: CreditCard,    desc: 'Charges, refunds, plan changes',     color: 'text-amber-500',  bg: 'bg-amber-50' },
  { value: 'seo_report',      label: 'SEO Report',         icon: FileText,      desc: 'Questions about your report',        color: 'text-blue-500',   bg: 'bg-blue-50' },
  { value: 'scan_failure',    label: 'Scan Failure',       icon: ScanSearch,    desc: 'A scan didn\'t complete',            color: 'text-orange-500', bg: 'bg-orange-50' },
  { value: 'pdf_export',      label: 'PDF Export',         icon: FileDown,      desc: 'PDF download didn\'t work',          color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { value: 'feature_request', label: 'Feature Request',    icon: Star,          desc: 'Suggest an improvement',             color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'account',         label: 'Account Issue',      icon: User,          desc: 'Login, profile, data access',        color: 'text-cyan-500',   bg: 'bg-cyan-50' },
  { value: 'general',         label: 'General Support',    icon: Headphones,    desc: 'Anything else',                      color: 'text-[#c96442]',  bg: 'bg-orange-50' },
];

const FAQ_ITEMS = [
  { q: 'How long does a full SEO scan take?',    a: 'Most scans complete in 30–90 seconds. Large sites may take up to 3 minutes. You\'ll see a real-time progress indicator on your dashboard.' },
  { q: 'How do I upgrade my plan?',              a: 'Log in to your dashboard and click "Upgrade" in the top nav. You\'ll be taken to the billing portal where you can choose Pro or Scale.' },
  { q: 'Can I export my report as a PDF?',       a: 'PDF export is available on Pro and Scale plans. Open any completed report and click "Export PDF" in the top-right corner.' },
  { q: 'What happens to my credits each month?', a: 'Credits reset at the beginning of each billing cycle. Unused credits do not roll over, but we notify you 3 days before expiry.' },
  { q: 'How is AI visibility scored?',           a: 'We analyse your page\'s semantic structure, entity clarity, and structured data to estimate how likely your content is to appear in AI-generated answers (Perplexity, ChatGPT, Gemini).' },
  { q: 'Can I cancel anytime?',                  a: 'Yes — cancel from the billing page at any time. Your plan stays active until the end of the current billing period with no prorated refunds.' },
];

const QUICK_LINKS = [
  { label: 'Documentation', href: '/docs',         icon: BookOpen,      color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200' },
  { label: 'API Reference',  href: '/api-reference', icon: Zap,           color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200' },
  { label: 'Blog & Guides',  href: '/blog',          icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50  border-purple-200' },
];

const PRIORITY_CFG = {
  low:    { label: 'Low',    ring: 'border-gray-300  bg-gray-50  text-gray-600'  },
  normal: { label: 'Normal', ring: 'border-blue-300  bg-blue-50  text-blue-700'  },
  high:   { label: 'High',   ring: 'border-amber-300 bg-amber-50 text-amber-700' },
  urgent: { label: 'Urgent', ring: 'border-red-300   bg-red-50   text-red-700'   },
};

const stepVariants = {
  enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -50 : 50, opacity: 0 }),
};

// ─── Page ─────────────────────────────────────────────────────────
const Support: React.FC = () => (
  <div className="min-h-screen bg-[#f5f4ed] font-sans">
    <Navbar />

    {/* Hero Banner */}
    <div className="bg-[#141413] pt-32 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(to right,#30302e 1px,transparent 1px),linear-gradient(to bottom,#30302e 1px,transparent 1px)', backgroundSize: '4rem 4rem' }} />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#c96442]/10 blur-[140px] pointer-events-none" />
      <div className="container-page relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#c96442]/10 border border-[#c96442]/20 px-4 py-1.5 text-[12px] font-semibold text-[#c96442] mb-7 uppercase tracking-wider">
            <LifeBuoy className="h-3.5 w-3.5" /> Support Center
          </span>
          <h1 className="font-serif text-[52px] sm:text-[68px] font-medium leading-[1.05] tracking-tight text-[#faf9f5] mb-5">
            How can we help?
          </h1>
          <p className="text-[18px] text-[#87867f] max-w-[38rem] mx-auto leading-relaxed">
            Browse answers to common questions, or raise a ticket — our team responds within 24 hours.
          </p>
        </motion.div>
      </div>
    </div>

    {/* Content */}
    <div className="container-page py-20 max-w-[1120px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16 items-start">

        {/* Left — Wizard */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#87867f] mb-8">Submit a ticket</p>
          <TicketWizard />
        </section>

        {/* Right — sticky sidebar */}
        <aside className="space-y-10 lg:sticky lg:top-28">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#87867f] mb-5">Resources</p>
            <div className="space-y-3">
              {QUICK_LINKS.map(ql => (
                <motion.div key={ql.label} whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Link to={ql.href}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border ${ql.bg} group`}>
                    <ql.icon className={`h-4 w-4 ${ql.color} shrink-0`} strokeWidth={1.75} />
                    <span className="text-[13px] font-semibold text-[#141413]">{ql.label}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#87867f] mb-5">Common Questions</p>
            <FaqAccordion />
          </div>
        </aside>
      </div>
    </div>

    <Footer />
  </div>
);

// ─── Ticket Wizard ────────────────────────────────────────────────
interface FormState {
  type: TicketType | '';
  subject: string;
  description: string;
  pageUrl: string;
  priority: TicketPriority;
  name: string;
  email: string;
}

const INITIAL_FORM: FormState = {
  type: '', subject: '', description: '', pageUrl: '',
  priority: 'normal', name: '', email: '',
};

const TicketWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  // Pre-fill session user data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setForm(p => ({
          ...p,
          email: p.email || session.user.email || '',
          name: p.name || session.user.user_metadata?.full_name || '',
        }));
      }
    });
  }, []);

  const go = (next: number) => { setDir(next > step ? 1 : -1); setStep(next); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.email.includes('@')) {
      toast.error('Please provide a valid name and email address.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      // Collect browser context automatically
      const browserInfo = [
        navigator.userAgent,
        `Screen: ${window.screen.width}x${window.screen.height}`,
        `Lang: ${navigator.language}`,
      ].join(' | ');

      const payload = {
        user_id: userId,
        type: form.type || 'general',
        status: 'open',
        priority: form.priority,
        subject: form.subject.trim(),
        description: form.description.trim(),
        reporter_name: form.name.trim(),
        reporter_email: form.email.trim().toLowerCase(),
        page_url: form.pageUrl.trim() || null,
        browser_info: browserInfo,
      };

      let query = supabase.from('support_tickets').insert(payload);
      
      // Only request the inserted row back if the user is authenticated. 
      // Otherwise Postgres throws an RLS violation on the RETURNING clause since anon users have no SELECT access.
      if (userId) {
        query = query.select('id').single() as any;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message);
      }

      setTicketId((data as { id?: string } | null)?.id ?? null);
      go(3);
    } catch (err: any) {
      console.error('Ticket submit error:', err);
      toast.error(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const STEP_LABELS = ['Category', 'Details', 'Contact'];

  return (
    <div className="bg-white rounded-2xl border border-[#e8e6dc] shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Progress bar */}
      {step < 3 && (
        <div className="px-8 pt-7 pb-6 border-b border-[#e8e6dc] bg-[#faf9f5]">
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-200 ${
                    i < step  ? 'border-[#c96442] bg-[#c96442] text-white'
                    : i === step ? 'border-[#141413] bg-[#141413] text-white'
                    : 'border-[#e8e6dc] bg-white text-[#b0aea5]'
                  }`}>
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-[13px] font-semibold hidden sm:block transition-colors ${i === step ? 'text-[#141413]' : i < step ? 'text-[#c96442]' : 'text-[#b0aea5]'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-4 rounded-full transition-colors duration-300 ${i < step ? 'bg-[#c96442]' : 'bg-[#e8e6dc]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="p-8">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div key={step} custom={dir} variants={stepVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}>
            {step === 0 && <StepCategory selected={form.type} onSelect={t => { setForm(p => ({ ...p, type: t })); go(1); }} />}
            {step === 1 && <StepDetails   form={form} setForm={setForm} onBack={() => go(0)} onNext={() => go(2)} />}
            {step === 2 && <StepContact   form={form} setForm={setForm} onBack={() => go(1)} onSubmit={handleSubmit} submitting={submitting} />}
            {step === 3 && <StepSuccess   email={form.email} ticketId={ticketId} onReset={() => { setForm(INITIAL_FORM); setTicketId(null); go(0); }} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Step 0: Category ─────────────────────────────────────────────
const StepCategory: React.FC<{ selected: TicketType | ''; onSelect: (t: TicketType) => void }> = ({ selected, onSelect }) => (
  <div>
    <h3 className="text-[22px] font-bold text-[#141413] mb-1.5">What do you need help with?</h3>
    <p className="text-[14px] text-[#87867f] mb-7">Click the category that best matches your issue — we'll ask the right follow-up questions.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {TICKET_CATEGORIES.map(cat => (
        <motion.button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all group ${
            selected === cat.value
              ? 'border-[#141413] bg-[#141413]'
              : 'border-[#e8e6dc] bg-white hover:border-[#141413]/40 hover:shadow-sm'
          }`}
        >
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${selected === cat.value ? 'bg-white/15' : cat.bg}`}>
            <cat.icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${selected === cat.value ? 'text-white' : cat.color}`} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className={`text-[13px] font-bold leading-tight ${selected === cat.value ? 'text-white' : 'text-[#141413]'}`}>{cat.label}</p>
            <p className={`text-[11px] mt-0.5 leading-snug ${selected === cat.value ? 'text-white/55' : 'text-[#87867f]'}`}>{cat.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

// ─── Step 1: Issue Details ────────────────────────────────────────
const StepDetails: React.FC<{ form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>; onBack: () => void; onNext: () => void }> = ({ form, setForm, onBack, onNext }) => {
  const cat = TICKET_CATEGORIES.find(c => c.value === form.type);
  const canContinue = form.subject.trim().length >= 5 && form.description.trim().length >= 15;

  return (
    <div className="space-y-5">
      {/* Selected category badge */}
      {cat && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cat.bg} border-current/20`}>
          <cat.icon className={`h-4 w-4 ${cat.color}`} strokeWidth={1.75} />
          <span className={`text-[12px] font-bold ${cat.color}`}>{cat.label}</span>
        </div>
      )}

      <div>
        <h3 className="text-[22px] font-bold text-[#141413] mb-1">Describe the issue</h3>
        <p className="text-[14px] text-[#87867f]">The more detail you provide, the faster we can resolve it.</p>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87867f] mb-2">
          Subject <span className="text-[#c96442]">*</span>
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
          placeholder={cat?.value === 'bug_report' ? 'e.g. Dashboard crashes on mobile Safari' : 'Brief summary of your issue'}
          className="w-full bg-[#faf9f5] border-2 border-[#e8e6dc] text-[#141413] placeholder-[#b0aea5] px-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#141413] focus:bg-white transition-all"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87867f] mb-2">
          Full Description <span className="text-[#c96442]">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder={
            cat?.value === 'bug_report'
              ? '1. What you were doing\n2. What happened\n3. What you expected to happen\n4. Steps to reproduce'
              : cat?.value === 'technical'
              ? 'Describe the error, any error messages shown, and the steps to reproduce...'
              : 'Tell us what happened and what help you need...'
          }
          rows={7}
          className="w-full bg-[#faf9f5] border-2 border-[#e8e6dc] text-[#141413] placeholder-[#b0aea5] px-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#141413] focus:bg-white transition-all resize-none leading-relaxed"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-[#b0aea5]">Min. 15 characters</span>
          <span className={`text-[11px] font-medium transition-colors ${form.description.length >= 15 ? 'text-emerald-500' : 'text-[#b0aea5]'}`}>
            {form.description.length} / 2000
          </span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87867f] mb-2">
          Page URL <span className="text-[#87867f] font-normal normal-case tracking-normal">(optional — helps us reproduce faster)</span>
        </label>
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b0aea5]" />
          <input
            type="url"
            value={form.pageUrl}
            onChange={e => setForm(p => ({ ...p, pageUrl: e.target.value }))}
            placeholder="https://seohub.com/report/..."
            className="w-full bg-[#faf9f5] border-2 border-[#e8e6dc] text-[#141413] placeholder-[#b0aea5] pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#141413] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87867f] mb-2.5">Priority</label>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(PRIORITY_CFG) as [TicketPriority, { label: string; ring: string }][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setForm(p => ({ ...p, priority: key }))}
              className={`px-4 py-2 rounded-xl border-2 text-[13px] font-bold transition-all ${
                form.priority === key
                  ? cfg.ring
                  : 'border-[#e8e6dc] text-[#b0aea5] bg-white hover:border-[#141413]/30 hover:text-[#141413]'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#e8e6dc] text-[14px] font-semibold text-[#87867f] hover:border-[#141413] hover:text-[#141413] transition-all">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <motion.button
          onClick={() => {
            if (!canContinue) {
              if (form.subject.trim().length < 5) toast.error("Subject must be at least 5 characters.");
              else if (form.description.trim().length < 15) toast.error("Description must be at least 15 characters.");
              return;
            }
            onNext();
          }}
          whileHover={canContinue ? { scale: 1.01 } : {}}
          whileTap={canContinue ? { scale: 0.98 } : {}}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all ${
            canContinue 
              ? 'bg-[#141413] text-white' 
              : 'bg-[#e8e6dc] text-[#87867f] opacity-70 cursor-not-allowed'
          }`}
        >
          Continue <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
};

// ─── Step 2: Contact Info ─────────────────────────────────────────
const StepContact: React.FC<{
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}> = ({ form, setForm, onBack, onSubmit, submitting }) => {
  const canSubmit = form.name.trim().length >= 2 && form.email.includes('@') && form.email.includes('.');

  const cat = TICKET_CATEGORIES.find(c => c.value === form.type);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[22px] font-bold text-[#141413] mb-1">Your contact details</h3>
        <p className="text-[14px] text-[#87867f]">We'll reply to this email within 24 hours.</p>
      </div>

      {/* Ticket summary */}
      <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-xl px-5 py-4 space-y-2">
        <p className="text-[11px] font-bold text-[#87867f] uppercase tracking-wider mb-2">Your ticket</p>
        <div className="flex items-start gap-3">
          {cat && (
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cat.bg}`}>
              <cat.icon className={`h-4 w-4 ${cat.color}`} strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-[#141413] truncate">{form.subject}</p>
            <p className="text-[12px] text-[#87867f] mt-0.5">{cat?.label} · {PRIORITY_CFG[form.priority].label} priority</p>
          </div>
        </div>
        {form.description && (
          <p className="text-[12px] text-[#87867f] line-clamp-2 leading-relaxed border-t border-[#e8e6dc] pt-2 mt-2">
            {form.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87867f] mb-2">
            Full Name <span className="text-[#c96442]">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Jane Smith"
            autoComplete="name"
            className="w-full bg-[#faf9f5] border-2 border-[#e8e6dc] text-[#141413] placeholder-[#b0aea5] px-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#141413] focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87867f] mb-2">
            Email Address <span className="text-[#c96442]">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="jane@company.com"
            autoComplete="email"
            className="w-full bg-[#faf9f5] border-2 border-[#e8e6dc] text-[#141413] placeholder-[#b0aea5] px-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#141413] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#e8e6dc] text-[14px] font-semibold text-[#87867f] hover:border-[#141413] hover:text-[#141413] transition-all">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <motion.button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          whileHover={canSubmit && !submitting ? { scale: 1.01 } : {}}
          whileTap={canSubmit && !submitting ? { scale: 0.98 } : {}}
          className="flex-1 flex items-center justify-center gap-2.5 bg-[#c96442] hover:bg-[#b05638] text-white px-6 py-3 rounded-xl text-[14px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_24px_rgba(201,100,66,0.25)]"
        >
          {submitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
            : <><Send className="h-4 w-4" /> Send Ticket</>
          }
        </motion.button>
      </div>

      <p className="text-[11px] text-[#b0aea5] text-center">
        By submitting you agree to our{' '}
        <a href="/privacy" className="underline hover:text-[#87867f] transition-colors">Privacy Policy</a>.
        {' '}We automatically collect your browser info to help resolve the issue faster.
      </p>
    </div>
  );
};

// ─── Step 3: Success ──────────────────────────────────────────────
const StepSuccess: React.FC<{ email: string; ticketId: string | null; onReset: () => void }> = ({ email, ticketId, onReset }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
    className="text-center py-10">
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-200"
    >
      <CheckCircle2 className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
    </motion.div>

    <h3 className="text-[28px] font-serif font-medium text-[#141413] mb-3">Ticket submitted!</h3>
    <p className="text-[15px] text-[#87867f] max-w-sm mx-auto leading-relaxed mb-2">
      We've received your message and will reply to <span className="font-bold text-[#141413]">{email}</span> within 24 hours.
    </p>
    {ticketId && (
      <p className="text-[12px] font-mono text-[#b0aea5] mb-1 bg-[#f5f4ed] inline-block px-3 py-1 rounded-lg">
        Ticket ID: {ticketId.slice(0, 8).toUpperCase()}
      </p>
    )}
    <p className="text-[13px] text-[#b0aea5] mt-3 mb-10">Keep this ID handy if you need to follow up.</p>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <button onClick={onReset}
        className="px-6 py-3 rounded-xl border-2 border-[#e8e6dc] text-[14px] font-semibold text-[#141413] hover:bg-[#f5f4ed] transition-all">
        Submit another ticket
      </button>
      <Link to="/"
        className="px-6 py-3 rounded-xl bg-[#141413] text-white text-[14px] font-semibold hover:bg-[#2a2926] transition-all flex items-center gap-2">
        Back to Home <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </motion.div>
);

// ─── FAQ Accordion ────────────────────────────────────────────────
const FaqAccordion: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-[#e8e6dc]">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="py-4">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-start justify-between gap-3 text-left">
            <span className="text-[14px] font-semibold text-[#141413] leading-snug">{item.q}</span>
            <span className="shrink-0 mt-0.5">
              {open === i ? <ChevronUp className="h-4 w-4 text-[#87867f]" /> : <ChevronDown className="h-4 w-4 text-[#87867f]" />}
            </span>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <p className="pt-3 text-[13px] leading-[1.75] text-[#87867f]">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default Support;
