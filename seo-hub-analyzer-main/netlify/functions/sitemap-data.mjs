export const STATIC_ROUTES = [
  { path: "/",              changefreq: "weekly",  priority: 1.0 },
  { path: "/overview",      changefreq: "monthly", priority: 0.9 },
  { path: "/capabilities",  changefreq: "monthly", priority: 0.9 },
  { path: "/workflow",      changefreq: "monthly", priority: 0.8 },
  { path: "/pricing",       changefreq: "monthly", priority: 0.8 },
  { path: "/about",         changefreq: "monthly", priority: 0.7 },
  { path: "/docs",          changefreq: "weekly",  priority: 0.8 },
  { path: "/api-reference", changefreq: "monthly", priority: 0.7 },
  { path: "/case-studies",  changefreq: "monthly", priority: 0.8 },
  { path: "/sample-report", changefreq: "monthly", priority: 0.8 },
  { path: "/blog",          changefreq: "weekly",  priority: 0.8 },
  { path: "/support",       changefreq: "monthly", priority: 0.6 },
  { path: "/privacy",       changefreq: "yearly",  priority: 0.3 },
  { path: "/terms",         changefreq: "yearly",  priority: 0.3 },
];

const PAGE_SIZE = 1000;

export async function fetchPublishedBlogRoutes(supabase) {
  const blogRows = [];
  const publishedBefore = new Date().toISOString();
  let totalCount = 0;

  for (let from = 0; from === 0 || from < totalCount; from += PAGE_SIZE) {
    const { data, error, count } = await supabase
      .from("blogs")
      .select("slug, published_at, seo_metadata", { count: "exact" })
      .eq("status", "published")
      .lte("published_at", publishedBefore)
      .order("published_at", { ascending: false })
      .order("slug", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Could not fetch published blogs for sitemap: ${error.message}`);
    }

    if (from === 0) {
      if (typeof count !== "number") {
        throw new Error("Sitemap blog query did not return a total row count.");
      }

      totalCount = count;
    }

    if (!data?.length && from < totalCount) {
      throw new Error(`Sitemap blog query returned no rows before reaching ${totalCount} published blogs.`);
    }

    blogRows.push(...(data ?? []));
  }

  return blogRows
    .filter((post) => post.slug && post.seo_metadata?.robots_index !== false)
    .map((post) => ({
      path: `/blog/${post.slug}`,
      changefreq: "monthly",
      priority: 0.7,
      lastmod: post.published_at
        ? new Date(post.published_at).toISOString().split("T")[0]
        : undefined,
    }));
}
