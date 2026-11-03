// src/hooks/admin/useAdminBlogs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAudit';
import { toast } from 'sonner';

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

export function useAdminBlogMutations() {
  const qc = useQueryClient();

  const saveBlog = useMutation({
    mutationFn: async (payload: {
      id?: string;
      title: string;
      slug: string;
      excerpt?: string;
      content: any[];
      status: BlogStatus;
      category_id?: string;
      author_id?: string;
      cover_image?: string;
    }) => {
      console.log('saveBlog payload:', payload);
      let resultId = payload.id;
      
      const payloadToSave: any = { ...payload };
      delete payloadToSave.id; // Don't try to update the primary key
      
      if (payload.status === 'published') {
        payloadToSave.published_at = new Date().toISOString();
      }

      console.log('saveBlog payloadToSave:', payloadToSave);

      if (payload.id) {
        console.log('saveBlog updating existing record:', payload.id);
        const { error } = await supabase.from('blogs').update(payloadToSave).eq('id', payload.id);
        if (error) {
          console.error('saveBlog update error:', error);
          throw new Error(error.message);
        }
      } else {
        console.log('saveBlog inserting new record');
        const { data, error } = await supabase.from('blogs').insert(payloadToSave).select('id').single();
        if (error) {
          console.error('saveBlog insert error:', error);
          throw new Error(error.message);
        }
        resultId = data.id;
      }
      
      console.log('saveBlog logging action for id:', resultId);
      logAdminAction({ action: payload.id ? 'UPDATE_BLOG' : 'CREATE_BLOG', resourceType: 'blog', resourceId: resultId });
      
      console.log('saveBlog returning resultId:', resultId);
      return resultId;
    },
    onSuccess: (id) => {
      toast.success('Blog saved successfully');
      qc.invalidateQueries({ queryKey: ['admin', 'blogs'] });
    },
    onError: (err) => toast.error(`Failed to save blog: ${err.message}`)
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      // Safely extract extension and generate a conflict-free filename
      const parts = file.name.split('.');
      const fileExt = parts.length > 1 ? parts.pop()?.toLowerCase() : 'png';
      
      // Ensure file name is extremely safe (no spaces, no weird chars)
      const randomStr = Math.random().toString(36).substring(2, 10);
      const fileName = `${Date.now()}-${randomStr}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

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
      try {
        const match = url.match(/\/blog-images\/(.+)$/);
        if (!match) return;
        const filePath = match[1];
        const { error } = await supabase.storage.from('blog-images').remove([filePath]);
        if (error) throw error;
      } catch (e) {
        console.error("Failed to delete old image:", e);
      }
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

  return { saveBlog, uploadImage, deleteImage, bulkDeleteBlogs };
}
