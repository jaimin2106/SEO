// src/components/seohub/SupportSection.tsx
// Public-facing support section on the landing page.
// Submits tickets directly to the `support_tickets` table in Supabase.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Reveal from './Reveal';
import {
  LifeBuoy, MessageSquare, Zap, BookOpen,
  Send, Loader2, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';

type TicketType = 'billing' | 'technical' | 'seo_report' | 'scan_failure' | 'pdf_export' | 'account' | 'feature_request' | 'bug_report' | 'general';

const TICKET_TYPES: { value: TicketType; label: string }[] = [
  { value: 'general',          label: 'General Support' },
  { value: 'technical',        label: 'Technical Issue' },
  { value: 'billing',          label: 'Billing & Payments' },
  { value: 'seo_report',       label: 'SEO Report Question' },
  { value: 'scan_failure',     label: 'Scan Failure' },
  { value: 'pdf_export',       label: 'PDF Export Issue' },
  { value: 'account',          label: 'Account Issue' },
  { value: 'feature_request',  label: 'Feature Request' },
  { value: 'bug_report',       label: 'Bug Report' },
];

const FAQ_ITEMS = [
  {
    q: 'How long does a full SEO scan take?',
    a: 'Most scans complete in 30–90 seconds. Large sites with hundreds of pages may take up to 3 minutes. You\'ll receive a notification when your report is ready.',
  },
  {
    q: 'How do I upgrade my plan?',
    a: 'Log into your dashboard and click "Upgrade" in the top nav bar. You\'ll be taken to the billing portal where you can choose Pro or Scale.',
  },
  {
    q: 'Can I export my report as a PDF?',
    a: 'PDF export is available on Pro and Scale plans. Open any completed report and click the "Export PDF" button in the top right corner.',
  },
  {
    q: 'What happens to my credits each month?',
    a: 'Credits reset at the beginning of each billing cycle. Unused credits do not roll over, but we notify you before expiry.',
  },
  {
    q: 'How is AI visibility scored?',
    a: 'We analyse your page\'s semantic structure, entity clarity, and structured data to estimate how likely your content is to be featured in AI-generated answers (Perplexity, ChatGPT, Gemini).',
  },
];

const SUPPORT_CHANNELS = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    desc: 'Get real-time answers from our support team.',
    cta: 'Open Chat',
    color: 'text-[#c96442]',
    bg: 'bg-[#c96442]/10 border-[#c96442]/20',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    desc: 'Step-by-step guides for every platform feature.',
    cta: 'Read Docs',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    href: '/docs',
  },
  {
    icon: Zap,
    title: 'API Reference',
    desc: 'Complete REST API docs for developers.',
    cta: 'View API',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    href: '/api-reference',
  },
];

// ─── Main Component ──────────────────────────────────────────────
const SupportSection: React.FC = () => {
  return (
    <section id="support" className="bg-[#141413] py-24 sm:py-32 relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#30302e_1px,transparent_1px),linear-gradient(to_bottom,#30302e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      <div className="container-page relative z-10">
        
        {/* Header */}
        <Reveal className="max-w-3xl mb-16">
          <span className="text-[13px] font-medium tracking-wide text-[#87867f] uppercase">
            Support Center
          </span>
          <h2 className="mt-4 text-[42px] leading-[1.1] tracking-tight text-[#faf9f5] font-serif font-medium sm:text-[56px]">
            We're here to help.
          </h2>
          <p className="mt-6 text-[18px] leading-[1.6] text-[#b0aea5] max-w-[36rem]">
            Browse answers to common questions, reach out through chat, or submit a ticket and our team will respond within 24 hours.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — FAQ + Channels */}
          <div className="space-y-10">
            {/* Support Channels */}
            <Reveal>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SUPPORT_CHANNELS.map((ch) => (
                  <motion.a
                    key={ch.title}
                    href={ch.href ?? '#'}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`flex flex-col gap-3 p-5 rounded-xl border ${ch.bg} cursor-pointer`}
                  >
                    <ch.icon className={`h-5 w-5 ${ch.color}`} strokeWidth={1.75} />
                    <div>
                      <p className="text-[14px] font-semibold text-[#faf9f5]">{ch.title}</p>
                      <p className="text-[12px] text-[#87867f] mt-1 leading-relaxed">{ch.desc}</p>
                    </div>
                    <span className={`text-[12px] font-bold ${ch.color} flex items-center gap-1 mt-auto`}>
                      {ch.cta} →
                    </span>
                  </motion.a>
                ))}
              </div>
            </Reveal>

            {/* FAQ */}
            <Reveal delayMs={100}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3d3d3a] mb-5">
                Frequently Asked Questions
              </p>
              <FaqAccordion />
            </Reveal>
          </div>

          {/* Right — Contact Form */}
          <Reveal delayMs={150}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// ─── FAQ Accordion ────────────────────────────────────────────────
const FaqAccordion: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[#2a2926]">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="py-4">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 text-left"
          >
            <span className="text-[14px] font-medium text-[#faf9f5] leading-snug">{item.q}</span>
            {open === i
              ? <ChevronUp className="h-4 w-4 text-[#87867f] shrink-0" />
              : <ChevronDown className="h-4 w-4 text-[#87867f] shrink-0" />
            }
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="pt-3 text-[14px] leading-[1.7] text-[#87867f]">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// ─── Contact Form ─────────────────────────────────────────────────
const ContactForm: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', type: 'general' as TicketType, subject: '', description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      // Look up the user_id if there's a logged in session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      // Insert into support_tickets
      const { error } = await supabase.from('support_tickets').insert({
        user_id: userId,
        type: form.type,
        status: 'open',
        priority: 'normal',
        subject: form.subject,
        description: `From: ${form.name} <${form.email}>\n\n${form.description}`,
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      toast.error('Failed to submit ticket. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-[#30302e] bg-[#1f1e1a] p-10 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-[22px] font-serif font-medium text-[#faf9f5] mb-3">Ticket submitted</h3>
        <p className="text-[14px] text-[#87867f] leading-relaxed max-w-xs mx-auto mb-8">
          We've received your message and will respond to <span className="text-[#faf9f5]">{form.email}</span> within 24 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', type: 'general', subject: '', description: '' }); }}
          className="text-[13px] font-medium text-[#c96442] hover:underline"
        >
          Submit another ticket
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#30302e] bg-[#1f1e1a] p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 rounded-xl bg-[#c96442]/15 flex items-center justify-center">
          <LifeBuoy className="h-4 w-4 text-[#c96442]" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#faf9f5]">Submit a Ticket</p>
          <p className="text-[12px] text-[#87867f]">Response within 24 hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#87867f] mb-2">
              Name <span className="text-[#c96442]">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              required
              className="w-full bg-[#141413] border border-[#30302e] text-[#faf9f5] placeholder-[#5e5d59] px-4 py-2.5 rounded-xl text-[13px] outline-none focus:border-[#c96442]/70 focus:ring-1 focus:ring-[#c96442]/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#87867f] mb-2">
              Email <span className="text-[#c96442]">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              required
              className="w-full bg-[#141413] border border-[#30302e] text-[#faf9f5] placeholder-[#5e5d59] px-4 py-2.5 rounded-xl text-[13px] outline-none focus:border-[#c96442]/70 focus:ring-1 focus:ring-[#c96442]/30 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#87867f] mb-2">
            Category
          </label>
          <select
            value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value as TicketType }))}
            className="w-full bg-[#141413] border border-[#30302e] text-[#faf9f5] px-4 py-2.5 rounded-xl text-[13px] outline-none focus:border-[#c96442]/70 focus:ring-1 focus:ring-[#c96442]/30 transition-all appearance-none"
          >
            {TICKET_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#87867f] mb-2">
            Subject <span className="text-[#c96442]">*</span>
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            placeholder="Brief description of your issue"
            required
            className="w-full bg-[#141413] border border-[#30302e] text-[#faf9f5] placeholder-[#5e5d59] px-4 py-2.5 rounded-xl text-[13px] outline-none focus:border-[#c96442]/70 focus:ring-1 focus:ring-[#c96442]/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#87867f] mb-2">
            Message
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Describe your issue in detail. Include the URL or report ID if relevant..."
            rows={5}
            className="w-full bg-[#141413] border border-[#30302e] text-[#faf9f5] placeholder-[#5e5d59] px-4 py-3 rounded-xl text-[13px] outline-none focus:border-[#c96442]/70 focus:ring-1 focus:ring-[#c96442]/30 transition-all leading-relaxed resize-none"
          />
        </div>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-2.5 bg-[#c96442] hover:bg-[#b05638] text-white px-6 py-3.5 rounded-xl text-[14px] font-semibold transition-colors disabled:opacity-60 shadow-[0_4px_20px_rgba(201,100,66,0.2)]"
        >
          {submitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
            : <><Send className="h-4 w-4" /> Send Message</>
          }
        </motion.button>

        <p className="text-[11px] text-[#5e5d59] text-center">
          By submitting, you agree to our{' '}
          <a href="/privacy" className="text-[#87867f] hover:text-[#b0aea5] underline">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
};

export default SupportSection;
