'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CarouselCards } from './carousel-cards';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none text-foreground text-sm leading-relaxed break-words',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className='mb-2 last:mb-0 leading-relaxed'>{children}</p>,
          strong: ({ children }) => (
            <strong className='font-semibold text-foreground tracking-tight'>{children}</strong>
          ),
          em: ({ children }) => <em className='italic text-foreground/90'>{children}</em>,
          ul: ({ children }) => (
            <ul className='list-disc pl-5 my-2 space-y-1 marker:text-primary/70'>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className='list-decimal pl-5 my-2 space-y-1 marker:text-primary/70'>{children}</ol>
          ),
          li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
          h1: ({ children }) => (
            <h1 className='text-base font-bold text-foreground mt-3 mb-1.5 tracking-tight border-b border-border/40 pb-1'>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-sm font-bold text-foreground mt-3 mb-1 tracking-tight'>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-xs sm:text-sm font-semibold text-foreground mt-2.5 mb-1'>
              {children}
            </h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className='border-l-3 border-primary/60 bg-muted/30 px-3 py-1.5 rounded-r-lg my-2 italic text-muted-foreground text-xs sm:text-sm'>
              {children}
            </blockquote>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';

            if (lang === 'carousel' || lang === 'cards') {
              const rawString = String(children).replace(/\n$/, '');
              const slides = rawString
                .split(/<!--\s*slide\s*-->|(?:\r?\n){2,}---(?:\r?\n){2,}/)
                .map((s) => s.trim())
                .filter(Boolean);

              if (slides.length > 0) {
                return <CarouselCards slides={slides} />;
              }
            }

            const isBlock = Boolean(lang);
            if (isBlock) {
              return (
                <div className='my-2.5 rounded-xl border border-border/60 bg-muted/70 overflow-hidden'>
                  <pre className='p-3 overflow-x-auto text-xs font-mono text-foreground leading-snug'>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code
                className='px-1.5 py-0.5 rounded-md bg-muted text-[12px] font-mono text-primary font-medium border border-border/40'
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className='my-3 overflow-x-auto rounded-xl border border-border/60'>
              <table className='w-full text-xs text-left border-collapse'>{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className='bg-muted/80 text-muted-foreground font-semibold border-b border-border/60'>
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className='divide-y divide-border/40'>{children}</tbody>,
          tr: ({ children }) => <tr className='hover:bg-muted/30 transition-colors'>{children}</tr>,
          th: ({ children }) => <th className='px-3 py-2 text-foreground font-bold'>{children}</th>,
          td: ({ children }) => <td className='px-3 py-2 text-foreground/90'>{children}</td>,
          a: ({ href, children }) => (
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary font-medium underline underline-offset-3 hover:text-primary/80 transition-colors'
            >
              {children}
            </a>
          ),
          hr: () => <hr className='my-3 border-border/50' />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
