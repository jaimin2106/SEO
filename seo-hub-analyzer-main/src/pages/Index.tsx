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
    <>
      <MetaTags
        title={meta.title}
        description={meta.description}
        canonical={meta.canonical}
        ogImage={meta.ogImage}
        ogTitle={meta.ogTitle}
        ogDescription={meta.ogDescription}
        twitterCard="summary_large_image"
        schema={[organizationSchema, websiteSchema, softwareApplicationSchema]}
      />
      <main className="min-h-screen font-sans bg-[#f5f4ed]">
        <Hero />
        <VisualPreview />
        <Features />
        <HowItWorks />
        <BlogSection />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
};

export default Index;
