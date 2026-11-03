import { motion } from "framer-motion";
import Footer from "@/components/seohub/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

const sections = [
  { title: "Information We Collect", body: "We collect information you provide directly, such as your email address when creating an account. We also collect usage data including URLs you scan, scan results, and interaction patterns — all used solely to provide and improve the service." },
  { title: "How We Use Your Information", body: "Your data is used to deliver scan results, maintain your account, send product updates (if subscribed), and improve our AI analysis engine. We do not sell your data to third parties." },
  { title: "Data Retention", body: "Scan results are stored for 90 days on free plans and 12 months on Pro and Scale plans. You may delete your data at any time from your account settings." },
  { title: "Cookies", body: "We use essential cookies for session management and authentication. We do not use advertising or cross-site tracking cookies." },
  { title: "Security", body: "All data is transmitted over HTTPS. We use industry-standard encryption for data at rest. Payment processing is handled entirely by Stripe — we do not store card details." },
  { title: "Your Rights", body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@seohubanalyzer.com." },
  { title: "Contact", body: "Questions about this policy? Email privacy@seohubanalyzer.com. We respond to all privacy inquiries within 48 hours." },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#f5f4ed] font-sans">
      <section className="pt-[120px] pb-20 border-b border-[#e8e6dc]">
        <div className="container-page max-w-[740px]">
          <motion.p variants={fadeUp} initial="hidden" animate="visible" className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#87867f] mb-4">Legal</motion.p>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" className="font-serif font-medium text-[44px] leading-[1.1] text-[#141413] mb-4">Privacy Policy</motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" className="text-[14px] text-[#87867f]">Last updated: January 2025</motion.p>
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
