import { motion } from "framer-motion";
import Footer from "@/components/seohub/Footer";

const sections = [
  { title: "Acceptance of Terms", body: "By accessing SEO Hub Analyzer, you agree to these Terms of Service. If you do not agree, please do not use the service." },
  { title: "Service Description", body: "SEO Hub Analyzer provides automated technical SEO analysis, performance auditing, and AI-powered remediation recommendations. Results are informational and do not constitute professional SEO consulting." },
  { title: "Account Responsibilities", body: "You are responsible for maintaining the security of your account credentials. You may not share your account with others or use the service to scan websites you do not own or have authorization to audit." },
  { title: "Acceptable Use", body: "You may not use the service to scan websites with malicious intent, disrupt third-party systems, or violate applicable laws. Automated or bulk scanning beyond your plan limits is prohibited." },
  { title: "Subscriptions & Billing", body: "Paid plans are billed monthly via Stripe. Cancellations take effect at the end of the current billing cycle. We do not offer refunds for partial months." },
  { title: "Disclaimer of Warranties", body: "The service is provided 'as is' without warranties of any kind. We do not guarantee that scan results are complete, accurate, or current. Rankings and SEO outcomes cannot be guaranteed." },
  { title: "Limitation of Liability", body: "To the maximum extent permitted by law, SEO Hub Analyzer's liability is limited to the amount you paid in the three months preceding any claim." },
  { title: "Changes to Terms", body: "We may update these terms with 30 days notice. Continued use after changes take effect constitutes acceptance of the updated terms." },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      <section className="pt-[120px] pb-20 border-b border-[#e8e6dc]">
        <div className="container-page max-w-[740px]">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-4">Legal</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="font-serif font-medium text-[44px] leading-[1.1] text-[#141413] mb-4">Terms of Service</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-[14px] text-[#87867f]">Last updated: January 2025</motion.p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-page max-w-[740px]">
          <div className="space-y-10">
            {sections.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-serif font-medium text-[22px] text-[#141413] mb-3">{s.title}</h2>
                <p className="text-[15px] leading-[1.8] text-[#5e5d59]">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
