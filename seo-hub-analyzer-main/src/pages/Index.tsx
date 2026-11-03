import Hero from "@/components/seohub/Hero";
import VisualPreview from "@/components/seohub/VisualPreview";
import Features from "@/components/seohub/Features";
import HowItWorks from "@/components/seohub/HowItWorks";
import BlogSection from "@/components/seohub/BlogSection";
import Pricing from "@/components/seohub/Pricing";
import FinalCta from "@/components/seohub/FinalCta";
import Footer from "@/components/seohub/Footer";
import MetaTags from "@/seo/MetaTags";
import { PAGE_META } from "@/seo/pageMeta";
import { organizationSchema, websiteSchema, softwareApplicationSchema } from "@/seo/schemas";

const Index = () => {
  const meta = PAGE_META.home;
  return (
    <main className="min-h-screen font-sans bg-[#f5f4ed]">
      <MetaTags
        title={meta.title}
        description={meta.description}
        canonical={meta.canonical}
        ogImage={meta.ogImage}
        schema={[organizationSchema, websiteSchema, softwareApplicationSchema]}
      />
      <Hero />
      <VisualPreview />
      <Features />
      <HowItWorks />
      <BlogSection />
      <Pricing />
      <FinalCta />
      <Footer />
    </main>
  );
};

export default Index;
