import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MetaTags from "@/seo/MetaTags";
import { PAGE_META } from "@/seo/pageMeta";
import {
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/seo/schemas";

describe("homepage SEO metadata", () => {
  it("renders a single canonical metadata set and valid JSON-LD", () => {
    const meta = PAGE_META.home;
    render(
      <MetaTags
        title={meta.title}
        description={meta.description}
        canonical={meta.canonical}
        ogImage={meta.ogImage}
        ogTitle={meta.ogTitle}
        ogDescription={meta.ogDescription}
        twitterCard="summary_large_image"
        schema={[organizationSchema, websiteSchema, softwareApplicationSchema]}
      />,
    );

    expect(document.title).toBe(
      "SEO Hub Analyzer – AI Website SEO Audit & Core Web Vitals",
    );
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content"))
      .toBe(meta.description);

    const canonicalTags = document.querySelectorAll('link[rel="canonical"]');
    expect(canonicalTags).toHaveLength(1);
    expect(new URL(canonicalTags[0].getAttribute("href")!).origin)
      .toBe(window.location.origin);

    expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content"))
      .toBe(meta.ogTitle);
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute("content"))
      .toBe(meta.ogDescription);
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content"))
      .toBe("summary_large_image");

    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts).toHaveLength(3);
    const schemaTypes = Array.from(jsonLdScripts).map((script) => {
      const schema: unknown = JSON.parse(script.textContent ?? "");
      expect(schema).toHaveProperty("@context", "https://schema.org");
      return (schema as { "@type": string })["@type"];
    });
    expect(schemaTypes).toEqual(["Organization", "WebSite", "SoftwareApplication"]);
  });
});
