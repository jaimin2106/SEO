// src/pages/admin/AdminBlogEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Sparkles, Image as ImageIcon, 
  AlignLeft, Heading1, Code, Quote, ListChecks, CheckCircle2, 
  LayoutTemplate, Settings2, Trash2, GripVertical, ChevronDown, ChevronRight,
  PenLine, Eye, UploadCloud, Cloud, Check, AlertCircle, X, Info, Loader2
} from 'lucide-react';
import { 
  useAdminBlogDetails, useAdminBlogCategories, 
  useAdminBlogAuthors, useAdminBlogTags, useAdminBlogMutations, BlogStatus
} from '@/hooks/admin/useAdminBlogs';
import { BlogRenderer, BlogBlock } from '@/components/blog/BlogRenderer';
import { BlogRichTextEditor } from '@/components/blog/BlogRichTextEditor';
import { getBlogImageUrls, sanitizeBlogHtml } from '@/lib/sanitizeBlogHtml';
import { siteUrl } from '@/lib/siteConfig';
import { toast } from 'sonner';

const DEFAULT_BLOCKS: BlogBlock[] = [
  { type: 'rich_text', html: '' }
];

interface BlogSeoMetadata {
  seo_title?: string;
  meta_description?: string;
  canonical_url?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  robots_index?: boolean;
  robots_follow?: boolean;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  cover_image_alt?: string;
  twitter_card?: 'summary' | 'summary_large_image';
  schema_type?: 'Article' | 'BlogPosting';
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function createSlashBlock(id: string): BlogBlock | null {
  switch (id) {
    case 'heading': return { type: 'heading', level: 2, text: '', id: `h-${Date.now()}` };
    case 'image': return { type: 'image', url: '', caption: '', alt: '' };
    case 'quote': return { type: 'quote', text: '' };
    case 'code': return { type: 'code', code: '' };
    case 'executive_summary': return { type: 'executive_summary', items: [''] };
    default: return null;
  }
}

const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const { data: categories } = useAdminBlogCategories();
  const { data: authors } = useAdminBlogAuthors();
  const { data: tags } = useAdminBlogTags();
  const { data: initialData, isLoading } = useAdminBlogDetails(isNew ? null : id!);
  const { saveBlog, uploadImage, deleteImage, deleteBlog } = useAdminBlogMutations();
  
  const currentDocId = useRef<string | undefined>(isNew ? undefined : id);
  const currentUpdatedAt = useRef<string | null>(null);
  const persistedStatus = useRef<BlogStatus | null>(isNew ? 'draft' : null);
  const saveInProgress = useRef(false);
  const queuedAutoSave = useRef(false);
  const failedSaveSnapshot = useRef<string | null>(null);
  const savedCloudSnapshot = useRef<string | null>(null);
  const hasLoadedInitialData = useRef(false);
  const pendingImageCleanupRef = useRef(new Set<string>());

  const queueImageCleanup = (url: string) => {
    if (url && !url.startsWith('blob:')) pendingImageCleanupRef.current.add(url);
  };

  // Editor State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<BlogStatus>('draft');
  const [scheduledAt, setScheduledAt] = useState<string>(''); // For scheduled status
  const [seoMetadata, setSeoMetadata] = useState<BlogSeoMetadata>({});
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<BlogBlock[]>(DEFAULT_BLOCKS);
  
  // UI State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [hoveredBlockIndex, setHoveredBlockIndex] = useState<number | null>(null);
  const [uploadingBlockIndex, setUploadingBlockIndex] = useState<number | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [blockUploadProgress, setBlockUploadProgress] = useState<{ [key: number]: number }>({});
  
  // UX Overhaul States
  const [mobileView, setMobileView] = useState<'write' | 'preview'>('write');
  const [isTyping, setIsTyping] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ isOpen: boolean, index: number, search: string } | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Autosave & Publish States
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved_local' | 'saved_cloud' | 'offline' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const currentSnapshot = JSON.stringify({
    title, slug, excerpt, coverImage, status, scheduledAt, categoryId, authorId, tagIds, blocks, seoMetadata,
  });
  const latestSnapshot = useRef(currentSnapshot);
  latestSnapshot.current = currentSnapshot;

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  // Load existing data or local draft
  useEffect(() => {
    if (initialData && !isNew) currentUpdatedAt.current = initialData.updated_at ?? null;
    if (initialData && !isNew) persistedStatus.current = initialData.status ?? 'draft';
    if (hasLoadedInitialData.current) return;
    if (isNew && !initialData) savedCloudSnapshot.current = currentSnapshot;
    
    const draftKey = `seo_hub_draft_${currentDocId.current || 'new'}`;
    const localDraftStr = localStorage.getItem(draftKey);
    let loadedFromLocal = false;

    if (localDraftStr) {
      try {
        const localDraft = JSON.parse(localDraftStr);
        // We only restore from local if it has a title or blocks to avoid restoring blank states
        if (localDraft.title || (localDraft.blocks && localDraft.blocks.length > 0)) {
          setTitle(localDraft.title || '');
          setSlug(localDraft.slug || '');
          setExcerpt(localDraft.excerpt || '');
          setCoverImage(localDraft.coverImage || '');
          setStatus(localDraft.status || 'draft');
          setCategoryId(localDraft.categoryId || '');
          setAuthorId(localDraft.authorId || '');
          setTagIds(localDraft.tagIds || []);
          setBlocks(localDraft.blocks || DEFAULT_BLOCKS);
          setSeoMetadata(localDraft.seoMetadata || {});
          setScheduledAt(localDraft.scheduledAt || '');
          loadedFromLocal = true;
          toast.success('Restored unsaved draft from local storage');
        }
      } catch (e) {
        console.error('Failed to parse local draft', e);
      }
    }

    if (!loadedFromLocal && initialData && !isNew) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      setExcerpt(initialData.excerpt || '');
      setCoverImage(initialData.cover_image || '');
      setStatus(initialData.status || 'draft');
      setCategoryId(initialData.category_id || '');
      setAuthorId(initialData.author_id || '');
      const loadedTagIds: string[] = initialData.tags || [];
      setTagIds(loadedTagIds);
      const loadedBlocks = initialData.content && initialData.content.length > 0 ? initialData.content : DEFAULT_BLOCKS;
      const loadedSeoMetadata = initialData.seo_metadata || {};
      const loadedScheduledAt = initialData.scheduled_at ? toLocalDateTimeInput(initialData.scheduled_at) : '';
      setBlocks(loadedBlocks);
      setSeoMetadata(loadedSeoMetadata);
      setScheduledAt(loadedScheduledAt);
      savedCloudSnapshot.current = JSON.stringify({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        coverImage: initialData.cover_image || '',
        status: initialData.status || 'draft',
        scheduledAt: loadedScheduledAt,
        categoryId: initialData.category_id || '',
        authorId: initialData.author_id || '',
        tagIds: loadedTagIds,
        blocks: loadedBlocks,
        seoMetadata: loadedSeoMetadata,
      });
    }
    
    if (initialData || loadedFromLocal || isNew) {
      hasLoadedInitialData.current = true;
    }
  }, [initialData, isNew, currentSnapshot]);

  const handleSave = async (forceStatus?: BlogStatus, isAutoSave = false) => {
    if (!isAutoSave) failedSaveSnapshot.current = null;
    if (isAutoSave && failedSaveSnapshot.current === currentSnapshot) return;
    if (saveInProgress.current) {
      if (isAutoSave) queuedAutoSave.current = true;
      return;
    }

    if (!title.trim()) {
      if (!isAutoSave) toast.error('Article title is required.');
      return;
    }
    
    let finalSlug = slug.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!finalSlug) {
      finalSlug = title.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (!finalSlug) {
      toast.error('Add a title containing letters or numbers to create a valid URL slug.');
      setSaveStatus('error');
      return;
    }
    setSlug(finalSlug);

    if (seoMetadata.canonical_url) {
      try {
        const canonical = new URL(seoMetadata.canonical_url);
        if (!['http:', 'https:'].includes(canonical.protocol)) throw new Error();
      } catch {
        toast.error('Canonical URL must be a valid HTTP or HTTPS URL.');
        setSaveStatus('error');
        setIsConfigOpen(true);
        return;
      }
    }

    const targetStatus = isAutoSave ? (persistedStatus.current ?? status) : (forceStatus || status);
    if (targetStatus === 'scheduled' && (!scheduledAt || Number.isNaN(Date.parse(scheduledAt)))) {
      toast.error('Choose a valid date and time to schedule this article.');
      setSaveStatus('error');
      setIsConfigOpen(true);
      return;
    }
    if (!isAutoSave) setStatus(targetStatus);
    setSaveStatus('saving');
    saveInProgress.current = true;
    let attemptedSnapshot: string | null = null;

    const safeBlocks = blocks.map((block): BlogBlock => {
      if (block.type === 'rich_text') return { ...block, html: sanitizeBlogHtml(block.html) };
      if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'implementation_note') {
        return { ...block, text: sanitizeBlogHtml(block.text) };
      }
      if (block.type === 'executive_summary') {
        return { ...block, items: block.items.map(sanitizeBlogHtml) };
      }
      return block;
    });

    try {
      const saveSnapshot = JSON.stringify({
        title, slug: finalSlug, excerpt, coverImage, status: targetStatus, scheduledAt,
        categoryId, authorId, tagIds, blocks, seoMetadata,
      });
      attemptedSnapshot = saveSnapshot;
      const saved = await saveBlog.mutateAsync({
        id: currentDocId.current,
        expected_updated_at: currentUpdatedAt.current,
        title,
        slug: finalSlug,
        excerpt,
        cover_image: coverImage,
        status: targetStatus,
        silent: isAutoSave,
        category_id: categoryId || undefined,
        author_id: authorId || undefined,
        tag_ids: tagIds,
        content: safeBlocks,
        scheduled_at: targetStatus === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
        seo_metadata: {
          ...seoMetadata,
          seo_title: seoMetadata.seo_title?.trim() || title.trim(),
          meta_description: seoMetadata.meta_description?.trim() || excerpt.trim(),
          secondary_keywords: seoMetadata.secondary_keywords ?? [],
          robots_index: seoMetadata.robots_index !== false,
          robots_follow: seoMetadata.robots_follow !== false,
        },
      });
      
      currentDocId.current = saved.id;
      currentUpdatedAt.current = saved.updated_at;
      persistedStatus.current = targetStatus;
      if (saved.error) {
        failedSaveSnapshot.current = saveSnapshot;
        savedCloudSnapshot.current = saveSnapshot;
        setSaveStatus('error');
        setLastSaved(new Date());
        if (isNew) {
          const newDraft = localStorage.getItem('seo_hub_draft_new');
          if (newDraft) localStorage.setItem(`seo_hub_draft_${saved.id}`, newDraft);
          localStorage.removeItem('seo_hub_draft_new');
          navigate(`/admin/blogs/editor/${saved.id}`, { replace: true });
        }
        return;
      }

      failedSaveSnapshot.current = null;
      setSaveStatus('saved_cloud');
      setLastSaved(new Date());
      savedCloudSnapshot.current = saveSnapshot;

      let cleanupFailed = false;
      for (const imageUrl of pendingImageCleanupRef.current) {
        try {
          await deleteImage.mutateAsync(imageUrl);
          pendingImageCleanupRef.current.delete(imageUrl);
        } catch {
          cleanupFailed = true;
        }
      }
      if (cleanupFailed) toast.error('Article saved, but one or more unused images could not be removed.');
      
      // Clear local storage upon successful cloud save
      if (latestSnapshot.current === saveSnapshot) {
        localStorage.removeItem(`seo_hub_draft_${saved.id}`);
        if (isNew) localStorage.removeItem('seo_hub_draft_new');
      }
      
      if (isNew) {
        navigate(`/admin/blogs/editor/${saved.id}`);
      }
    } catch (error: unknown) {
      failedSaveSnapshot.current = attemptedSnapshot;
      setSaveStatus('error');
      console.error(error);
    } finally {
      saveInProgress.current = false;
      if (queuedAutoSave.current) {
        queuedAutoSave.current = false;
        window.setTimeout(() => void handleSave(undefined, true), 0);
      }
    }
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Local Storage Autosave Effect (debounced locally)
  useEffect(() => {
    if (!hasLoadedInitialData.current) return;
    if (isUploadingCover || uploadingBlockIndex !== null) return;
    if (currentSnapshot === savedCloudSnapshot.current) return;
    setSaveStatus('unsaved');
    
    // Don't save entirely empty drafts to local storage
    if (!title.trim() && blocks.length === 1 && !('text' in blocks[0] && blocks[0].text) && !coverImage) return;

    const timer = setTimeout(() => {
      const draftKey = `seo_hub_draft_${currentDocId.current || 'new'}`;
      const draftData = {
        title, slug, excerpt, coverImage, status, scheduledAt, categoryId, authorId, tagIds, blocks, seoMetadata
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      if (currentSnapshot !== savedCloudSnapshot.current) {
        setSaveStatus(navigator.onLine ? 'saved_local' : 'offline');
      }
      setLastSaved(new Date());
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, slug, excerpt, coverImage, status, scheduledAt, categoryId, authorId, tagIds, blocks, seoMetadata, currentSnapshot, isUploadingCover, uploadingBlockIndex]);

  useEffect(() => {
    if (
      !hasLoadedInitialData.current
      || !title.trim()
      || isUploadingCover
      || uploadingBlockIndex !== null
      || status !== persistedStatus.current
      || currentSnapshot === savedCloudSnapshot.current
      || currentSnapshot === failedSaveSnapshot.current
    ) return;

    const timer = window.setTimeout(() => {
      void handleSaveRef.current(undefined, true);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [currentSnapshot, title, isUploadingCover, uploadingBlockIndex, status]);

  useEffect(() => {
    const handleOnline = () => {
      if (latestSnapshot.current !== savedCloudSnapshot.current) {
        void handleSaveRef.current(undefined, true);
      }
    };
    const handleOffline = () => setSaveStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePublishClick = () => {
    if (!title.trim() || !contentText) {
      toast.error('Add an article title and content before publishing.');
      setIsConfigOpen(true);
      return;
    }
    if (status === 'scheduled' && (!scheduledAt || Number.isNaN(Date.parse(scheduledAt)))) {
      toast.error('Choose a valid date and time to schedule this article.');
      setIsConfigOpen(true);
      return;
    }
    setIsPublishConfirmOpen(true);
  };

  const handleSaveDraftClick = () => {
    if (persistedStatus.current === 'published'
      && !window.confirm('Unpublish this article and save it as a draft?')) return;
    if (status === 'review') {
      void handleSave('review');
      return;
    }
    void handleSave('draft');
  };

  const handleDeleteArticle = async () => {
    const blogId = currentDocId.current;
    if (!blogId || !window.confirm('Delete this article permanently? This cannot be undone.')) return;

    const imageUrls = new Set<string>();
    if (coverImage) imageUrls.add(coverImage);
    blocks.forEach((block) => {
      if (block.type === 'image' && block.url) imageUrls.add(block.url);
      if (block.type === 'rich_text') getBlogImageUrls(block.html).forEach((url) => imageUrls.add(url));
    });

    try {
      await deleteBlog.mutateAsync(blogId);
      localStorage.removeItem(`seo_hub_draft_${blogId}`);
      for (const imageUrl of imageUrls) {
        try {
          await deleteImage.mutateAsync(imageUrl);
        } catch (error) {
          console.error('Article deleted but an image could not be cleaned up:', error);
          toast.error('Article deleted, but an unused image could not be removed.');
        }
      }
      navigate('/admin/blogs');
    } catch (error) {
      console.error('Could not delete article:', error);
    }
  };

  const handleUpdateBlock = (index: number, newBlock: BlogBlock) => {
    setBlocks((current) => current.map((block, blockIndex) => blockIndex === index ? newBlock : block));
  };

  const handleAddBlock = (type: BlogBlock['type']) => {
    let newBlock: BlogBlock;
    switch (type) {
      case 'heading': newBlock = { type: 'heading', level: 2, text: '', id: `h-${Date.now()}` }; break;
      case 'paragraph': newBlock = { type: 'paragraph', text: '' }; break;
      case 'quote': newBlock = { type: 'quote', text: '' }; break;
      case 'code': newBlock = { type: 'code', code: '' }; break;
      case 'executive_summary': newBlock = { type: 'executive_summary', items: [''] }; break;
      case 'implementation_note': newBlock = { type: 'implementation_note', text: '' }; break;
      case 'image': newBlock = { type: 'image', url: '', caption: '', alt: '' }; break;
      case 'rich_text': newBlock = { type: 'rich_text', html: '' }; break;
      default: return;
    }
    setBlocks((current) => [...current, newBlock]);
  };

  const handleRemoveBlock = (index: number) => {
    const block = blocks[index];
    if (block.type === 'image' && block.url) queueImageCleanup(block.url);
    if (block.type === 'rich_text') getBlogImageUrls(block.html).forEach(queueImageCleanup);
    setBlocks((current) => current.filter((_, i) => i !== index));
  };
  
  const handleCoverUpload = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    const oldCover = coverImage;
    
    // Optimistic UI - show immediately
    setCoverImage(localUrl);
    setIsUploadingCover(true);
    setCoverUploadProgress(0);
    
    // Simulate deterministic progress curve
    const progressInterval = setInterval(() => {
      setCoverUploadProgress(prev => (prev < 90 ? prev + (90 - prev) * 0.15 + 2 : prev));
    }, 150);
    
    try {
      const url = await uploadImage.mutateAsync(file);
      
      setCoverUploadProgress(100);
      clearInterval(progressInterval);
      setCoverImage(url);
      if (oldCover && oldCover !== url) queueImageCleanup(oldCover);
    } catch (e) {
      clearInterval(progressInterval);
      setCoverImage(oldCover); // Revert on fail
    } finally {
      setTimeout(() => setIsUploadingCover(false), 400);
      URL.revokeObjectURL(localUrl);
    }
  };

  const handleBlockImageUpload = async (index: number, block: Extract<BlogBlock, { type: 'image' }>, file: File) => {
    const localUrl = URL.createObjectURL(file);
    const oldUrl = block.url;
    
    // Optimistic UI - show immediately
    setBlocks((current) => current.map((item, itemIndex) =>
      itemIndex === index && item.type === 'image' ? { ...item, url: localUrl } : item
    ));
    setUploadingBlockIndex(index);
    setBlockUploadProgress(prev => ({ ...prev, [index]: 0 }));
    
    const progressInterval = setInterval(() => {
      setBlockUploadProgress(prev => {
        const current = prev[index] || 0;
        return { ...prev, [index]: current < 90 ? current + (90 - current) * 0.15 + 2 : current };
      });
    }, 150);
    
    try {
      const url = await uploadImage.mutateAsync(file);
      
      setBlockUploadProgress(prev => ({ ...prev, [index]: 100 }));
      clearInterval(progressInterval);
      setBlocks((current) => current.map((item, itemIndex) =>
        itemIndex === index && item.type === 'image' ? { ...item, url } : item
      ));
      if (oldUrl && oldUrl !== url) queueImageCleanup(oldUrl);
    } catch (e) {
      clearInterval(progressInterval);
      setBlocks((current) => current.map((item, itemIndex) =>
        itemIndex === index && item.type === 'image' ? { ...item, url: oldUrl } : item
      ));
    } finally {
      setTimeout(() => {
        setUploadingBlockIndex(null);
        setBlockUploadProgress(prev => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }, 400);
      URL.revokeObjectURL(localUrl);
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'heading': return <Heading1 className="h-3.5 w-3.5 text-gray-400" />;
      case 'paragraph': return <AlignLeft className="h-3.5 w-3.5 text-gray-400" />;
      case 'quote': return <Quote className="h-3.5 w-3.5 text-gray-400" />;
      case 'code': return <Code className="h-3.5 w-3.5 text-gray-400" />;
      case 'executive_summary': return <ListChecks className="h-3.5 w-3.5 text-gray-400" />;
      case 'implementation_note': return <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />;
      case 'image': return <ImageIcon className="h-3.5 w-3.5 text-gray-400" />;
      default: return null;
    }
  };

  const contentText = blocks.map((block) => {
    if (block.type === 'rich_text') return block.html.replace(/<[^>]*>/g, ' ');
    if (block.type === 'code') return block.code;
    if (block.type === 'executive_summary') return block.items.join(' ');
    if ('text' in block) return block.text;
    return '';
  }).join(' ').trim();
  const h1Count = blocks.reduce(
    (count, block) => count + (block.type === 'rich_text' ? (block.html.match(/<h1(?:\s|>)/gi) ?? []).length : 0),
    0
  );
  const hasInlineImageWithoutAlt = blocks.some((block) =>
    block.type === 'rich_text' && /<img\b(?![^>]*\balt\s*=\s*["'][^"']+["'])/i.test(block.html)
  );
  const hasInternalLink = blocks.some((block) =>
    block.type === 'rich_text' && /<a\b[^>]*href\s*=\s*["']\/(?!\/)/i.test(block.html)
  );
  const seoWarnings = [
    !seoMetadata.seo_title?.trim() && 'Add an SEO title.',
    !seoMetadata.meta_description?.trim() && 'Add a meta description.',
    !excerpt.trim() && 'Add an excerpt for article cards and search snippets.',
    !coverImage && 'Add a featured image.',
    coverImage && !seoMetadata.cover_image_alt?.trim() && 'Add alt text to the featured image.',
    hasInlineImageWithoutAlt && 'Add alt text to each inline image.',
    !seoMetadata.focus_keyword?.trim() && 'Add a focus keyword.',
    h1Count > 1 && 'Use only one H1 heading in the article body.',
    seoMetadata.canonical_url && !/^https?:\/\/\S+$/i.test(seoMetadata.canonical_url.trim()) && 'Enter a valid HTTP or HTTPS canonical URL.',
    !contentText && 'Add article content.',
    contentText && !hasInternalLink && 'Consider adding an internal link.',
  ].filter((warning): warning is string => typeof warning === 'string');
  const readiness = Math.max(0, 100 - seoWarnings.length * 10);

  if (isLoading && !isNew) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-2xl w-full" />;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -m-6 bg-[#faf9f5] relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Global Minimalist Top Chrome */}
      <div className={`h-14 shrink-0 border-b border-[#e8e6dc] bg-white px-4 flex items-center justify-between z-30 transition-opacity duration-500 ${isTyping ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
        <div className="flex items-center gap-4">
          <Link
            to="/admin/blogs"
            onClick={(event) => {
              if (latestSnapshot.current !== savedCloudSnapshot.current && !window.confirm('Leave without saving your latest changes?')) {
                event.preventDefault();
              }
            }}
            className="text-gray-400 hover:text-[#141413] transition-colors p-1.5 rounded-md hover:bg-[#f5f4ed]"
            aria-label="Back to articles"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-4 w-[1px] bg-[#e8e6dc]" />
          
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">{status}</span>
            {saveStatus === 'unsaved' && <span className="text-[12px] text-amber-700">Unsaved changes</span>}
            {saveStatus === 'saving' && <span className="text-[12px] text-gray-400 flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5 animate-pulse" /> Saving to cloud...</span>}
            {saveStatus === 'saved_local' && <span className="text-[12px] text-gray-400 flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-gray-400" /> Saved locally</span>}
            {saveStatus === 'saved_cloud' && <span className="text-[12px] text-gray-400 flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Saved to cloud</span>}
            {saveStatus === 'offline' && <span className="text-[12px] text-amber-700">Offline — changes saved locally</span>}
            {saveStatus === 'error' && <span className="text-[12px] text-red-400 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Save failed</span>}
            {(isUploadingCover || uploadingBlockIndex !== null) && <span className="text-[12px] text-[#c96442] flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading media...</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          {/* SEO Health Circle */}
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f5f4ed] transition-colors group"
            title="Publish Readiness"
          >
            <div className="relative h-5 w-5 rounded-full border-2 border-[#e8e6dc] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className={`${readiness === 100 ? 'text-emerald-500' : readiness > 50 ? 'text-amber-500' : 'text-gray-300'}`}
                  strokeDasharray={`${readiness}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </button>

          <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${isConfigOpen ? 'bg-[#f5f4ed] text-[#141413]' : 'text-gray-600 hover:bg-[#f5f4ed] hover:text-[#141413]'}`}
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </button>

          {currentDocId.current && (
            <button
              type="button"
              onClick={() => void handleDeleteArticle()}
              disabled={deleteBlog.isPending || saveBlog.isPending}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              aria-label="Delete article"
              title="Delete article"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          <button 
            onClick={handleSaveDraftClick}
            disabled={saveBlog.isPending || isUploadingCover || uploadingBlockIndex !== null}
            className="inline-flex items-center gap-1.5 bg-white border border-[#e8e6dc] hover:bg-[#f5f4ed] text-[#141413] px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {status === 'published' ? 'Unpublish' : status === 'review' ? 'Save for Review' : 'Save Draft'}
          </button>

          <button 
            onClick={handlePublishClick}
            disabled={saveBlog.isPending || isUploadingCover || uploadingBlockIndex !== null}
            className="inline-flex items-center gap-1.5 bg-[#141413] hover:bg-black text-white px-5 py-1.5 rounded-md text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50 disabled:bg-gray-300"
          >
            {status === 'published' ? 'Update Published' : status === 'scheduled' ? 'Schedule' : 'Publish'}
          </button>
        </div>
      </div>

      {isPublishConfirmOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#141413]/35 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-confirm-title"
            className="w-full max-w-md rounded-xl border border-[#e8e6dc] bg-white p-6 shadow-2xl"
          >
            <h2 id="publish-confirm-title" className="font-serif text-xl text-[#141413]">
              {status === 'published' ? 'Update published article?' : status === 'scheduled' ? 'Schedule this article?' : 'Publish this article?'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5e5d59]">
              {status === 'scheduled'
                ? `This article will be published at ${new Date(scheduledAt).toLocaleString()}.`
                : 'The article will become publicly available after it is saved.'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPublishConfirmOpen(false)}
                className="rounded-md border border-[#e8e6dc] px-4 py-2 text-sm text-[#4d4c48] hover:bg-[#f5f4ed]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPublishConfirmOpen(false);
                  void handleSave(status === 'scheduled' ? 'scheduled' : 'published');
                }}
                disabled={saveBlog.isPending}
                className="rounded-md bg-[#141413] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
              >
                {status === 'scheduled' ? 'Schedule article' : status === 'published' ? 'Save update' : 'Publish now'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Editor & Preview Split View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-[60px] lg:pb-0 relative">
        
        {/* Left Side: Block Editor Canvas */}
        <div className={`w-full lg:w-1/2 flex-col border-r border-[#e8e6dc] bg-white relative ${mobileView === 'write' ? 'flex' : 'hidden lg:flex'}`} 
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
              const imageBlock: Extract<BlogBlock, { type: 'image' }> = { type: 'image', url: '', alt: 'Uploading...' };
              const index = blocks.length;
              setBlocks((current) => [...current, imageBlock]);
              await handleBlockImageUpload(index, imageBlock, file);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          
          {/* Subtle Sticky Toolbar for Insertions */}
          <div className="sticky top-0 z-10 flex items-center justify-center p-2 bg-gradient-to-b from-white via-white/90 to-transparent pointer-events-none">
            <div className="flex items-center gap-1 bg-white border border-[#e8e6dc] p-1 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] pointer-events-auto transition-opacity duration-300 hover:opacity-100 opacity-60">
              <button onClick={() => handleAddBlock('paragraph')} className="p-1.5 rounded-full text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-all" title="Paragraph"><AlignLeft className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleAddBlock('rich_text')} className="p-1.5 rounded-full text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-all" title="Rich text"><PenLine className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleAddBlock('heading')} className="p-1.5 rounded-full text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-all" title="Heading"><Heading1 className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleAddBlock('image')} className="p-1.5 rounded-full text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-all" title="Image"><ImageIcon className="h-3.5 w-3.5" /></button>
              <div className="w-[1px] h-4 bg-[#e8e6dc] mx-1" />
              <button onClick={() => handleAddBlock('quote')} className="p-1.5 rounded-full text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-all" title="Quote"><Quote className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleAddBlock('code')} className="p-1.5 rounded-full text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-all" title="Code Block"><Code className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleAddBlock('executive_summary')} className="p-1.5 rounded-full text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-all" title="Summary"><ListChecks className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 pb-32">
            <div className="max-w-[720px] mx-auto space-y-2">
              
              {/* Giant Title Input */}
              <div className="mb-10 lg:px-4">
                <textarea 
                  value={title} 
                  onChange={e => {
                    setTitle(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                    handleTyping();
                  }}
                  placeholder="Article Title"
                  className="w-full text-[40px] lg:text-[48px] font-bold font-serif text-[#141413] bg-transparent outline-none placeholder:text-gray-300 leading-[1.1] resize-none overflow-hidden"
                  rows={1}
                />
              </div>

              {/* Blocks Array */}
              {blocks.map((block, index) => (
                <div 
                  key={index} 
                  className="group relative flex items-start -ml-6 lg:-ml-8"
                  onMouseEnter={() => setHoveredBlockIndex(index)}
                  onClick={() => setActiveBlockIndex(index)}
                  onMouseLeave={() => setHoveredBlockIndex(null)}
                >
                  
                  {/* Subtle Drag & Action Handles */}
                  <div className={`w-6 lg:w-8 flex items-center justify-center pt-2 gap-0.5 transition-opacity duration-200 ${hoveredBlockIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                    <button className="text-gray-300 hover:text-[#141413] cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleRemoveBlock(index)} className="text-gray-300 hover:text-red-500 hidden lg:block">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Block Content Canvas */}
                  <div className={`flex-1 rounded-xl group-hover:bg-[#f5f4ed]/50 transition-colors p-2 lg:p-3 -my-2 relative border-l-2 ${activeBlockIndex === index ? 'border-[#c96442]' : 'border-transparent'}`}>
                    
                    {block.type === 'paragraph' && (
                      <textarea 
                        value={block.text} 
                        onChange={e => {
                          handleTyping();
                          const val = e.target.value;
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                          
                          if (val.endsWith('/')) {
                            setSlashMenu({ isOpen: true, index, search: '' });
                          } else if (slashMenu?.isOpen && slashMenu.index === index) {
                            const parts = val.split('/');
                            setSlashMenu({ ...slashMenu, search: parts[parts.length - 1] });
                          }
                          if (!val.includes('/')) setSlashMenu(null);
                          handleUpdateBlock(index, { ...block, text: val });
                        }}
                        className="w-full font-serif text-[18px] lg:text-[20px] text-[#4d4c48] bg-transparent outline-none min-h-[40px] resize-none placeholder:text-gray-300 leading-relaxed py-1 px-2"
                        placeholder="Type '/' for commands"
                        rows={1}
                        style={{ height: 'auto' }}
                        onFocus={(e) => {
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                    )}

                    {block.type === 'rich_text' && (
                      <BlogRichTextEditor
                        value={block.html}
                        onChange={(html) => handleUpdateBlock(index, { ...block, html })}
                        onImageUpload={(file) => uploadImage.mutateAsync(file)}
                        onImageRemoved={queueImageCleanup}
                      />
                    )}

                    {/* Slash Command Palette */}
                    {slashMenu?.isOpen && slashMenu.index === index && block.type === 'paragraph' && (
                      <div className="absolute top-full left-4 mt-1 w-56 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-xl z-50 overflow-hidden font-sans border border-[#e8e6dc] animate-in slide-in-from-top-2">
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-[#f5f4ed]">
                          Basic Blocks
                        </div>
                        <div className="p-1">
                          {[
                            { id: 'heading', label: 'Heading', icon: Heading1 },
                            { id: 'image', label: 'Image', icon: ImageIcon },
                            { id: 'quote', label: 'Quote', icon: Quote },
                            { id: 'code', label: 'Code Block', icon: Code },
                            { id: 'executive_summary', label: 'Summary', icon: ListChecks }
                          ].filter(cmd => cmd.label.toLowerCase().includes(slashMenu.search.toLowerCase())).map(cmd => (
                            <button
                              key={cmd.id}
                              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-700 hover:bg-[#f5f4ed] hover:text-[#141413] rounded-lg text-left transition-colors"
                              onClick={() => {
                                const newBlock = createSlashBlock(cmd.id);
                                if (newBlock) handleUpdateBlock(index, newBlock);
                                setSlashMenu(null);
                              }}
                            >
                              <cmd.icon className="h-4 w-4 text-gray-400" />
                              {cmd.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'heading' && (
                      <div className="flex gap-2 px-2 py-1">
                        <select 
                          value={block.level} 
                          onChange={e => handleUpdateBlock(index, { ...block, level: Number(e.target.value) as 2|3 })} 
                          className="bg-transparent border-none text-[13px] font-medium text-gray-400 outline-none cursor-pointer hover:text-[#141413]"
                        >
                          <option value={2}>H2</option>
                          <option value={3}>H3</option>
                        </select>
                        <input 
                          type="text" 
                          value={block.text} 
                          onChange={e => {
                            handleTyping();
                            handleUpdateBlock(index, { ...block, text: e.target.value });
                          }} 
                          className={`flex-1 bg-transparent outline-none text-[#141413] font-semibold placeholder:text-gray-300 ${block.level === 2 ? 'text-[28px]' : 'text-[22px]'}`} 
                          placeholder="Heading..." 
                        />
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <div className="border-l-2 border-[#c96442] pl-6 py-2 my-2">
                        <textarea 
                          value={block.text} 
                          onChange={e => {
                            handleTyping();
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                            handleUpdateBlock(index, { ...block, text: e.target.value });
                          }} 
                          className="w-full text-[20px] font-serif text-[#4d4c48] bg-transparent italic outline-none min-h-[40px] resize-none placeholder:text-gray-300" 
                          placeholder="Enter quote..." 
                          rows={1}
                        />
                      </div>
                    )}

                    {block.type === 'code' && (
                      <div className="bg-[#141413] rounded-xl p-5 my-3 shadow-sm">
                        <textarea 
                          value={block.code} 
                          onChange={e => handleUpdateBlock(index, { ...block, code: e.target.value })} 
                          className="w-full text-[14px] text-gray-300 font-mono bg-transparent outline-none min-h-[100px] resize-y placeholder:text-gray-600 leading-relaxed" 
                          placeholder="// Write code here..." 
                        />
                      </div>
                    )}

                    {block.type === 'implementation_note' && (
                      <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-5 my-3">
                         <div className="flex items-start gap-3">
                           <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                           <textarea 
                             value={block.text} 
                             onChange={e => {
                               handleTyping();
                               e.target.style.height = 'auto';
                               e.target.style.height = e.target.scrollHeight + 'px';
                               handleUpdateBlock(index, { ...block, text: e.target.value });
                             }} 
                             className="w-full text-[15px] text-blue-900 bg-transparent outline-none min-h-[40px] resize-none placeholder:text-blue-300/50 leading-relaxed" 
                             placeholder="Implementation note..." 
                           />
                         </div>
                      </div>
                    )}

                    {block.type === 'executive_summary' && (
                      <div className="bg-white border border-[#e8e6dc] shadow-sm rounded-xl p-6 my-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#c96442] mb-5 flex items-center gap-2">
                          <ListChecks className="h-4 w-4" /> Executive Summary
                        </h4>
                        <div className="space-y-4">
                          {block.items.map((item, i) => (
                            <div key={i} className="flex gap-3 items-start group/item">
                              <span className="text-[13px] font-medium text-gray-400 mt-1 shrink-0 w-4 text-right">{i + 1}.</span>
                              <textarea 
                                value={item} 
                                onChange={e => {
                                  const newItems = [...block.items];
                                  newItems[i] = e.target.value;
                                  handleUpdateBlock(index, { ...block, items: newItems });
                                }}
                                className="flex-1 text-[15px] text-gray-700 bg-transparent outline-none resize-none min-h-[24px] border-b border-transparent focus:border-[#e8e6dc] transition-colors py-1 leading-relaxed"
                                placeholder="Summary point..."
                                rows={1}
                              />
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              const newItems = [...block.items, ''];
                              handleUpdateBlock(index, { ...block, items: newItems });
                            }} 
                            className="text-[12px] font-semibold text-gray-400 hover:text-[#141413] transition-colors ml-7 mt-2 uppercase tracking-wider"
                          >
                            + Add Point
                          </button>
                        </div>
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="bg-[#faf9f5] border border-[#e8e6dc] rounded-xl p-6 my-4 group/img relative overflow-hidden">
                         
                         {/* Block Image Upload Progress */}
                        {uploadingBlockIndex === index && (
                          <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center backdrop-blur-sm z-10 p-4">
                            <div className="w-full max-w-[160px] bg-white rounded-full h-1.5 overflow-hidden shadow-sm border border-[#e8e6dc]">
                              <div 
                                className="bg-[#c96442] h-full transition-all duration-150 ease-out rounded-full" 
                                style={{ width: `${blockUploadProgress[index] || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                         {block.url ? (
                           <div className="mb-4 relative rounded-lg overflow-hidden border border-[#e8e6dc]">
                             <img src={block.url} alt="Uploaded block" className="w-full h-auto max-h-[400px] object-contain bg-white" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                               <div className="relative">
                                 <button className="bg-white px-4 py-2 rounded-md text-[13px] font-semibold shadow-lg hover:bg-[#f5f4ed] text-[#141413]">
                                   Replace Image
                                 </button>
                                 <input 
                                   type="file" 
                                   accept="image/jpeg,image/png,image/webp,image/avif"
                                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                   onChange={async (e) => {
                                     const file = e.target.files?.[0];
                                     e.target.value = '';
                                     if (file) await handleBlockImageUpload(index, block, file);
                                   }}
                                 />
                               </div>
                             </div>
                           </div>
                         ) : (
                           <div className="border-2 border-dashed border-[#d6d4ca] rounded-xl p-8 flex flex-col items-center justify-center bg-white/50 mb-4 transition-colors hover:border-[#c96442]/50 hover:bg-[#f5f4ed]">
                             <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                             <p className="text-[13px] font-medium text-gray-600">Drag and drop or click to upload</p>
                             <input 
                               type="file" 
                               accept="image/jpeg,image/png,image/webp,image/avif"
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                               onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 e.target.value = '';
                                 if (file) await handleBlockImageUpload(index, block, file);
                               }}
                             />
                           </div>
                         )}
                         
                         <div className="space-y-3">
                           <input 
                             type="text" 
                             value={block.caption || ''} 
                             onChange={e => handleUpdateBlock(index, { ...block, caption: e.target.value })} 
                             className="w-full text-[13px] text-gray-700 bg-transparent border-b border-[#e8e6dc] px-2 py-1.5 outline-none focus:border-[#c96442]/50 transition-colors placeholder:text-gray-400" 
                             placeholder="Write a caption..." 
                           />
                           <input 
                             type="text" 
                             value={block.alt || ''} 
                             onChange={e => handleUpdateBlock(index, { ...block, alt: e.target.value })} 
                             className="w-full text-[12px] text-gray-500 bg-transparent border-b border-transparent px-2 py-1 outline-none focus:border-[#e8e6dc] transition-colors placeholder:text-gray-300" 
                             placeholder="Alt text (for accessibility)" 
                           />
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Smart Live Preview Container */}
        <div className={`w-full lg:w-1/2 flex-col bg-[#faf9f5] overflow-hidden relative ${mobileView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          
          <div className="absolute top-4 right-4 z-20 flex gap-2">
             <button
               type="button"
               onClick={() => setIsAiPanelOpen(true)}
               className="bg-white border border-[#e8e6dc] shadow-sm px-3 py-1.5 rounded-full text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center gap-1.5 text-[12px] font-semibold"
             >
               <Sparkles className="h-3.5 w-3.5" /> AI Assistant
             </button>
          </div>

          {isAiPanelOpen && (
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="blog-ai-panel-title"
              className="absolute inset-4 z-30 flex flex-col rounded-xl border border-[#e8e6dc] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 id="blog-ai-panel-title" className="flex items-center gap-2 font-serif text-xl text-[#141413]">
                  <Sparkles className="h-5 w-5 text-[#c96442]" /> AI writing assistant
                </h3>
                <button type="button" onClick={() => setIsAiPanelOpen(false)} aria-label="Close AI assistant" className="rounded p-2 text-gray-500 hover:bg-[#f5f4ed]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                Article-generation actions are unavailable: this repository has no server-side writing endpoint to call. No API credentials are exposed in the browser. Configure an authenticated provider endpoint before enabling AI edits.
              </p>
            </section>
          )}

          <div className="sticky top-0 z-10 p-3 border-b border-[#e8e6dc] bg-[#faf9f5]/90 backdrop-blur-sm flex items-center justify-between shrink-0">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 flex items-center gap-1.5 ml-4">
              <LayoutTemplate className="h-3.5 w-3.5" /> Live Preview
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto pb-32" style={{ scrollBehavior: 'smooth' }}>
            <header className="pt-12 pb-8 px-6 lg:px-8 max-w-[900px] mx-auto">
              <div className="max-w-[800px]">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c96442]">
                    {categories?.find(c => c.id === categoryId)?.name || 'Category'}
                  </span>
                </div>

                <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-serif font-medium leading-[1.1] text-[#141413] tracking-tight text-balance mb-6">
                  {title || 'Untitled Article'}
                </h1>

                {excerpt && (
                  <p className="text-[16px] md:text-[20px] text-[#4d4c48] leading-[1.5] mb-8 text-balance max-w-[700px]">
                    {excerpt}
                  </p>
                )}
                
                {authorId && (
                  <div className="flex items-center gap-4 py-6 border-t border-[#e8e6dc]">
                    <div className="h-10 w-10 rounded-full bg-[#e8e6dc] overflow-hidden shrink-0">
                      <img 
                        src={authors?.find(a => a.id === authorId)?.avatar_url || "https://i.pravatar.cc/150"} 
                        alt="Author" 
                        className="h-full w-full object-cover grayscale opacity-90 mix-blend-multiply" 
                      />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#141413]">{authors?.find(a => a.id === authorId)?.name}</div>
                      <div className="text-[12px] text-[#87867f]">Draft Preview</div>
                    </div>
                  </div>
                )}
              </div>
            </header>

            <div className="px-6 lg:px-8 max-w-[900px] mx-auto mb-12">
              {coverImage ? (
                <div className="aspect-[21/9] w-full rounded-[16px] bg-[#e8e6dc] overflow-hidden border border-[#d6d4ca] shadow-sm">
                  <img src={coverImage} alt={seoMetadata.cover_image_alt || title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-[21/9] w-full rounded-[16px] bg-[#e8e6dc] overflow-hidden relative group border border-[#d6d4ca] shadow-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-400 opacity-30" />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 lg:px-8 max-w-[900px] mx-auto flex">
              <main className="flex-1 max-w-[720px] shrink-0 font-serif text-[18px] lg:text-[20px] leading-relaxed text-[#4d4c48]">
                <BlogRenderer blocks={blocks} />
              </main>
            </div>
          </div>
        </div>

        {/* Collapsible Settings Drawer (Right Side Overlay) */}
        {isConfigOpen && (
          <div className="absolute inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-[#141413]/10 backdrop-blur-[2px] transition-opacity" onClick={() => setIsConfigOpen(false)} />
            <div className="w-full max-w-[400px] bg-[#faf9f5] border-l border-[#e8e6dc] shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right-8 duration-300">
              
              <div className="h-14 border-b border-[#e8e6dc] flex items-center justify-between px-5 shrink-0 bg-white">
                <h3 className="text-[13px] font-bold text-[#141413] uppercase tracking-wider flex items-center gap-2">
                  <Settings2 className="h-4 w-4" /> Post Settings
                </h3>
                <button onClick={() => setIsConfigOpen(false)} className="p-1.5 rounded-md text-gray-400 hover:text-[#141413] hover:bg-[#f5f4ed] transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Cover Image Upload (Drag & Drop) */}
                <div
                  className="space-y-3 relative"
                  onDragOver={(event) => {
                    if (Array.from(event.dataTransfer.types).includes('Files')) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    const file = Array.from(event.dataTransfer.files).find((candidate) => candidate.type.startsWith('image/'));
                    if (!file) return;
                    event.preventDefault();
                    void handleCoverUpload(file);
                  }}
                  onPaste={(event) => {
                    const imageItem = Array.from(event.clipboardData.items).find((item) => item.kind === 'file' && item.type.startsWith('image/'));
                    const file = imageItem?.getAsFile();
                    if (!file) return;
                    event.preventDefault();
                    void handleCoverUpload(file);
                  }}
                >
                  <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider">Cover Image</label>
                  
                {/* Cover Image Uploader */}
                  {isUploadingCover && (
                    <div className="absolute inset-0 top-6 bg-white/80 backdrop-blur-sm z-10 rounded-xl flex flex-col items-center justify-center border border-[#e8e6dc]">
                      <div className="w-3/4 h-1.5 bg-[#e8e6dc] rounded-full overflow-hidden mb-3 shadow-sm">
                        <div 
                          className="bg-[#c96442] h-full transition-all duration-150 ease-out rounded-full" 
                          style={{ width: `${coverUploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-semibold text-[#141413] uppercase tracking-wider">
                        {coverUploadProgress >= 100 ? 'Processing...' : 'Uploading...'}
                      </span>
                    </div>
                  )}

                  {coverImage ? (
                    <div className="relative rounded-lg overflow-hidden border border-[#e8e6dc] group">
                      <img src={coverImage} alt={seoMetadata.cover_image_alt || title} className="w-full aspect-[21/9] object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <div className="relative">
                           <button className="bg-white px-3 py-1.5 rounded-md text-[12px] font-semibold shadow-lg hover:bg-[#f5f4ed] text-[#141413]">
                             Replace Image
                           </button>
                           <input 
                             type="file" 
                             accept="image/jpeg,image/png,image/webp,image/avif"
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             onChange={async (e) => {
                               const file = e.target.files?.[0];
                               e.target.value = '';
                               if (file) await handleCoverUpload(file);
                             }}
                           />
                         </div>
                         <button onClick={() => { queueImageCleanup(coverImage); setCoverImage(''); }} className="bg-white p-1.5 rounded-md hover:bg-red-50 text-red-500 shadow-lg" title="Remove">
                           <Trash2 className="h-4 w-4" />
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#d6d4ca] rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:bg-[#f5f4ed] hover:border-[#c96442]/50 transition-colors group cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) await handleCoverUpload(file);
                        }}
                      />
                      <UploadCloud className="h-6 w-6 text-gray-400 group-hover:text-gray-600 mb-2" />
                      <span className="text-[12px] font-medium text-gray-500 text-center">Drag & drop or click to upload<br/>1200 x 630px recommended</span>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider">
                    Featured image alt text
                    <input
                      value={seoMetadata.cover_image_alt ?? ''}
                      onChange={(e) => setSeoMetadata({ ...seoMetadata, cover_image_alt: e.target.value })}
                      className="mt-2 w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] font-normal normal-case tracking-normal outline-none focus:border-[#c96442]"
                      placeholder="Describe the featured image"
                    />
                  </label>
                  
                  {/* Status Overlay */}
                  <div className="group">
                    <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider mb-2">Publish Status</label>
                    <select 
                      value={status} 
                      onChange={e => setStatus(e.target.value as BlogStatus)} 
                      className="w-full text-[13px] text-[#141413] border border-[#e8e6dc] bg-white px-3 py-2.5 rounded-md outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all shadow-sm"
                    >
                      <option value="draft">Draft (Hidden)</option>
                      <option value="review">In Review</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                      {status === 'published' && <option value="published" disabled>Published (use the toolbar to update or unpublish)</option>}
                    </select>
                  </div>
                  {status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Archive this article? It will no longer be publicly available.')) {
                          void handleSave('archived');
                        }
                      }}
                      className="text-[12px] font-medium text-red-600 hover:underline"
                    >
                      Archive article
                    </button>
                  )}

                  {status === 'scheduled' && (
                    <div className="group animate-in fade-in slide-in-from-top-1">
                      <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider mb-2">Publish Date</label>
                      <input 
                        type="datetime-local" 
                        value={scheduledAt} 
                        onChange={e => setScheduledAt(e.target.value)}
                        className="w-full text-[13px] text-[#141413] border border-[#e8e6dc] bg-white px-3 py-2.5 rounded-md outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all shadow-sm"
                      />
                    </div>
                  )}

                  <div className="group">
                    <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider mb-2">URL Slug</label>
                    <div className="flex items-center shadow-sm">
                      <span className="text-[13px] text-gray-400 bg-[#f5f4ed] border border-r-0 border-[#e8e6dc] px-3 py-2.5 rounded-l-md select-none">/blog/</span>
                      <input 
                        type="text" 
                        value={slug} 
                        onChange={e => setSlug(e.target.value)}
                        placeholder="the-article-slug"
                        className="flex-1 text-[13px] text-[#141413] border border-[#e8e6dc] bg-white px-3 py-2.5 rounded-r-md outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider mb-2">Category</label>
                    <select 
                      value={categoryId} 
                      onChange={e => setCategoryId(e.target.value)} 
                      className="w-full text-[13px] text-[#141413] border border-[#e8e6dc] bg-white px-3 py-2.5 rounded-md outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all shadow-sm"
                    >
                      <option value="">Select Category...</option>
                      {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <fieldset>
                    <legend className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Tags</legend>
                    <div className="max-h-36 space-y-2 overflow-y-auto rounded-md border border-[#e8e6dc] bg-white p-3">
                      {tags?.length ? tags.map((tag) => (
                        <label key={tag.id} className="flex items-center gap-2 text-[13px] text-[#4d4c48]">
                          <input
                            type="checkbox"
                            checked={tagIds.includes(tag.id)}
                            onChange={(event) => {
                              setTagIds((current) => event.target.checked
                                ? [...new Set([...current, tag.id])]
                                : current.filter((tagId) => tagId !== tag.id));
                            }}
                          />
                          {tag.name}
                        </label>
                      )) : <p className="text-[12px] text-gray-500">No tags are configured yet.</p>}
                    </div>
                  </fieldset>

                  <div className="group">
                    <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider mb-2">Author</label>
                    <select 
                      value={authorId} 
                      onChange={e => setAuthorId(e.target.value)} 
                      className="w-full text-[13px] text-[#141413] border border-[#e8e6dc] bg-white px-3 py-2.5 rounded-md outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all shadow-sm"
                    >
                      <option value="">Select Author...</option>
                      {authors?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="group">
                    <label className="block text-[12px] font-bold text-[#141413] uppercase tracking-wider mb-2">Executive Excerpt</label>
                    <textarea 
                      value={excerpt} 
                      onChange={e => setExcerpt(e.target.value)}
                      placeholder="Brief summary for SEO metadata and article cards..."
                      className="w-full text-[13px] text-[#141413] border border-[#e8e6dc] bg-white px-3 py-2.5 rounded-md outline-none focus:border-[#c96442] focus:ring-2 focus:ring-[#c96442]/20 transition-all shadow-sm resize-none h-24 leading-relaxed"
                    />
                    <div className="mt-1.5 flex justify-between items-center text-[11px]">
                      <span className="text-gray-400">Used for {`<meta description>`}</span>
                      <span className={`${excerpt.length > 160 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>{excerpt.length} / 160</span>
                    </div>
                  </div>

                  <section className="space-y-5 border-t border-[#e8e6dc] pt-6">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#141413]">Search and sharing</h4>
                      <p className="mt-1 text-[11px] text-gray-500">Editorial guidance only; these lengths do not guarantee rankings.</p>
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">SEO title</label>
                      <input
                        value={seoMetadata.seo_title ?? ''}
                        onChange={(e) => setSeoMetadata({ ...seoMetadata, seo_title: e.target.value })}
                        maxLength={70}
                        className="w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#c96442]"
                        placeholder={title || 'Search result title'}
                      />
                      <p className={`mt-1 text-right text-[11px] ${(seoMetadata.seo_title ?? title).length > 60 ? 'text-amber-700' : 'text-gray-400'}`}>
                        {(seoMetadata.seo_title ?? title).length} / 60 recommended
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Meta description</label>
                      <textarea
                        value={seoMetadata.meta_description ?? ''}
                        onChange={(e) => setSeoMetadata({ ...seoMetadata, meta_description: e.target.value })}
                        maxLength={200}
                        rows={3}
                        className="w-full resize-y rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] leading-relaxed outline-none focus:border-[#c96442]"
                        placeholder={excerpt || 'Summarize this article'}
                      />
                      <p className={`mt-1 text-right text-[11px] ${(seoMetadata.meta_description ?? excerpt).length > 160 ? 'text-amber-700' : 'text-gray-400'}`}>
                        {(seoMetadata.meta_description ?? excerpt).length} / 160 recommended
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Canonical URL</label>
                      <input
                        type="url"
                        value={seoMetadata.canonical_url ?? ''}
                        onChange={(e) => setSeoMetadata({ ...seoMetadata, canonical_url: e.target.value })}
                        className="w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#c96442]"
                        placeholder="https://example.com/blog/article"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Focus keyword</label>
                        <input
                          value={seoMetadata.focus_keyword ?? ''}
                          onChange={(e) => setSeoMetadata({ ...seoMetadata, focus_keyword: e.target.value })}
                          className="w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#c96442]"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Secondary keywords</label>
                        <input
                          value={(seoMetadata.secondary_keywords ?? []).join(', ')}
                          onChange={(e) => setSeoMetadata({
                            ...seoMetadata,
                            secondary_keywords: e.target.value.split(',').map((keyword) => keyword.trim()).filter(Boolean),
                          })}
                          className="w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#c96442]"
                          placeholder="Separate keywords with commas"
                        />
                      </div>
                    </div>

                    <fieldset className="space-y-2">
                      <legend className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#141413]">Robots</legend>
                      <label className="flex items-center gap-2 text-[13px] text-[#4d4c48]">
                        <input type="checkbox" checked={seoMetadata.robots_index !== false} onChange={(e) => setSeoMetadata({ ...seoMetadata, robots_index: e.target.checked })} />
                        Allow indexing
                      </label>
                      <label className="flex items-center gap-2 text-[13px] text-[#4d4c48]">
                        <input type="checkbox" checked={seoMetadata.robots_follow !== false} onChange={(e) => setSeoMetadata({ ...seoMetadata, robots_follow: e.target.checked })} />
                        Allow link following
                      </label>
                    </fieldset>

                    <div>
                      <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Open Graph title</label>
                      <input value={seoMetadata.og_title ?? ''} onChange={(e) => setSeoMetadata({ ...seoMetadata, og_title: e.target.value })} className="w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#c96442]" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Open Graph description</label>
                      <textarea value={seoMetadata.og_description ?? ''} onChange={(e) => setSeoMetadata({ ...seoMetadata, og_description: e.target.value })} rows={2} className="w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#c96442]" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-[#141413]">Open Graph image URL</label>
                      <input type="url" value={seoMetadata.og_image ?? ''} onChange={(e) => setSeoMetadata({ ...seoMetadata, og_image: e.target.value })} className="w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#c96442]" placeholder="Defaults to the featured image" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#141413]">
                        Twitter card
                        <select value={seoMetadata.twitter_card ?? 'summary_large_image'} onChange={(e) => setSeoMetadata({ ...seoMetadata, twitter_card: e.target.value as BlogSeoMetadata['twitter_card'] })} className="mt-2 w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] font-normal normal-case tracking-normal">
                          <option value="summary_large_image">Large image</option>
                          <option value="summary">Summary</option>
                        </select>
                      </label>
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#141413]">
                        Schema type
                        <select value={seoMetadata.schema_type ?? 'BlogPosting'} onChange={(e) => setSeoMetadata({ ...seoMetadata, schema_type: e.target.value as BlogSeoMetadata['schema_type'] })} className="mt-2 w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] font-normal normal-case tracking-normal">
                          <option value="BlogPosting">BlogPosting</option>
                          <option value="Article">Article</option>
                        </select>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-[#141413]">
                        Twitter title
                        <input value={seoMetadata.twitter_title ?? ''} onChange={(e) => setSeoMetadata({ ...seoMetadata, twitter_title: e.target.value })} className="mt-2 w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] font-normal normal-case tracking-normal outline-none focus:border-[#c96442]" />
                      </label>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-[#141413]">
                        Twitter description
                        <textarea value={seoMetadata.twitter_description ?? ''} onChange={(e) => setSeoMetadata({ ...seoMetadata, twitter_description: e.target.value })} rows={2} className="mt-2 w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] font-normal normal-case tracking-normal outline-none focus:border-[#c96442]" />
                      </label>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-[#141413]">
                        Twitter image URL
                        <input type="url" value={seoMetadata.twitter_image ?? ''} onChange={(e) => setSeoMetadata({ ...seoMetadata, twitter_image: e.target.value })} className="mt-2 w-full rounded-md border border-[#e8e6dc] bg-white px-3 py-2.5 text-[13px] font-normal normal-case tracking-normal outline-none focus:border-[#c96442]" placeholder="Defaults to the Open Graph image" />
                      </label>
                    </div>

                    <div className="rounded-lg border border-[#e8e6dc] bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Search appearance preview</p>
                      <p className="mt-2 truncate text-[11px] text-emerald-800">{siteUrl(`/blog/${slug || 'article-slug'}`)}</p>
                      <p className="mt-1 line-clamp-1 text-[16px] text-blue-800">{seoMetadata.seo_title || title || 'Article title'}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-gray-600">{seoMetadata.meta_description || excerpt || 'Add a meta description to preview the search snippet.'}</p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-[#e8e6dc] bg-white">
                      {(seoMetadata.og_image || coverImage) && (
                        <img src={seoMetadata.og_image || coverImage} alt="" className="aspect-[1.91/1] w-full object-cover" />
                      )}
                      <div className="p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">Social sharing preview</p>
                        <p className="mt-1 line-clamp-1 text-sm font-semibold text-[#141413]">{seoMetadata.og_title || seoMetadata.seo_title || title || 'Article title'}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">{seoMetadata.og_description || seoMetadata.meta_description || excerpt || 'Add a description for social sharing.'}</p>
                      </div>
                    </div>
                  </section>
                </div>

              </div>
              
              {/* Readiness Panel Footer */}
              <div className="p-5 border-t border-[#e8e6dc] bg-white mt-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full border-[3px] border-[#f5f4ed] flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className={`${readiness === 100 ? 'text-emerald-500' : readiness > 50 ? 'text-amber-500' : 'text-gray-300'}`}
                        strokeDasharray={`${readiness}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="3"
                      />
                    </svg>
                    <span className="text-[11px] font-bold text-[#141413]">{readiness}%</span>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-[#141413]">Publish Readiness</h4>
                    <p className="text-[11px] text-gray-500">Complete required fields.</p>
                  </div>
                </div>
                
                <ul className="space-y-1.5 text-[11px] text-gray-500" aria-live="polite">
                  {seoWarnings.length
                    ? seoWarnings.slice(0, 6).map((warning) => (
                      <li key={warning} className="flex items-start gap-2">
                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                        {warning}
                      </li>
                    ))
                    : <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> No editorial SEO warnings.</li>}
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Navigation Tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[#e8e6dc] z-50 flex shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setMobileView('write')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${mobileView === 'write' ? 'text-[#c96442]' : 'text-gray-500 hover:text-[#141413]'}`}
        >
          <PenLine className="h-5 w-5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Write</span>
        </button>
        <div className="w-[1px] h-full bg-[#f5f4ed]" />
        <button 
          onClick={() => setMobileView('preview')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${mobileView === 'preview' ? 'text-[#c96442]' : 'text-gray-500 hover:text-[#141413]'}`}
        >
          <Eye className="h-5 w-5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Preview</span>
        </button>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
