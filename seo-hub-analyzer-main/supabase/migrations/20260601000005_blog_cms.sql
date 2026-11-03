-- 20260601000005_blog_cms.sql
-- Sprint 4.5: Blog CMS & Editorial Platform

-- 1. Authors
CREATE TABLE public.blog_authors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    role text,
    bio text,
    avatar_url text,
    created_at timestamptz DEFAULT now()
);

-- 2. Categories
CREATE TABLE public.blog_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    color text, -- e.g., 'bg-[#d1c4e9]'
    created_at timestamptz DEFAULT now()
);

-- 3. Tags
CREATE TABLE public.blog_tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 4. Blogs (Core table)
CREATE TYPE public.blog_status AS ENUM ('draft', 'review', 'scheduled', 'published', 'archived');

CREATE TABLE public.blogs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text,
    content jsonb DEFAULT '[]'::jsonb, -- Array of content blocks
    cover_image text,
    category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    author_id uuid REFERENCES public.blog_authors(id) ON DELETE SET NULL,
    status public.blog_status DEFAULT 'draft',
    reading_time int DEFAULT 5, -- in minutes
    seo_metadata jsonb DEFAULT '{}'::jsonb,
    is_featured boolean DEFAULT false,
    published_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Blog Post Tags (Join Table)
CREATE TABLE public.blog_post_tags (
    blog_id uuid REFERENCES public.blogs(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES public.blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, tag_id)
);

-- 6. Blog Views Analytics
CREATE TABLE public.blog_views (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id uuid REFERENCES public.blogs(id) ON DELETE CASCADE,
    ip_address text,
    user_agent text,
    referer text,
    created_at timestamptz DEFAULT now()
);

-- Set up RLS
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public can read authors" ON public.blog_authors FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public can read tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Public can read published blogs" ON public.blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read post tags" ON public.blog_post_tags FOR SELECT USING (true);
CREATE POLICY "Public can insert views" ON public.blog_views FOR INSERT WITH CHECK (true);

-- Admin RPCs to bypass RLS for editor
CREATE OR REPLACE FUNCTION admin_get_blogs(
    p_limit integer default 50,
    p_offset integer default 0,
    p_status public.blog_status default null
)
RETURNS TABLE (
    id uuid,
    title text,
    slug text,
    status public.blog_status,
    published_at timestamptz,
    category_name text,
    author_name text,
    views_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.slug,
        b.status,
        b.published_at,
        c.name as category_name,
        a.name as author_name,
        (SELECT count(*) FROM public.blog_views v WHERE v.blog_id = b.id) as views_count
    FROM public.blogs b
    LEFT JOIN public.blog_categories c ON c.id = b.category_id
    LEFT JOIN public.blog_authors a ON a.id = b.author_id
    WHERE (p_status IS NULL OR b.status = p_status)
    ORDER BY b.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION admin_get_blog_details(p_blog_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_blog jsonb;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT row_to_json(b)::jsonb INTO v_blog
    FROM (
        SELECT 
            b.*,
            (SELECT jsonb_agg(tag_id) FROM public.blog_post_tags WHERE blog_id = b.id) as tags
        FROM public.blogs b
        WHERE b.id = p_blog_id
    ) b;

    RETURN v_blog;
END;
$$;

-- Create default author and category for testing
INSERT INTO public.blog_authors (name, role, bio, avatar_url)
VALUES ('System Admin', 'Platform Administrator', 'Default system author.', 'https://i.pravatar.cc/150?u=admin')
ON CONFLICT DO NOTHING;

INSERT INTO public.blog_categories (name, slug, color)
VALUES ('Engineering', 'engineering', 'bg-[#b3e5fc]'), ('Marketing', 'marketing', 'bg-[#ffccbc]'), ('Product', 'product', 'bg-[#d1c4e9]')
ON CONFLICT (slug) DO NOTHING;
