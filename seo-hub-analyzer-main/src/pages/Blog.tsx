
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutGrid,
  List,
  Search,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "@/components/seohub/Footer";
import { supabase } from "@/lib/supabase";
import MetaTags from "@/seo/MetaTags";
import { siteUrl } from "@/lib/siteConfig";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface BlogCategory {
  id: string;
  name: string;
  color?: string | null;
}

type BlogCategoryRelation =
  | BlogCategory
  | BlogCategory[]
  | null;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  cover_image: string | null;
  excerpt: string | null;
  blog_categories: BlogCategoryRelation;
}

type SortOption = "latest" | "oldest" | "title";
type ViewMode = "grid" | "list";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SORT_OPTIONS: {
  label: string;
  value: SortOption;
}[] = [
  { label: "Latest first", value: "latest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Title (A–Z)", value: "title" },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getCategory = (
  relation: BlogCategoryRelation
): BlogCategory | null => {
  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
};

const formatDate = (
  value: string | null
): string => {
  if (!value) return "Recently published";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently published";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

const reveal = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [
        number,
        number,
        number,
        number
      ],
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function ArticleImage({
  blog,
  featured = false,
}: {
  blog: BlogPost;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden bg-[#292824] ${
        featured ? "h-full min-h-[240px]" : "aspect-[16/10]"
      }`}
    >
      {blog.cover_image ? (
        <img
          src={blog.cover_image}
          alt={blog.title}
          loading={featured ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 55vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#38352e] via-[#262521] to-[#171715]" />

          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/[0.08]" />

          <div className="absolute -right-2 -top-10 h-48 w-48 rounded-full border border-white/[0.08]" />

          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full border border-[#c96442]/20" />

          <div className="absolute inset-0 flex items-center justify-center">
            <FileText
              className={`${
                featured
                  ? "h-20 w-20"
                  : "h-14 w-14"
              } text-[#c96442]/60`}
              strokeWidth={1}
            />
          </div>

          <div className="absolute bottom-5 left-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            SEO Hub Analyzer
          </div>
        </>
      )}

      {featured && (
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border px-4 text-[11px] font-medium transition-colors duration-200 ${
        active
          ? "border-[#c96442] bg-[#c96442] text-white"
          : "border-[#45443f] bg-transparent text-[#aaa79e] hover:border-[#c96442] hover:text-[#faf9f5]"
      }`}
    >
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured Article                                                           */
/* -------------------------------------------------------------------------- */

function FeaturedArticle({
  blog,
}: {
  blog: BlogPost;
}) {
  const category = getCategory(blog.blog_categories);

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group grid min-w-0 overflow-hidden border border-[#35342f] bg-[#1f1e1a] transition-colors duration-300 hover:border-[#69665d] md:grid-cols-[1.12fr_0.88fr]"
    >
      <div className="relative min-w-0 overflow-hidden">
        <ArticleImage blog={blog} featured />

        <span className="absolute left-4 top-4 z-10 rounded-sm bg-[#141413]/85 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.17em] text-[#f4b090] backdrop-blur-sm">
          Featured article
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">

        <div className="mb-6 flex flex-wrap items-center gap-3">
          {category?.name && (
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d18a64]">
              {category.name}
            </span>
          )}

          <span className="h-1 w-1 rounded-full bg-[#66635a]" />

          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#88857c]">
            <CalendarDays className="h-3 w-3" />
            {formatDate(blog.published_at)}
          </span>
        </div>

        <h2 className="break-words font-serif text-[27px] font-medium leading-[1.2] tracking-[-0.025em] text-[#faf9f5] transition-colors group-hover:text-[#d18a64] sm:text-[34px] lg:text-[38px]">
          {blog.title}
        </h2>

        {blog.excerpt && (
          <p className="mt-5 line-clamp-3 text-[13px] leading-[1.9] text-[#a5a196] sm:text-[14px]">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3 border-t border-[#383731] pt-6 text-[12px] font-semibold text-[#d18a64]">
          Read featured article

          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Article Card                                                               */
/* -------------------------------------------------------------------------- */

function ArticleCard({
  blog,
  viewMode,
}: {
  blog: BlogPost;
  viewMode: ViewMode;
}) {
  const category = getCategory(blog.blog_categories);

  if (viewMode === "list") {
    return (
      <Link
        to={`/blog/${blog.slug}`}
        className="group flex min-w-0 flex-col overflow-hidden border border-[#35342f] bg-[#1f1e1a] transition-colors hover:border-[#69665d] sm:flex-row"
      >
        <div className="w-full shrink-0 sm:w-[240px]">
          <ArticleImage blog={blog} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center p-5 sm:p-7">

          <div className="mb-3 flex flex-wrap items-center gap-3">
            {category?.name && (
              <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#d18a64]">
                {category.name}
              </span>
            )}

            <span className="text-[11px] text-[#88857c]">
              {formatDate(blog.published_at)}
            </span>
          </div>

          <h3 className="font-serif text-[22px] font-medium leading-[1.3] text-[#faf9f5] transition-colors group-hover:text-[#c96442]">
            {blog.title}
          </h3>

          {blog.excerpt && (
            <p className="mt-3 line-clamp-2 text-[13px] leading-[1.8] text-[#939087]">
              {blog.excerpt}
            </p>
          )}

          <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold text-[#d18a64]">
            Read article
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group flex min-w-0 h-full flex-col overflow-hidden border border-[#35342f] bg-[#1f1e1a] transition-all duration-300 hover:-translate-y-1 hover:border-[#69665d] hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
    >
      <ArticleImage blog={blog} />

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {category?.name ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#d18a64]">
              {category.name}
            </span>
          ) : (
            <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#77746c]">
              Insights
            </span>
          )}

          <span className="text-[10px] text-[#817e74]">
            {formatDate(blog.published_at)}
          </span>
        </div>

        <h3 className="break-words font-serif text-[21px] font-medium leading-[1.35] text-[#faf9f5] transition-colors group-hover:text-[#c96442] sm:text-[23px]">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="mt-3 line-clamp-3 text-[13px] leading-[1.85] text-[#969287]">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[#35342f] pt-5 mt-6">
          <span className="text-[11px] font-semibold text-[#aaa79e] transition-colors group-hover:text-[#faf9f5]">
            Read article
          </span>

          <ArrowUpRight className="h-4 w-4 text-[#c96442] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Blog Page                                                             */
/* -------------------------------------------------------------------------- */

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [sortBy, setSortBy] =
    useState<SortOption>("latest");

  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  /* ---------------------------------------------------------------------- */
  /* Fetch published blogs                                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const now = new Date().toISOString();

        const [blogsResult, categoriesResult] =
          await Promise.all([
            supabase
              .from("blogs")
              .select(
                "id, title, slug, published_at, cover_image, excerpt, blog_categories(id, name, color)"
              )
              .eq("status", "published")
              .lte("published_at", now)
              .order("published_at", {
                ascending: false,
                nullsFirst: false,
              }),

            supabase
              .from("blog_categories")
              .select("id, name, color")
              .order("name", { ascending: true }),
          ]);

        if (cancelled) return;

        if (blogsResult.error) {
          throw blogsResult.error;
        }

        if (blogsResult.data) {
          setBlogs(blogsResult.data as BlogPost[]);
        }

        if (categoriesResult.error) {
          console.error(
            "Could not load blog categories:",
            categoriesResult.error.message
          );
        }

        if (categoriesResult.data) {
          setCategories(
            categoriesResult.data as BlogCategory[]
          );
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load blog:", error);
        setLoadError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Filter and sort                                                        */
  /* ---------------------------------------------------------------------- */

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = blogs.filter((blog) => {
      const category = getCategory(blog.blog_categories);

      const matchesSearch =
        !query ||
        blog.title?.toLowerCase().includes(query) ||
        blog.excerpt?.toLowerCase().includes(query) ||
        category?.name?.toLowerCase().includes(query);

      const matchesCategory =
        !selectedCategory ||
        category?.id === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === "title") {
        return (a.title ?? "").localeCompare(b.title ?? "");
      }

      const dateA = a.published_at
        ? new Date(a.published_at).getTime()
        : 0;

      const dateB = b.published_at
        ? new Date(b.published_at).getTime()
        : 0;

      return sortBy === "latest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [blogs, searchQuery, selectedCategory, sortBy]);

  /* ---------------------------------------------------------------------- */
  /* Derived state                                                          */
  /* ---------------------------------------------------------------------- */

  const featuredBlog = filteredBlogs[0] ?? null;
  const remainingBlogs = filteredBlogs.slice(1);

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(selectedCategory) ||
    sortBy !== "latest";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSortBy("latest");
  };

  const activeCategory = categories.find(
    (category) => category.id === selectedCategory
  );

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen overflow-x-clip bg-[#141413] font-sans text-[#faf9f5]">

      <MetaTags
        title="Blog — Technical SEO Insights & Performance Tips | SEO Hub Analyzer"
        description="Explore practical guides and insights on technical SEO, Core Web Vitals, website performance, and on-page optimization."
        canonical={siteUrl("/blog")}
        ogType="blog"
      />

      <main className="pt-[76px]">

        {/* ============================================================ */}
        {/* HERO                                                         */}
        {/* ============================================================ */}

        <section className="relative overflow-hidden border-b border-[#30302e]">

          <div className="pointer-events-none absolute -right-20 -top-32 h-[360px] w-[360px] rounded-full border border-[#c96442]/10" />

          <div className="pointer-events-none absolute -right-6 -top-16 h-[230px] w-[230px] rounded-full border border-[#c96442]/10" />

          <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12 lg:pt-24">

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
              <motion.div variants={reveal}>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#c96442]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d18a64]">
                    The SEO Hub Journal
                  </span>
                </div>
              </motion.div>

              <motion.div
                variants={reveal}
                className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end"
              >
                <div>
                  <h1 className="max-w-[850px] font-serif text-[43px] font-medium leading-[1.07] tracking-[-0.045em] text-[#faf9f5] sm:text-[60px] lg:text-[76px]">
                    Ideas for a{" "}
                    <span className="text-[#c96442]">
                      better web.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-[630px] text-[14px] leading-[1.9] text-[#aaa79e] sm:text-[16px]">
                    Practical perspectives, technical guides, and
                    thoughtful insights to help you understand
                    search performance and build better websites.
                  </p>
                </div>

                <div className="flex items-center gap-6 border-t border-[#383731] pt-5 lg:justify-end lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div>
                    <p className="font-serif text-[34px] text-[#faf9f5] tabular-nums">
                      {loading ? "—" : blogs.length}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#87867f]">
                      Published articles
                    </p>
                  </div>

                  <div className="h-10 w-px bg-[#383731]" />

                  <div>
                    <p className="font-serif text-[34px] text-[#faf9f5]">
                      03
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#87867f]">
                      Core topics
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Topics */}
            <div className="mt-12 border-t border-[#30302e] pt-6">
              <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#77746c]">
                Explore topics
              </p>

              <div className="flex flex-wrap gap-2.5">

                <CategoryChip
                  label="All articles"
                  active={!selectedCategory}
                  onClick={() => setSelectedCategory(null)}
                />

                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    label={category.name}
                    active={selectedCategory === category.id}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id
                          ? null
                          : category.id
                      )
                    }
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* ARTICLE CONTENT                                              */}
        {/* ============================================================ */}

        <section className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">

          {/* Featured article */}
          {!loading && !loadError && !searchQuery && !selectedCategory && sortBy === "latest" && featuredBlog && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={reveal}
              className="mb-20"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="font-serif text-[25px] font-medium text-[#faf9f5] sm:text-[29px]">
                  Editor&apos;s pick
                </h2>

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#87867f]">
                  Latest story
                </span>
              </div>

              <FeaturedArticle blog={featuredBlog} />
            </motion.div>
          )}

          {/* Controls */}
          <div className="border-y border-[#30302e] py-5">

            <div className="flex flex-col gap-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c96442]">
                    Explore the journal
                  </p>

                  <h2 className="mt-2 font-serif text-[27px] font-medium text-[#faf9f5]">
                    All articles
                  </h2>
                </div>

                {/* Grid / List controls */}
                <div className="flex items-center gap-2 self-start rounded-md border border-[#35342f] bg-[#1f1e1a] p-1">
                  <button
                    type="button"
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                    className={`flex h-9 items-center gap-2 rounded px-3 text-[11px] font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#383731] text-[#faf9f5]"
                        : "text-[#87867f] hover:text-[#faf9f5]"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Grid
                  </button>

                  <button
                    type="button"
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                    className={`flex h-9 items-center gap-2 rounded px-3 text-[11px] font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-[#383731] text-[#faf9f5]"
                        : "text-[#87867f] hover:text-[#faf9f5]"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    List
                  </button>
                </div>

              </div>

              {/* Search and sorting */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">

                <div className="relative min-w-0">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#87867f]" />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search articles, topics and insights..."
                    aria-label="Search articles"
                    className="h-12 w-full rounded-md border border-[#35342f] bg-[#1f1e1a] pl-11 pr-11 text-[13px] text-[#faf9f5] outline-none transition-colors placeholder:text-[#77746c] focus:border-[#c96442]"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#87867f] transition-colors hover:text-[#faf9f5]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    aria-label="Sort articles"
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as SortOption)
                    }
                    className="h-12 w-full appearance-none rounded-md border border-[#35342f] bg-[#1f1e1a] px-4 pr-10 text-[12px] text-[#d7d3c8] outline-none transition-colors focus:border-[#c96442]"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#87867f]" />
                </div>
              </div>

              {/* Active category */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p
                  className="text-[11px] text-[#87867f]"
                  aria-live="polite"
                >
                  {loading
                    ? "Loading articles..."
                    : `${filteredBlogs.length} article${filteredBlogs.length === 1 ? "" : "s"} found`}
                  {activeCategory
                    ? ` in ${activeCategory.name}`
                    : ""}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#d18a64] transition-colors hover:text-[#f0b08e]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* RESULTS                                                  */}
          {/* ======================================================== */}

          <div className="mt-9">

            {/* Loading */}
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden border border-[#30302e] bg-[#1f1e1a]"
                  >
                    <div className="aspect-[16/10] animate-pulse bg-[#30302e]" />

                    <div className="space-y-4 p-6">
                      <div className="h-3 w-24 animate-pulse rounded bg-[#30302e]" />
                      <div className="h-6 w-full animate-pulse rounded bg-[#30302e]" />
                      <div className="h-4 w-4/5 animate-pulse rounded bg-[#30302e]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fetch error */}
            {!loading && loadError && (
              <div className="border border-[#35342f] bg-[#1f1e1a] px-6 py-16 text-center">
                <FileText className="mx-auto h-8 w-8 text-[#87867f]" />

                <h3 className="mt-5 font-serif text-[23px] text-[#faf9f5]">
                  Unable to load articles
                </h3>

                <p className="mt-3 text-[13px] text-[#87867f]">
                  Something went wrong while loading the journal.
                  Please refresh the page and try again.
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-7 inline-flex items-center gap-2 bg-[#c96442] px-5 py-3 text-[12px] font-semibold text-white transition-colors hover:bg-[#ac5437]"
                >
                  Reload page
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !loadError && filteredBlogs.length === 0 && (
              <div className="border border-[#35342f] bg-[#1f1e1a] px-6 py-20 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#45443f] text-[#c96442]">
                  <Search className="h-6 w-6" />
                </div>

                <h3 className="mt-6 font-serif text-[24px] font-medium text-[#faf9f5]">
                  No articles found
                </h3>

                <p className="mx-auto mt-3 max-w-[400px] text-[13px] leading-[1.8] text-[#87867f]">
                  We could not find any articles matching your
                  search. Try different keywords or adjust your filters.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-7 inline-flex items-center gap-2 border border-[#45443f] px-5 py-2.5 text-[12px] font-medium text-[#d18a64] transition-colors hover:border-[#c96442] hover:text-[#faf9f5]"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Articles */}
            {!loading && !loadError && filteredBlogs.length > 0 && (
              <>
                {/*
                  When the newest article is featured, don't repeat it
                  in the regular article collection.
                */}
                {(() => {
                  const showFeatured =
                    !searchQuery.trim() &&
                    !selectedCategory &&
                    sortBy === "latest";

                  const articles = showFeatured
                    ? remainingBlogs
                    : filteredBlogs;

                  return (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
                          : "flex flex-col gap-4"
                      }
                    >
                      {articles.map((blog, index) => (
                        <motion.div
                          key={blog.id}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.06 }}
                          variants={reveal}
                          transition={{
                            delay: Math.min(index * 0.04, 0.2),
                          }}
                          className="min-w-0"
                        >
                          <ArticleCard
                            blog={blog}
                            viewMode={viewMode}
                          />
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}

          </div>

        </section>

        {/* ============================================================ */}
        {/* EDITORIAL CTA                                                */}
        {/* ============================================================ */}

        <section className="border-t border-[#30302e] bg-[#1b1a17]">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:px-12">

            <div className="max-w-[620px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c96442]">
                Explore the platform
              </p>

              <h2 className="mt-4 font-serif text-[30px] font-medium leading-[1.2] text-[#faf9f5] sm:text-[38px]">
                Put better insights into practice.
              </h2>

              <p className="mt-4 text-[13px] leading-[1.8] text-[#969287]">
                Explore your website's technical SEO, performance,
                and on-page signals with SEO Hub Analyzer.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start bg-[#c96442] px-6 text-[12px] font-semibold text-white transition-colors hover:bg-[#ac5437] lg:self-center"
            >
              Analyze your website
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Blog;
