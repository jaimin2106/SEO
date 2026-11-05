import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Share2, Bookmark, Clock, Twitter, Linkedin, Facebook, Link as LinkIcon, Zap, CheckCircle2, ChevronRight, Code, Globe, FileText, Shield } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Footer from "@/components/seohub/Footer";
import { supabase } from "@/lib/supabase";
import { BlogRenderer, BlogBlock } from "@/components/blog/BlogRenderer";
import MetaTags from "@/seo/MetaTags";
import { buildArticleSchema } from "@/seo/schemas";
import { siteUrl } from "@/lib/siteConfig";

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

function firstRelation<T>(relation: T | T[] | null | undefined): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation ?? null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const [post, setPost] = useState<PublishedBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState<'not-found' | 'load-error' | null>(null);

  const [recentBlogs, setRecentBlogs] = useState<RelatedBlog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role_id, admin_roles(name)')
            .eq('user_id', session.user.id)
            .limit(1)
            .single();

          if (!error && data) {
            const roleRow = Array.isArray(data.admin_roles) ? data.admin_roles[0] : data.admin_roles;
            const roleName = roleRow?.name;
            if (roleName && ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST'].includes(roleName)) {
              setIsAdmin(true);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to verify admin status:', err);
      }
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      setLoading(true);
      setPostError(null);

      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*, blog_categories(name, color), blog_authors(name, avatar_url, bio), blog_post_tags(blog_tags(name, slug))')
          .eq('slug', slug)
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .single();

        if (cancelled) return;
        if (error || !data) {
          console.error('Could not load published blog post:', error?.message);
          setPostError(error?.code === 'PGRST116' || !data ? 'not-found' : 'load-error');
          setLoading(false);
          return;
        }

        setPost({
          ...data,
          category: firstRelation(data.blog_categories),
          author: firstRelation(data.blog_authors),
          tags: ((data.blog_post_tags ?? []) as BlogPostTagRow[])
            .flatMap((row) => {
              const relation = firstRelation(row.blog_tags);
              return relation ? [relation] : [];
            }),
        });
        void supabase.from('blog_views').insert({
          blog_id: data.id,
          user_agent: navigator.userAgent.slice(0, 200),
          referer: document.referrer || null,
        });

        const { data: recent, error: recentError } = await supabase
          .from('blogs')
          .select('id, title, slug, published_at, blog_categories(name, color)')
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .neq('id', data.id)
          .order('published_at', { ascending: false })
          .limit(3);

        if (cancelled) return;
        if (recentError) console.error('Could not load related blog posts:', recentError.message);
        if (recent) setRecentBlogs(recent);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.error('Blog post request failed:', error);
        setPostError('load-error');
        setLoading(false);
      }
    };
    
    if (slug) fetchPost();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] pt-16 px-6 animate-pulse">
        <div className="max-w-[800px] mx-auto">
          <div className="h-4 w-24 bg-black/[0.06] rounded mb-8" />
          <div className="h-3 w-32 bg-black/[0.04] rounded mb-6" />
          <div className="h-14 bg-black/[0.06] rounded-lg w-3/4 mb-4" />
          <div className="h-14 bg-black/[0.06] rounded-lg w-1/2 mb-8" />
          <div className="h-5 bg-black/[0.04] rounded w-full mb-3" />
          <div className="h-5 bg-black/[0.04] rounded w-5/6 mb-10" />
          <div className="aspect-[21/9] w-full rounded-[16px] bg-black/[0.06]" />
        </div>
      </div>
    );
  }

  if (postError || !post) {
    const notFound = postError === 'not-found';
    return (
      <div className="flex min-h-screen flex-col bg-[#faf9f5] text-[#141413]">
        <MetaTags title={notFound ? 'Article not found | SEO Hub Analyzer' : 'Article unavailable | SEO Hub Analyzer'} description="This blog article is not available." noIndex />
        <main className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
          <h1 className="font-serif text-[36px]">{notFound ? 'Article not found' : 'Article unavailable'}</h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#5e5d59]">
            {notFound ? 'This article may have been unpublished or moved.' : 'We could not load this article right now. Please try again later.'}
          </p>
          <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#c96442] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const publishDate = post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
  const contentHeadings = (post.content ?? []).filter(
    (block): block is Extract<BlogBlock, { type: 'heading' }> => block.type === 'heading'
  );

  return (
    <div className="min-h-screen font-sans bg-[#faf9f5] text-[#141413]">
      <MetaTags
        title={`${post.seo_metadata?.seo_title || post.title} | SEO Hub Analyzer Blog`}
        description={post.seo_metadata?.meta_description || post.excerpt || "Read this article on SEO Hub Analyzer."}
        canonical={post.seo_metadata?.canonical_url || siteUrl(`/blog/${post.slug ?? slug}`)}
        ogImage={post.seo_metadata?.og_image || post.cover_image || undefined}
        ogTitle={post.seo_metadata?.og_title || post.seo_metadata?.seo_title || post.title}
        ogDescription={post.seo_metadata?.og_description || post.seo_metadata?.meta_description || post.excerpt || ""}
        ogType="article"
        twitterCard={post.seo_metadata?.twitter_card === 'summary' ? 'summary' : 'summary_large_image'}
        twitterTitle={post.seo_metadata?.twitter_title || post.seo_metadata?.og_title || post.seo_metadata?.seo_title || post.title}
        twitterDescription={post.seo_metadata?.twitter_description || post.seo_metadata?.og_description || post.seo_metadata?.meta_description || post.excerpt || ""}
        twitterImage={post.seo_metadata?.twitter_image || post.seo_metadata?.og_image || post.cover_image || undefined}
        noIndex={post.seo_metadata?.robots_index === false}
        noFollow={post.seo_metadata?.robots_follow === false}
        schema={[
          buildArticleSchema({
            title: post.title,
            description: post.excerpt,
            slug: post.slug ?? slug ?? "",
            publishedAt: post.published_at,
            modifiedAt: post.updated_at,
            authorName: post.author?.name ?? "SEO Hub Analyzer Team",
            imageUrl: post.cover_image ?? undefined,
            schemaType: post.seo_metadata?.schema_type === 'Article' ? 'Article' : 'BlogPosting',
          }),
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Blog", item: siteUrl("/blog") },
              { "@type": "ListItem", position: 3, name: post.title, item: siteUrl(`/blog/${post.slug}`) },
            ],
          },
        ]}
      />
      {/* Sticky Navbar Wrapper */}
      <div className="sticky top-0 z-50 bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e8e6dc]">
        {/* Reading Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-[#c96442] transition-all duration-150 ease-out" 
          style={{ width: `${scrollProgress}%` }} 
        />
      </div>
      
      {/* Article Hero */}
      <header className="pt-16 pb-12 px-6 max-w-[1100px] mx-auto">
        <div className="max-w-[800px]">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#87867f] hover:text-[#141413] transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c96442]">{post.category?.name || 'Uncategorized'}</span>
            <span className="text-[13px] text-[#87867f] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time || 5} min read
            </span>
          </div>

          <h1 className="text-[40px] md:text-[56px] lg:text-[68px] font-serif font-medium leading-[1.1] text-[#141413] tracking-tight text-balance mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-[18px] md:text-[22px] text-[#4d4c48] leading-[1.5] mb-10 text-balance max-w-[700px]">
              {post.excerpt}
            </p>
          )}

          {post.author && (
            <div className="flex items-center gap-4 py-6 border-t border-[#e8e6dc]">
              <div className="h-12 w-12 rounded-full bg-[#e8e6dc] overflow-hidden shrink-0">
                <img src={post.author.avatar_url || "https://i.pravatar.cc/150"} alt={post.author.name} className="h-full w-full object-cover grayscale opacity-90 mix-blend-multiply" />
              </div>
              <div>
                <div className="text-[15px] font-medium text-[#141413]">{post.author.name}</div>
                <div className="text-[13px] text-[#87867f]">Published {publishDate}</div>
              </div>
            </div>
          )}

          {post.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Article tags">
              {post.tags.map((tag) => (
                <li key={tag.slug} className="rounded-full border border-[#d6d4ca] px-3 py-1 text-[11px] font-medium text-[#5e5d59]">
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {/* Hero Visual */}
      <div className="px-6 max-w-[1100px] mx-auto mb-16 md:mb-24">
        {post.cover_image ? (
           <div className="aspect-[21/9] w-full rounded-[16px] bg-[#e8e6dc] overflow-hidden border border-[#d6d4ca] shadow-sm">
             <img src={post.cover_image} alt={post.seo_metadata?.cover_image_alt || post.title} className="w-full h-full object-cover" />
           </div>
        ) : (
          <div className="aspect-[21/9] w-full rounded-[16px] bg-[#e8e6dc] overflow-hidden relative group border border-[#d6d4ca] shadow-sm">
            <div className="absolute inset-0 bg-[#ffccbc] opacity-40 mix-blend-multiply" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 md:w-32 md:h-32 text-[#c96442] opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Editorial Layout */}
      <div className="px-6 max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 pb-24">
        
        {/* Main Article Content */}
        <main className="flex-1 max-w-[720px] shrink-0">
          
          <BlogRenderer blocks={post.content || []} />

          {/* End of Article Zone: Author Bio */}
          {post.author && (
            <div className="mt-20 pt-10 border-t border-[#e8e6dc]">
              <div className="bg-[#f0eee6] rounded-[16px] p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-[#d6d4ca]">
                <img src={post.author.avatar_url || "https://i.pravatar.cc/150"} alt={post.author.name} className="h-20 w-20 rounded-full object-cover grayscale mix-blend-multiply shrink-0" />
                <div className="flex-1">
                  <h4 className="text-[18px] font-medium text-[#141413] mb-1">Written by {post.author.name}</h4>
                  {post.author.bio && (
                    <p className="text-[15px] text-[#5e5d59] leading-relaxed mb-4">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="mt-8 bg-[#141413] rounded-[16px] p-8 md:p-10 text-center">
            <h4 className="text-[24px] font-serif font-medium text-[#faf9f5] mb-3">Get technical SEO insights weekly</h4>
            <p className="text-[15px] text-[#87867f] mb-6 max-w-[400px] mx-auto">Join 15,000+ engineers and marketers receiving our latest research, straight to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-[400px] mx-auto" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Work email address" 
                className="flex-1 bg-[#1f1e1a] border border-[#30302e] rounded-[8px] h-12 px-4 text-[14px] text-[#faf9f5] placeholder:text-[#5e5d59] focus:outline-none focus:border-[#c96442] transition-colors"
                required
              />
              <button 
                type="submit"
                className="h-12 px-6 bg-[#c96442] hover:bg-[#b05638] text-white rounded-[8px] text-[14px] font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-32">
            
            {/* Dynamic TOC based on headings */}
            {contentHeadings.length > 0 && (
              <div className="mb-12">
                <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#87867f] mb-6">Contents</h4>
                <ul className="space-y-4 text-[14px] text-[#5e5d59]">
                  {contentHeadings.filter((heading) => heading.level === 2).map((heading, i) => (
                    <li key={i}>
                      <a href={`#${heading.id}`} className="hover:text-[#c96442] transition-colors block border-l-2 border-transparent hover:border-[#c96442] pl-3 -ml-3">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#87867f] mb-5">Share Article</h4>
              <div className="flex items-center gap-3">
                <button className="h-10 w-10 rounded-full border border-[#d6d4ca] flex items-center justify-center text-[#5e5d59] hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors">
                  <Twitter className="h-4 w-4 fill-current" />
                </button>
                <button className="h-10 w-10 rounded-full border border-[#d6d4ca] flex items-center justify-center text-[#5e5d59] hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors">
                  <Linkedin className="h-4 w-4 fill-current" />
                </button>
                <button className="h-10 w-10 rounded-full border border-[#d6d4ca] flex items-center justify-center text-[#5e5d59] hover:bg-[#f0eee6] hover:text-[#141413] transition-colors">
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* Mandatory Related Articles Section */}
      <section className="bg-[#141413] pt-24 pb-32 border-t border-[#30302e]">
        <div className="px-6 max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-[32px] md:text-[40px] font-serif font-medium text-[#faf9f5] mb-3">Keep reading</h2>
              <p className="text-[16px] text-[#87867f] max-w-[500px]">Because you're reading about technical SEO strategy, here are more deep dives to level up your engineering.</p>
            </div>
            <Link to="/blog" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#faf9f5] hover:text-[#c96442] transition-colors pb-2">
              View all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8">
            {recentBlogs.map((blog) => {
              const Icon = FileText;
              const dateStr = blog.published_at ? new Date(blog.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft';
              const category = firstRelation(blog.blog_categories);
              const colorClass = category?.color || "bg-[#e8e6dc]";
              return (
                <Link 
                  key={blog.id} 
                  to={`/blog/${blog.slug}`} 
                  className="group flex flex-col rounded-[24px] overflow-hidden bg-[#1f1e1a] border border-[#30302e] hover:border-[#5e5d59] transition-colors duration-300 h-full"
                >
                  <div className={`h-48 ${colorClass} flex items-center justify-center transition-transform duration-500 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                    <Icon className="h-16 w-16 text-[#141413] opacity-70 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-[12px] text-[#87867f] mb-3">{dateStr}</div>
                    <h3 className="text-[18px] font-serif leading-[1.35] text-[#faf9f5] group-hover:text-[#c96442] transition-colors mb-4 line-clamp-2">
                      {blog.title}
                    </h3>
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
        </div>
      </section>

      <Footer />

      {/* Floating Admin Quick-Edit Control */}
      {isAdmin && post && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            to={`/admin/blogs/editor/${post.id}`}
            className="flex items-center gap-2 bg-[#141413] hover:bg-[#c96442] text-white px-5 py-3 rounded-full text-[12px] font-semibold uppercase tracking-wider shadow-[0_8px_30px_rgba(20,20,19,0.18)] border border-[#30302e] transition-all duration-300 hover:scale-105 group"
          >
            <Shield className="h-4 w-4 text-[#c96442] group-hover:text-white transition-colors" />
            Edit Article
          </Link>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
