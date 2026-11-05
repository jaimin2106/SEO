import { ArrowRight, Globe, Zap, FileText, Code, Link as LinkIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, type ElementType } from "react";
import { supabase } from "@/lib/supabase";

type BlogCard = {
  id: string;
  title: string;
  published_at: string | null;
  color: string;
  Icon: ElementType;
  slug: string;
  cover_image?: string | null;
};

type BlogQueryRow = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  cover_image: string | null;
  blog_categories: { name: string | null; color: string | null } |
    { name: string | null; color: string | null }[] |
    null;
};

const ICON_MAP: Record<string, React.ElementType> = {
  Engineering: Code,
  Marketing: LinkIcon,
  Product: Zap,
  "Technical SEO": Globe,
  "On-Page Optimization": FileText,
  "Core Web Vitals": ArrowRight,
};

const COLOR_MAP: Record<string, string> = {
  Engineering: "bg-[#b3e5fc]",
  Marketing: "bg-[#ffccbc]",
  Product: "bg-[#d1c4e9]",
  "Technical SEO": "bg-[#d1c4e9]",
  "On-Page Optimization": "bg-[#b3e5fc]",
  "Core Web Vitals": "bg-[#c8e6c9]",
};

function normalizeBlogs(data: BlogQueryRow[]): BlogCard[] {
  return data.map((b) => {
    const category = Array.isArray(b.blog_categories) ? b.blog_categories[0] : b.blog_categories;
    const catName = category?.name ?? "";
    return {
      id: b.id,
      title: b.title.trim().replace(/\s+/g, " "),
      published_at: b.published_at,
      color: category?.color ?? COLOR_MAP[catName] ?? "bg-[#e8e6dc]",
      Icon: ICON_MAP[catName] ?? FileText,
      slug: b.slug,
      cover_image: b.cover_image ?? null,
    };
  });
}

const BlogSection = () => {
  const [blogs, setBlogs] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogError, setBlogError] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("id, title, slug, published_at, cover_image, blog_categories(name, color)")
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .order("published_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setBlogs(normalizeBlogs(data ?? []));
      } catch (error) {
        console.error("Failed to load homepage blog articles:", error);
        setBlogError(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchBlogs();
  }, []);

  return (
    <section
      id="blog"
      className="bg-[#141413] text-[#faf9f5] py-24 sm:py-32 border-t border-[#30302e] overflow-hidden"
    >
      <div className="container-page">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <p
              className="text-[12px] uppercase tracking-[0.22em] font-semibold mb-4"
              style={{ color: "#87867f", WebkitFontSmoothing: "antialiased" }}
            >
              SEO KNOWLEDGE HUB
            </p>
            <h2
              className="text-[36px] md:text-[46px] leading-[1.1] text-[#faf9f5]"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
            >
              Learn How to Improve Core Web Vitals and Website SEO.
            </h2>
          </div>

          {/* Controls: View collection */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#141413] text-[14px] rounded-full hover:bg-[#f0eee6] transition-colors duration-200 group"
              style={{ fontWeight: 500, WebkitFontSmoothing: "antialiased" }}
            >
              View collection
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </div>
        </div>

        {/* 3-Column Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-[20px] bg-[#1f1e1a] animate-pulse border border-[#30302e]" />
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 -mt-4">
            {blogs.map((blog) => {
              const Icon = blog.Icon ?? FileText;
              const dateStr = blog.published_at
                ? new Date(blog.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <article key={blog.id} className="h-full">
                <Link
                  to={`/blog/${blog.slug}`}
                  className="blog-card flex flex-col rounded-[20px] overflow-hidden bg-[#1f1e1a] border border-[#30302e] h-full"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
                    transition: "transform 300ms ease-out, border-color 300ms ease-out",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.borderColor = "#5e5d59";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.borderColor = "#30302e";
                  }}
                >
                  {/* Pastel top half */}
                  <div className={`h-48 ${blog.color} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    {blog.cover_image ? (
                      <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon
                        className="h-16 w-16 text-[#141413] opacity-70"
                        strokeWidth={1.75}
                      />
                    )}
                  </div>

                  {/* Dark content half */}
                  <div className="p-6 flex flex-col flex-1">
                    <p
                      className="text-[11px] uppercase tracking-[0.12em] mb-3"
                      style={{
                        color: "#87867f",
                        fontWeight: 500,
                        WebkitFontSmoothing: "antialiased",
                      }}
                    >
                      {dateStr}
                    </p>

                    <h3
                      className="text-[18px] leading-[1.4] text-[#faf9f5] mb-4"
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontWeight: 400,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {blog.title}
                    </h3>

                    {/* Read article footer */}
                    <div className="mt-auto pt-4 border-t border-[#30302e] flex items-center justify-between">
                      <div
                        className="flex items-center gap-2"
                        style={{
                          color: "#87867f",
                          fontSize: "11px",
                          fontWeight: 500,
                          letterSpacing: "0.06em",
                          WebkitFontSmoothing: "antialiased",
                        }}
                      >
                        <div className="h-5 w-5 rounded-full bg-[#30302e] flex items-center justify-center">
                          <FileText className="h-3 w-3 text-[#87867f]" strokeWidth={1.75} />
                        </div>
                        <span className="uppercase tracking-[0.08em]">Read article</span>
                      </div>
                      <ArrowRight
                        className="h-3.5 w-3.5"
                        style={{ color: "#5e5d59", transition: "color 200ms" }}
                      />
                    </div>
                  </div>
                </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <p role={blogError ? "alert" : "status"} className="py-12 text-center text-[14px] text-[#b0aea5]">
            {blogError
              ? "Published SEO articles are temporarily unavailable."
              : "New SEO guides will appear here when published."}
          </p>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
