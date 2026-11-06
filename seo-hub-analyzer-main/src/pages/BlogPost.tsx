
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Check,
  FileText,
  Shield,
  List,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Footer from "@/components/seohub/Footer";
import { supabase } from "@/lib/supabase";
import {
  BlogRenderer,
  BlogBlock,
} from "@/components/blog/BlogRenderer";
import MetaTags from "@/seo/MetaTags";
import { buildArticleSchema } from "@/seo/schemas";
import { siteUrl } from "@/lib/siteConfig";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface BlogSeoMetadata {
  seo_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_card?: string;
  schema_type?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  cover_image_alt?: string;
}

interface BlogCategorySummary {
  name: string;
  color?: string | null;
}

interface BlogAuthorSummary {
  name: string;
  avatar_url?: string | null;
  bio?: string | null;
}

interface BlogTagSummary {
  name: string;
  slug: string;
}

interface BlogPostTagRow {
  blog_tags: BlogTagSummary | BlogTagSummary[] | null;
}

interface RelatedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image?: string | null;
  published_at: string | null;
  blog_categories?: BlogCategorySummary | BlogCategorySummary[] | null;
}

interface PublishedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: BlogBlock[] | null;
  cover_image: string | null;
  published_at: string | null;
  updated_at: string | null;
  reading_time: number | null;
  seo_metadata: BlogSeoMetadata | null;
  category: BlogCategorySummary | null;
  author: BlogAuthorSummary | null;
  tags: BlogTagSummary[];
}

type ArticleHeading = Extract<
  BlogBlock,
  { type: "heading" }
>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function firstRelation<T>(
  relation: T | T[] | null | undefined
): T | null {
  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation ?? null;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<PublishedBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState<
    "not-found" | "load-error" | null
  >(null);

  const [recentBlogs, setRecentBlogs] = useState<RelatedBlog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Admin authorization                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    const checkAdminStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user || cancelled) return;

        const { data, error } = await supabase
          .from("user_roles")
          .select("role_id, admin_roles(name)")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();

        if (cancelled || error || !data) return;

        const roleRow = Array.isArray(data.admin_roles)
          ? data.admin_roles[0]
          : data.admin_roles;

        const roleName = roleRow?.name;

        if (
          roleName &&
          ["SUPER_ADMIN", "ADMIN", "SUPPORT", "ANALYST"].includes(
            roleName
          )
        ) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.warn("Failed to verify admin status:", error);
      }
    };

    void checkAdminStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Fetch published article                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      setLoading(true);
      setPostError(null);
      setPost(null);
      setRecentBlogs([]);

      try {
        const { data, error } = await supabase
          .from("blogs")
          .select(`
            *,
            blog_categories(name, color),
            blog_authors(name, avatar_url, bio),
            blog_post_tags(
              blog_tags(name, slug)
            )
          `)
          .eq("slug", slug)
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .single();

        if (cancelled) return;

        if (error || !data) {
          console.error(
            "Could not load published blog post:",
            error?.message
          );

          setPostError(
            error?.code === "PGRST116" || !data
              ? "not-found"
              : "load-error"
          );

          setLoading(false);
          return;
        }

        const article: PublishedBlog = {
          ...data,
          category: firstRelation(data.blog_categories),
          author: firstRelation(data.blog_authors),
          tags: ((data.blog_post_tags ?? []) as BlogPostTagRow[])
            .flatMap((row) => {
              const relation = firstRelation(row.blog_tags);
              return relation ? [relation] : [];
            }),
        };

        setPost(article);

        // View tracking is non-blocking.
        if (typeof navigator !== "undefined") {
          void supabase.from("blog_views").insert({
            blog_id: data.id,
            user_agent: navigator.userAgent.slice(0, 200),
            referer:
              typeof document !== "undefined"
                ? document.referrer || null
                : null,
          });
        }

        // Fetch related published articles.
        const {
          data: recent,
          error: recentError,
        } = await supabase
          .from("blogs")
          .select(`
            id,
            title,
            slug,
            excerpt,
            cover_image,
            published_at,
            blog_categories(name, color)
          `)
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(3);

        if (cancelled) return;

        if (recentError) {
          console.error(
            "Could not load related blog posts:",
            recentError.message
          );
        }

        if (recent) {
          setRecentBlogs(recent);
        }

        setLoading(false);
      } catch (error) {
        if (cancelled) return;

        console.error("Blog post request failed:", error);
        setPostError("load-error");
        setLoading(false);
      }
    };

    if (slug) {
      void fetchPost();
    } else {
      setLoading(false);
      setPostError("not-found");
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ------------------------------------------------------------------------ */
  /* Reading progress                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        const documentHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;

        const progress =
          documentHeight > 0
            ? (window.scrollY / documentHeight) * 100
            : 0;

        setScrollProgress(
          Math.min(100, Math.max(0, progress))
        );

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [post]);

  /* ------------------------------------------------------------------------ */
  /* Derived article data                                                     */
  /* ------------------------------------------------------------------------ */

  const headings = useMemo(
    () =>
      (post?.content ?? []).filter(
        (block): block is ArticleHeading =>
          block.type === "heading" && block.level === 2
      ),
    [post?.content]
  );

  const publishDate = formatDate(post?.published_at);

  const articleUrl =
    typeof window !== "undefined" && post
      ? `${window.location.origin}/blog/${post.slug}`
      : "";

  /* ------------------------------------------------------------------------ */
  /* Sharing                                                                  */
  /* ------------------------------------------------------------------------ */

  const copyArticleLink = useCallback(async () => {
    if (!articleUrl) return;

    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Could not copy article URL:", error);
    }
  }, [articleUrl]);

  const shareArticle = useCallback(
    (platform: "twitter" | "linkedin" | "facebook") => {
      if (!articleUrl || !post) return;

      const title = post.title;

      const urls = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          articleUrl
        )}&text=${encodeURIComponent(title)}`,

        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          articleUrl
        )}`,

        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          articleUrl
        )}`,
      };

      window.open(
        urls[platform],
        "_blank",
        "noopener,noreferrer,width=650,height=550"
      );
    },
    [articleUrl, post]
  );

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                            */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] px-5 pt-20 animate-pulse sm:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-10 h-4 w-28 rounded bg-[#e8e6dc]" />
          <div className="mb-6 h-4 w-36 rounded bg-[#e8e6dc]" />
          <div className="mb-4 h-12 w-4/5 rounded-lg bg-[#e8e6dc]" />
          <div className="mb-8 h-12 w-3/5 rounded-lg bg-[#e8e6dc]" />
          <div className="mb-3 h-5 w-full rounded bg-[#e8e6dc]" />
          <div className="mb-12 h-5 w-4/5 rounded bg-[#e8e6dc]" />
          <div className="aspect-video w-full rounded-xl bg-[#e8e6dc]" />
          <div className="mt-16 space-y-5">
            <div className="h-6 w-2/3 rounded bg-[#e8e6dc]" />
            <div className="h-4 w-full rounded bg-[#e8e6dc]" />
            <div className="h-4 w-11/12 rounded bg-[#e8e6dc]" />
            <div className="h-4 w-4/5 rounded bg-[#e8e6dc]" />
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error state                                                              */
  /* ------------------------------------------------------------------------ */

  if (postError || !post) {
    const notFound = postError === "not-found";

    return (
      <div className="flex min-h-screen flex-col bg-[#faf9f5] text-[#141413]">
        <MetaTags
          title={
            notFound
              ? "Article not found | SEO Hub Analyzer"
              : "Article unavailable | SEO Hub Analyzer"
          }
          description="This blog article is not available."
          noIndex
        />

        <main className="container-page flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
          <h1 className="font-serif text-3xl font-medium sm:text-4xl">
            {notFound
              ? "Article not found"
              : "Article unavailable"}
          </h1>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#5e5d59]">
            {notFound
              ? "This article may have been unpublished or moved."
              : "We could not load this article right now. Please try again later."}
          </p>

          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#c15f3c] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* SEO metadata                                                             */
  /* ------------------------------------------------------------------------ */

  const seo = post.seo_metadata;

  const seoTitle = seo?.seo_title || post.title;

  const metaDescription =
    seo?.meta_description ||
    post.excerpt ||
    "Read this article on SEO Hub Analyzer.";

  const canonicalUrl =
    seo?.canonical_url ||
    siteUrl(`/blog/${post.slug}`);

  const ogImage =
    seo?.og_image ||
    post.cover_image ||
    undefined;

  const authorName =
    post.author?.name || "SEO Hub Analyzer Team";

  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    publishedAt: post.published_at,
    modifiedAt: post.updated_at,
    authorName,
    imageUrl: post.cover_image ?? undefined,
    schemaType:
      seo?.schema_type === "Article"
        ? "Article"
        : "BlogPosting",
  });

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#faf9f5] font-sans text-[#141413]">

      {/* SEO metadata */}
      <MetaTags
        title={`${seoTitle} | SEO Hub Analyzer Blog`}
        description={metaDescription}
        canonical={canonicalUrl}
        ogImage={ogImage}
        ogTitle={seo?.og_title || seoTitle}
        ogDescription={
          seo?.og_description || metaDescription
        }
        ogType="article"
        twitterCard={
          seo?.twitter_card === "summary"
            ? "summary"
            : "summary_large_image"
        }
        twitterTitle={
          seo?.twitter_title ||
          seo?.og_title ||
          seoTitle
        }
        twitterDescription={
          seo?.twitter_description ||
          seo?.og_description ||
          metaDescription
        }
        twitterImage={
          seo?.twitter_image ||
          seo?.og_image ||
          post.cover_image ||
          undefined
        }
        noIndex={seo?.robots_index === false}
        noFollow={seo?.robots_follow === false}
        schema={[
          articleSchema,
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: siteUrl("/blog"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: siteUrl(`/blog/${post.slug}`),
              },
            ],
          },
        ]}
      />

      {/* Reading progress */}
      <div
        className="fixed left-0 right-0 top-0 z-[60] h-[3px] bg-transparent"
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress)}
      >
        <div
          className="h-full bg-[#c15f3c] transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Article header                                                      */}
      {/* ------------------------------------------------------------------ */}

      <header className="mx-auto max-w-[1000px] px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:pb-14 lg:pt-20">
        <div className="mx-auto max-w-[850px]">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-xs text-[#87867f]"
          >
            <Link to="/" className="hover:text-[#c15f3c]">
              Home
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-[#c15f3c]">
              Blog
            </Link>
            <span>/</span>
            <span className="max-w-[180px] truncate text-[#5e5d59]">
              {post.category?.name || "Article"}
            </span>
          </nav>

          {/* Category and reading time */}
          <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c15f3c]">
              {post.category?.name || "Uncategorized"}
            </span>

            <span className="h-1 w-1 rounded-full bg-[#b1ada1]" />

            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#87867f]">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time || 5} min read
            </span>
          </div>

          {/* H1 */}
          <h1 className="mb-7 max-w-[850px] text-balance font-serif text-[36px] font-medium leading-[1.12] tracking-tight text-[#141413] sm:text-[46px] lg:text-[58px]">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mb-9 max-w-[760px] text-[17px] leading-[1.75] text-[#5e5d59] sm:text-[20px]">
              {post.excerpt}
            </p>
          )}

          {/* Author and publication */}
          <div className="flex flex-wrap items-center justify-between gap-5 border-y border-[#e8e6dc] py-5">
            <div className="flex min-w-0 items-center gap-3.5">
              {post.author?.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={authorName}
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-full border border-[#e8e6dc] object-cover"
                />
              ) : (
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8e6dc] font-serif text-lg text-[#5e5d59]"
                  aria-hidden="true"
                >
                  {getInitials(authorName)}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#141413]">
                  {authorName}
                </p>

                <p className="mt-1 text-[12px] text-[#87867f]">
                  {publishDate
                    ? `Published ${publishDate}`
                    : "Published article"}
                </p>
              </div>
            </div>

            {/* Social actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shareArticle("twitter")}
                aria-label="Share on X"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d4ca] text-[#5e5d59] transition-colors hover:border-[#c15f3c] hover:text-[#c15f3c]"
              >
                <Twitter className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => shareArticle("linkedin")}
                aria-label="Share on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d4ca] text-[#5e5d59] transition-colors hover:border-[#c15f3c] hover:text-[#c15f3c]"
              >
                <Linkedin className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => shareArticle("facebook")}
                aria-label="Share on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d4ca] text-[#5e5d59] transition-colors hover:border-[#c15f3c] hover:text-[#c15f3c]"
              >
                <Facebook className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => void copyArticleLink()}
                aria-label="Copy article URL"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d4ca] text-[#5e5d59] transition-colors hover:border-[#c15f3c] hover:text-[#c15f3c]"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <ul
              className="mt-5 flex flex-wrap gap-2"
              aria-label="Article tags"
            >
              {post.tags.map((tag) => (
                <li
                  key={tag.slug}
                  className="rounded-full border border-[#d6d4ca] bg-[#f4f3ee] px-3 py-1.5 text-[11px] font-medium text-[#5e5d59]"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Featured image                                                      */}
      {/* ------------------------------------------------------------------ */}

      {post.cover_image && (
        <figure className="mx-auto mb-14 w-full max-w-[1240px] px-4 sm:mb-20 sm:px-8">
          <div className="overflow-hidden rounded-xl border border-[#e8e6dc] bg-[#f4f3ee]">
            <img
              src={post.cover_image}
              alt={seo?.cover_image_alt || post.title}
              className="block h-auto w-full object-contain"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </figure>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Editorial layout                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-12 px-5 pb-24 sm:px-8 lg:grid-cols-[minmax(0,760px)_260px] lg:gap-16 lg:px-10">

        {/* Main article */}
        <main className="min-w-0">

          {/* Mobile table of contents */}
          {headings.length > 0 && (
            <details className="group mb-10 rounded-xl border border-[#d6d4ca] bg-[#f4f3ee] p-5 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-[#141413]">
                <span className="flex items-center gap-2">
                  <List className="h-4 w-4 text-[#c15f3c]" />
                  Table of contents
                </span>

                <span className="text-lg text-[#c15f3c] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>

              <nav
                aria-label="Mobile table of contents"
                className="mt-5 border-t border-[#d6d4ca] pt-4"
              >
                <ul className="space-y-3">
                  {headings.map((heading, index) => (
                    <li key={heading.id || index}>
                      <a
                        href={`#${heading.id}`}
                        className="block text-[13px] leading-relaxed text-[#5e5d59] transition-colors hover:text-[#c15f3c]"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          )}

          {/* Article content */}
          <article className="min-w-0">
            <BlogRenderer blocks={post.content || []} />
          </article>

          {/* Author bio */}
          {post.author && (
            <section
              aria-label="About the author"
              className="mt-16 border-t border-[#e8e6dc] pt-10"
            >
              <div className="flex flex-col gap-5 rounded-xl border border-[#d6d4ca] bg-[#f4f3ee] p-6 sm:flex-row sm:items-center sm:p-8">

                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt={authorName}
                    width={76}
                    height={76}
                    loading="lazy"
                    className="h-[76px] w-[76px] shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-[#e8e6dc] font-serif text-2xl text-[#5e5d59]">
                    {getInitials(authorName)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c15f3c]">
                    About the author
                  </p>

                  <h2 className="mb-2 font-serif text-[21px] font-medium text-[#141413]">
                    {authorName}
                  </h2>

                  {post.author.bio && (
                    <p className="text-[14px] leading-[1.8] text-[#5e5d59]">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Product CTA */}
          <section className="mt-10 overflow-hidden rounded-xl bg-[#141413] p-7 sm:p-10">
            <div className="max-w-[560px]">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#c15f3c]">
                SEO Hub Analyzer
              </p>

              <h2 className="mb-4 font-serif text-[27px] font-medium leading-tight text-[#faf9f5] sm:text-[32px]">
                Turn SEO issues into actionable fixes.
              </h2>

              <p className="mb-7 text-[14px] leading-[1.8] text-[#b1ada1]">
                Scan your website, discover supported SEO issues, and
                generate issue-specific fixing prompts for your AI
                coding workflow.
              </p>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg bg-[#c15f3c] px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#a94f31]"
              >
                Start your website audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>

        {/* Desktop sidebar */}
        <aside className="hidden min-w-0 lg:block">
          <div className="sticky top-24 space-y-12">

            {/* Contents */}
            {headings.length > 0 && (
              <nav aria-label="Article contents">
                <h2 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#87867f]">
                  On this page
                </h2>

                <ul className="space-y-4">
                  {headings.map((heading, index) => (
                    <li key={heading.id || index}>
                      <a
                        href={`#${heading.id}`}
                        className="block border-l-2 border-transparent py-0.5 pl-3 text-[13px] leading-relaxed text-[#5e5d59] transition-colors hover:border-[#c15f3c] hover:text-[#c15f3c]"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Sidebar share */}
            <div className="border-t border-[#e8e6dc] pt-8">
              <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#87867f]">
                Share this article
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => shareArticle("twitter")}
                  aria-label="Share on X"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d4ca] text-[#5e5d59] hover:border-[#c15f3c] hover:text-[#c15f3c]"
                >
                  <Twitter className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => shareArticle("linkedin")}
                  aria-label="Share on LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d4ca] text-[#5e5d59] hover:border-[#c15f3c] hover:text-[#c15f3c]"
                >
                  <Linkedin className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => void copyArticleLink()}
                  aria-label="Copy article link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d4ca] text-[#5e5d59] hover:border-[#c15f3c] hover:text-[#c15f3c]"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Related articles                                                    */}
      {/* ------------------------------------------------------------------ */}

      {recentBlogs.length > 0 && (
        <section className="border-t border-[#30302e] bg-[#141413] py-20 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">

            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#c15f3c]">
                  Continue exploring
                </p>

                <h2 className="font-serif text-[32px] font-medium text-[#faf9f5] sm:text-[40px]">
                  Keep reading
                </h2>

                <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-[#b1ada1]">
                  Explore more practical insights on technical SEO,
                  website performance, and optimization.
                </p>
              </div>

              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-[#faf9f5] transition-colors hover:text-[#c15f3c]"
              >
                View all articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentBlogs.map((blog) => {
                const category = firstRelation(blog.blog_categories);

                return (
                  <Link
                    key={blog.id}
                    to={`/blog/${blog.slug}`}
                    className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#30302e] bg-[#1f1e1a] transition-colors hover:border-[#c15f3c]"
                  >
                    {/* Related article cover */}
                    <div className="aspect-[16/9] overflow-hidden bg-[#f4f3ee]">
                      {blog.cover_image ? (
                        <img
                          src={blog.cover_image}
                          alt={blog.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText className="h-12 w-12 text-[#b1ada1]" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {category?.name && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c15f3c]">
                            {category.name}
                          </span>
                        )}

                        {blog.published_at && (
                          <span className="text-[11px] text-[#87867f]">
                            {formatDate(blog.published_at)}
                          </span>
                        )}
                      </div>

                      <h3 className="mb-3 line-clamp-2 font-serif text-[20px] leading-[1.35] text-[#faf9f5] transition-colors group-hover:text-[#c15f3c]">
                        {blog.title}
                      </h3>

                      {blog.excerpt && (
                        <p className="mb-5 line-clamp-3 text-[13px] leading-[1.7] text-[#b1ada1]">
                          {blog.excerpt}
                        </p>
                      )}

                      <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[12px] font-medium text-[#faf9f5]">
                        Read article
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Admin quick edit */}
      {isAdmin && (
        <div className="fixed bottom-6 right-5 z-50 sm:right-8">
          <Link
            to={`/admin/blogs/editor/${post.id}`}
            className="flex items-center gap-2 rounded-full border border-[#30302e] bg-[#141413] px-5 py-3 text-[12px] font-semibold text-white shadow-lg transition-colors hover:bg-[#c15f3c]"
          >
            <Shield className="h-4 w-4" />
            Edit Article
          </Link>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
