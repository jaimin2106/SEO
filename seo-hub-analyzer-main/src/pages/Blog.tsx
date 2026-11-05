import { ArrowRight, Globe, Zap, FileText, Code, Link as LinkIcon, Search, ChevronDown, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/seohub/Footer";
import { supabase } from "@/lib/supabase";
import MetaTags from "@/seo/MetaTags";
import { siteUrl } from "@/lib/siteConfig";

const SORT_OPTIONS = [
  { label: "Latest first", value: "latest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Title (A–Z)", value: "title" },
];

const Blog = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "title">("latest");
  const [sortOpen, setSortOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [blogsRes, catsRes] = await Promise.all([
        supabase
          .from("blogs")
          .select("id, title, slug, published_at, cover_image, excerpt, blog_categories(id, name, color)")
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .order("published_at", { ascending: false }),
        supabase.from("blog_categories").select("id, name, color"),
      ]);

      if (blogsRes.data) setBlogs(blogsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Apply filter + sort
  const filteredBlogs = (() => {
    let list = [...blogs];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.excerpt?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter((b) => b.blog_categories?.id === selectedCategory);
    }

    // Sort
    if (sortBy === "latest") {
      list.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    } else if (sortBy === "title") {
      list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    }

    return list;
  })();

  const activeSort = SORT_OPTIONS.find((o) => o.value === sortBy)!;
  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const hasFilters = !!selectedCategory || sortBy !== "latest" || !!searchQuery.trim();

  const clearFilters = () => {
    setSelectedCategory(null);
    setSortBy("latest");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen font-sans bg-[#141413] text-[#faf9f5]">
      <MetaTags
        title="Blog — Technical SEO Insights & Performance Tips | SEO Hub Analyzer"
        description="Expert guides and deep dives for modern technical SEO. Core Web Vitals, on-page optimization, algorithm updates, and more."
        canonical={siteUrl("/blog")}
        ogType="blog"
      />

      <main className="container-page pt-32 pb-32">
        {/* Large Typography Categories */}
        <div className="mb-24 flex">
          <div className="w-1/4 hidden lg:block">
            <h1 className="text-[13px] uppercase tracking-[0.2em] font-semibold text-[#87867f]">Blog</h1>
            <p className="mt-4 text-[14px] text-[#b0aea5] leading-relaxed max-w-[200px]">
              Practical guides and deep dives for modern technical SEO.
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            {categories.length > 0
              ? categories
                  .filter((category) => ["Technical SEO", "On-Page Optimization", "Core Web Vitals"].includes(category.name))
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                      className={`group flex items-center text-[42px] md:text-[56px] lg:text-[72px] font-serif tracking-tight transition-colors duration-300 leading-tight text-left ${
                        selectedCategory === category.id
                          ? "text-[#c96442]"
                          : "text-[#faf9f5] hover:text-[#c96442]"
                      }`}
                    >
                      {category.name}
                      <ArrowRight
                        className={`ml-4 h-8 w-8 md:h-12 md:w-12 transition-all duration-300 text-[#87867f] group-hover:text-[#c96442] ${
                          selectedCategory === category.id
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                        }`}
                      />
                    </button>
                  ))
              : ["Technical SEO", "On-Page Optimization", "Core Web Vitals"].map((cat) => (
                  <button
                    key={cat}
                    className="group flex items-center text-[42px] md:text-[56px] lg:text-[72px] font-serif tracking-tight text-[#faf9f5] hover:text-[#c96442] transition-colors duration-300 leading-tight"
                  >
                    {cat}
                    <ArrowRight className="ml-4 h-8 w-8 md:h-12 md:w-12 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#87867f] group-hover:text-[#c96442]" />
                  </button>
                ))}
          </div>
        </div>

        {/* Infinite Text Marquee */}
        {blogs.length > 0 && (
          <div className="mb-24 w-screen relative left-1/2 -translate-x-1/2 border-y border-[#30302e] bg-[#141413] py-8 overflow-hidden flex group/ticker [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex animate-marquee group-hover/ticker:[animation-play-state:paused]">
              {[1, 2].map((loopIndex) => (
                <div key={`loop-${loopIndex}`} className="flex shrink-0">
                  {blogs.slice(0, 5).map((item, i) => {
                    const dateStr = item.published_at
                      ? new Date(item.published_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Draft";
                    return (
                      <Link
                        to={`/blog/${item.slug}`}
                        key={`item-${i}`}
                        className="w-[350px] md:w-[450px] shrink-0 border-l border-[#30302e] pl-8 pr-12 flex flex-col justify-center group cursor-pointer"
                      >
                        <h4 className="text-[17px] md:text-[19px] font-serif font-medium leading-[1.35] text-[#faf9f5] mb-3 group-hover:text-[#c96442] transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-[#87867f] text-[13px]">{dateStr}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-Column Layout for Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-semibold text-[#faf9f5]">Filter and sort</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-[12px] text-[#c96442] hover:text-[#e07a56] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-0">
              {/* Sort by dropdown */}
              <div className="border-b border-[#30302e] pb-4 relative" ref={sortRef}>
                <button
                  onClick={() => { setSortOpen(!sortOpen); setCatOpen(false); }}
                  className="w-full flex justify-between items-center text-[13px] text-[#87867f] hover:text-[#faf9f5] transition-colors py-1"
                >
                  <span>Sort by: <span className="text-[#faf9f5]">{activeSort.label}</span></span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#1f1e1a] border border-[#30302e] rounded-[12px] z-20 overflow-hidden shadow-xl">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value as any); setSortOpen(false); }}
                        className={`w-full flex items-center px-4 py-2.5 text-[13px] text-left transition-colors ${
                          sortBy === opt.value
                            ? "text-[#faf9f5] bg-[#30302e]"
                            : "text-[#87867f] hover:text-[#faf9f5] hover:bg-[#2a2927]"
                        }`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c96442]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category filter dropdown */}
              <div className="border-b border-[#30302e] pt-4 pb-4 relative" ref={catRef}>
                <button
                  onClick={() => { setCatOpen(!catOpen); setSortOpen(false); }}
                  className="w-full flex justify-between items-center text-[13px] text-[#87867f] hover:text-[#faf9f5] transition-colors py-1"
                >
                  <span>
                    Category:{" "}
                    <span className="text-[#faf9f5]">{activeCategory?.name ?? "All"}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                </button>
                {catOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#1f1e1a] border border-[#30302e] rounded-[12px] z-20 overflow-hidden shadow-xl">
                    <button
                      onClick={() => { setSelectedCategory(null); setCatOpen(false); }}
                      className={`w-full flex items-center px-4 py-2.5 text-[13px] text-left transition-colors ${
                        !selectedCategory
                          ? "text-[#faf9f5] bg-[#30302e]"
                          : "text-[#87867f] hover:text-[#faf9f5] hover:bg-[#2a2927]"
                      }`}
                    >
                      All categories
                      {!selectedCategory && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c96442]" />}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setCatOpen(false); }}
                        className={`w-full flex items-center px-4 py-2.5 text-[13px] text-left transition-colors ${
                          selectedCategory === cat.id
                            ? "text-[#faf9f5] bg-[#30302e]"
                            : "text-[#87867f] hover:text-[#faf9f5] hover:bg-[#2a2927]"
                        }`}
                      >
                        {cat.name}
                        {selectedCategory === cat.id && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c96442]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active filter chips */}
              {hasFilters && (
                <div className="pt-4 flex flex-wrap gap-2">
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c96442]/15 border border-[#c96442]/30 text-[#c96442] text-[12px] font-medium">
                      {activeCategory.name}
                      <button onClick={() => setSelectedCategory(null)} className="hover:opacity-80">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {sortBy !== "latest" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30302e] border border-[#5e5d59] text-[#87867f] text-[12px] font-medium">
                      {activeSort.label}
                      <button onClick={() => setSortBy("latest")} className="hover:opacity-80">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#87867f]" />
                <input
                  type="text"
                  placeholder="Search posts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1f1e1a] border border-[#30302e] rounded-full h-10 pl-11 pr-4 text-[13px] text-[#faf9f5] placeholder:text-[#5e5d59] focus:outline-none focus:border-[#5e5d59]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5e5d59] hover:text-[#87867f]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="hidden sm:flex items-center rounded-full border border-[#30302e] bg-[#1f1e1a] p-1 ml-4">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${viewMode === "grid" ? "bg-[#30302e] text-[#faf9f5]" : "text-[#87867f] hover:text-[#faf9f5]"}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${viewMode === "list" ? "bg-[#30302e] text-[#faf9f5]" : "text-[#87867f] hover:text-[#faf9f5]"}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  List
                </button>
              </div>
            </div>

            {/* Results count */}
            {!loading && filteredBlogs.length > 0 && (
              <p className="text-[12px] text-[#5e5d59] mb-6">
                {filteredBlogs.length} article{filteredBlogs.length !== 1 ? "s" : ""}
                {hasFilters ? " matching your filters" : ""}
              </p>
            )}

            {loading ? (
              <div className="grid gap-8 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 rounded-[24px] bg-[#1f1e1a] animate-pulse" />
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-full bg-[#1f1e1a] flex items-center justify-center mb-6 border border-[#30302e]">
                  <FileText className="h-7 w-7 text-[#87867f]" />
                </div>
                <p className="text-[18px] font-serif text-[#faf9f5] mb-2">
                  {searchQuery || selectedCategory ? "No posts match your filters." : "No articles published yet."}
                </p>
                <p className="text-[14px] text-[#87867f] mb-6">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your search or filters."
                    : "Check back soon for the latest insights."}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-[#1f1e1a] border border-[#30302e] rounded-full text-[13px] text-[#87867f] hover:text-[#faf9f5] hover:border-[#5e5d59] transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                {filteredBlogs.map((blog) => {
                  const Icon = Globe;
                  const dateStr = blog.published_at
                    ? new Date(blog.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Draft";
                  const colorClass = blog.blog_categories?.color || "bg-[#e8e6dc]";

                  return (
                    <Link
                      key={blog.id}
                      to={`/blog/${blog.slug}`}
                      className={`group rounded-[24px] overflow-hidden bg-[#1f1e1a] border border-[#30302e] hover:border-[#5e5d59] transition-colors duration-300 ${viewMode === "grid" ? "flex flex-col h-full" : "flex flex-col sm:flex-row h-auto items-stretch"}`}
                    >
                      {/* Top/Left Half: Cover Image or Pastel + Icon */}
                      <div
                        className={`${viewMode === "grid" ? "h-56" : "h-48 sm:h-auto sm:w-[250px] shrink-0"} ${colorClass} flex items-center justify-center transition-transform duration-500 relative overflow-hidden`}
                      >
                        {blog.cover_image ? (
                          <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                            <Icon
                              className={`${viewMode === "grid" ? "h-20 w-20" : "h-14 w-14"} text-[#141413] opacity-70 group-hover:scale-110 transition-transform duration-500`}
                              strokeWidth={1}
                            />
                          </>
                        )}
                      </div>

                      {/* Bottom/Right Half: Content */}
                      <div className="p-8 flex flex-col flex-1 justify-center">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-[12px] text-[#87867f]">{dateStr}</div>
                          {blog.blog_categories?.name && (
                            <span className="px-2 py-0.5 rounded-full bg-[#30302e] text-[11px] font-medium text-[#b0aea5] uppercase tracking-wider">
                              {blog.blog_categories.name}
                            </span>
                          )}
                        </div>
                        <h2 className="text-[20px] font-serif leading-[1.35] text-[#faf9f5] group-hover:text-[#c96442] transition-colors mb-4 text-balance">
                          {blog.title}
                        </h2>
                        {blog.excerpt && (
                          <p className="text-[14px] text-[#87867f] leading-relaxed line-clamp-2 mb-4">
                            {blog.excerpt}
                          </p>
                        )}
                        <div className="mt-auto pt-4 flex items-center gap-3 text-[13px] text-[#87867f] group-hover:text-[#faf9f5] transition-colors">
                          <div className="h-8 w-8 rounded-full bg-[#30302e] flex items-center justify-center group-hover:bg-[#c96442] transition-colors">
                            <FileText className="h-4 w-4 text-[#faf9f5]" />
                          </div>
                          Read article
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
