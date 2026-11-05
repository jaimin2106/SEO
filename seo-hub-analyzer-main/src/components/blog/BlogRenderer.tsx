// src/components/blog/BlogRenderer.tsx
import React from 'react';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { sanitizeBlogHtml } from '@/lib/sanitizeBlogHtml';

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string; id?: string }
  | { type: 'quote'; text: string }
  | { type: 'code'; code: string }
  | { type: 'executive_summary'; items: string[] }
  | { type: 'implementation_note'; text: string }
  | { type: 'image'; url: string; caption?: string; alt?: string }
  | { type: 'rich_text'; html: string };

interface BlogRendererProps {
  blocks: BlogBlock[];
}

export const BlogRenderer: React.FC<BlogRendererProps> = ({ blocks }) => {
  return (
    <article className="prose prose-lg md:prose-xl prose-slate max-w-none 
      prose-headings:font-serif prose-headings:font-medium prose-headings:text-[#141413] prose-headings:tracking-tight
      prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-[32px] md:prose-h2:text-[36px]
      prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-[24px]
      prose-p:text-[18px] md:prose-p:text-[19px] prose-p:leading-[1.75] prose-p:text-[#30302e] prose-p:mb-8
      prose-a:text-[#c96442] prose-a:no-underline hover:prose-a:underline prose-a:font-medium
      prose-blockquote:border-l-4 prose-blockquote:border-[#c96442] prose-blockquote:bg-transparent prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-10 prose-blockquote:text-[#141413] prose-blockquote:font-serif prose-blockquote:text-[24px] prose-blockquote:leading-[1.5] prose-blockquote:italic
      prose-li:text-[18px] md:prose-li:text-[19px] prose-li:text-[#30302e] prose-li:mb-2
      prose-strong:text-[#141413] prose-strong:font-semibold
      prose-pre:bg-[#141413] prose-pre:text-[#faf9f5] prose-pre:border prose-pre:border-[#30302e] prose-pre:rounded-[12px] prose-pre:p-6
      prose-code:text-[#c96442] prose-code:bg-[#f0eee6] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[15px]"
    >
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'executive_summary':
            return (
              <div key={index} className="bg-[#f0eee6] rounded-[12px] p-6 md:p-8 mb-12 border border-[#d6d4ca] not-prose">
                <h3 className="text-[14px] font-bold uppercase tracking-[0.1em] text-[#141413] mb-5 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#c96442]" />
                  Executive Summary
                </h3>
                <ul className="space-y-3 text-[16px] text-[#4d4c48] leading-relaxed">
                  {block.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#c96442] shrink-0 mt-0.5" />
                      <span dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(item) }} />
                    </li>
                  ))}
                </ul>
              </div>
            );

          case 'paragraph':
            return <p key={index} dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(block.text) }} />;

          case 'heading':
            if (block.level === 2) return <h2 key={index} id={block.id}>{block.text}</h2>;
            if (block.level === 3) return <h3 key={index} id={block.id}>{block.text}</h3>;
            return null;

          case 'quote':
            return (
              <blockquote key={index}>
                <p dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(`"${block.text}"`) }} />
              </blockquote>
            );

          case 'code':
            return (
              <pre key={index}>
                <code>{block.code}</code>
              </pre>
            );

          case 'implementation_note':
            return (
              <div key={index} className="my-10 bg-[#f0eee6] border border-[#d6d4ca] rounded-[12px] p-6 text-[16px] text-[#141413] not-prose">
                <strong>Implementation Note:</strong> <span dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(block.text) }} />
              </div>
            );

          case 'rich_text':
            return <div key={index} dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(block.html) }} />;

          case 'image':
            return (
              <figure key={index} className="my-10 not-prose">
                <div className="rounded-[16px] overflow-hidden border border-[#d6d4ca] shadow-sm bg-[#f0eee6]">
                  {block.url ? (
                    <img src={block.url} alt={block.alt || 'Blog image'} className="w-full h-auto object-cover" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-[#87867f] text-[13px]">Image placeholder</div>
                  )}
                </div>
                {block.caption && (
                  <figcaption className="text-center text-[14px] text-[#87867f] mt-3 italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </article>
  );
};
