// src/hooks/admin/useAdminBlogs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';
import { BlogBlock } from '@/components/blog/BlogRenderer';

export type BlogStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export interface AdminBlogFeedItem {
  id: string;
  title: string;
  slug: string;
  status: BlogStatus;
  published_at: string | null;
  category_name: string | null;
  author_name: string | null;
  views_count: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar_url: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface SaveBlogResult {
  id: string;
  updated_at: string | null;
  error?: string;
}

async function validateBlogImage(file: File): Promise<string> {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  const extension = extensions[file.type];
  if (!extension) throw new Error('Choose a JPG, PNG, WebP, or AVIF image.');
  if (file.size === 0 || file.size > 8 * 1024 * 1024) {
    throw new Error('Images must be larger than 0 bytes and 8 MB or smaller.');
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = String.fromCharCode(...header);
  const signatures: Record<string, boolean> = {
    'image/jpeg': header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff,
    'image/png': header[0] === 0x89 && ascii.slice(1, 4) === 'PNG',
    'image/webp': ascii.slice(0, 4) === 'RIFF' && ascii.slice(8, 12) === 'WEBP',
    'image/avif': ascii.slice(4, 12).startsWith('ftypavif') || ascii.slice(4, 12).startsWith('ftypavis'),
  };
  if (!signatures[file.type]) throw new Error('The selected file does not match its image type.');
  return extension;
}

export function useAdminBlogsFeed(page = 0, pageSize = 50, status?: BlogStatus) {
  return useQuery({
    queryKey: ['admin', 'blogs', 'feed', { page, pageSize, status }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_blogs', {
        p_limit: pageSize,
        p_offset: page * pageSize,
        p_status: status || null,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminBlogFeedItem[];
    },
  });
}

export function useAdminBlogDetails(blogId: string | null) {
  return useQuery({
    queryKey: ['admin', 'blogs', blogId],
    queryFn: async () => {
      if (!blogId) return null;
      const { data, error } = await supabase.rpc('admin_get_blog_details', { p_blog_id: blogId });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!blogId,
  });
}

export function useAdminBlogCategories() {
  return useQuery({
    queryKey: ['admin', 'blogs', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_categories').select('id, name, slug, color').order('name');
      if (error) throw new Error(error.message);
      return data as BlogCategory[];
    },
  });
}

export function useAdminBlogAuthors() {
  return useQuery({
    queryKey: ['admin', 'blogs', 'authors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_authors').select('id, name, avatar_url').order('name');
      if (error) throw new Error(error.message);
      return data as BlogAuthor[];
    },
  });
}

export function useAdminBlogTags() {
  return useQuery({
    queryKey: ['admin', 'blogs', 'tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_tags').select('id, name, slug').order('name');
      if (error) throw new Error(error.message);
      return data as BlogTag[];
    },
  });
}

export function useAdminBlogMutations() {
  const qc = useQueryClient();

  const saveBlog = useMutation({
    mutationFn: async (payload: {
      id?: string;
      expected_updated_at?: string | null;
      silent?: boolean;
      tag_ids?: string[];
      title: string;
      slug: string;
      excerpt?: string;
      content: BlogBlock[];
      status: BlogStatus;
      category_id?: string;
      author_id?: string;
      cover_image?: string;
      published_at?: string | null;
      seo_metadata?: Record<string, unknown>;
      scheduled_at?: string | null;
    }) => {
      const { id, expected_updated_at, silent, tag_ids, ...payloadToSave } = payload;
      let result: SaveBlogResult;
      
      if (payload.status === 'published') {
        if (id) {
          const { data: existing, error } = await supabase
            .from('blogs')
            .select('published_at')
            .eq('id', id)
            .single();
          if (error) throw new Error(error.message);
          payloadToSave.published_at = existing.published_at ?? new Date().toISOString();
        } else {
          payloadToSave.published_at = new Date().toISOString();
        }
      } else if (payload.status !== 'archived') {
        payloadToSave.published_at = null;
      }

      if (id) {
        let updateQuery = supabase.from('blogs').update(payloadToSave).eq('id', id);
        if (expected_updated_at) {
          updateQuery = updateQuery.eq('updated_at', expected_updated_at);
        }
        const { data, error } = await updateQuery.select('updated_at').maybeSingle();
        if (error) {
          if (error.code === '23505') throw new Error('This slug is already in use. Choose a unique slug.');
          throw new Error(error.message);
        }
        if (!data) {
          throw new Error('This article changed elsewhere. Reload it before saving to avoid overwriting newer edits.');
        }
        result = { id, updated_at: data.updated_at };
      } else {
        const { data, error } = await supabase.from('blogs').insert(payloadToSave).select('id, updated_at').single();
        if (error) {
          if (error.code === '23505') throw new Error('This slug is already in use. Choose a unique slug.');
          throw new Error(error.message);
        }
        result = { id: data.id, updated_at: data.updated_at };
      }

      if (tag_ids) {
        const { error } = await supabase.rpc('admin_replace_blog_tags', {
          p_blog_id: result.id,
          p_tag_ids: tag_ids,
        });
        if (error) result.error = `Article saved, but tags could not be updated: ${error.message}`;
      }
      
      logAdminAction({ action: id ? 'UPDATE_BLOG' : 'CREATE_BLOG', resourceType: 'blog', resourceId: result.id });
      
      return result;
    },
    onSuccess: (result, variables) => {
      if (result.error) toast.error(result.error);
      else if (!variables.silent) toast.success('Blog saved successfully');
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
    },
    onError: (err) => toast.error(`Failed to save blog: ${err.message}`)
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = await validateBlogImage(file);

      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '31536000',
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (err) => toast.error(`Image upload failed: ${err.message}`)
  });

  const deleteImage = useMutation({
    mutationFn: async (url: string) => {
      const marker = '/storage/v1/object/public/blog-images/';
      let parsedUrl: URL;
      let projectUrl: URL;
      try {
        parsedUrl = new URL(url);
        projectUrl = new URL(import.meta.env.VITE_SUPABASE_URL);
      } catch {
        return false;
      }

      const markerIndex = parsedUrl.pathname.indexOf(marker);
      if (parsedUrl.origin !== projectUrl.origin || markerIndex < 0) return false;
      const encodedPath = parsedUrl.pathname.slice(markerIndex + marker.length);
      const filePath = encodedPath.split('/').map(decodeURIComponent).join('/');
      if (!filePath || filePath.split('/').some((part) => part === '.' || part === '..')) return false;

      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        const { data: posts, error: postsError } = await supabase
          .from('blogs')
          .select('cover_image, content')
          .range(offset, offset + pageSize - 1);
        if (postsError) throw new Error(`Could not check image references: ${postsError.message}`);

        const isReferenced = (posts ?? []).some((post) =>
          post.cover_image === url || JSON.stringify(post.content ?? []).includes(url)
        );
        if (isReferenced) return false;
        if (!posts || posts.length < pageSize) break;
      }

      const { error } = await supabase.storage.from('blog-images').remove([filePath]);
      if (error) throw new Error(`Could not remove unused image: ${error.message}`);
      return true;
    }
  });

  const bulkDeleteBlogs = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('blogs').delete().in('id', ids);
      if (error) throw new Error(error.message);
      
      logAdminAction({
        action: 'BULK_DELETE_BLOGS',
        resourceType: 'blog',
        metadata: { deleted_ids: ids }
      });
    },
    onSuccess: () => {
      toast.success('Selected blogs deleted successfully');
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
    },
    onError: (err) => toast.error(`Failed to delete blogs: ${err.message}`)
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw new Error(error.message);
      logAdminAction({ action: 'DELETE_BLOG', resourceType: 'blog', resourceId: id });
    },
    onSuccess: () => {
      toast.success('Article deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
    },
    onError: (error) => toast.error(`Could not delete article: ${error.message}`),
  });

  return { saveBlog, uploadImage, deleteImage, deleteBlog, bulkDeleteBlogs };
}
