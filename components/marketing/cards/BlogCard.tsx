'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import type { BlogPost } from '@/domains/blogs/types';
import { resolveApiImageUrl } from '@/lib/utils/url';

type BlogCardProps = {
  post: BlogPost;
  index?: number;
  className?: string;
};

const BlogCard = ({ post, index = 0, className = '' }: BlogCardProps) => {
  const { language } = useLanguage();
  const resolvedThumbnail = resolveApiImageUrl(post.thumbnail_url);
  const hasThumbnail = !!resolvedThumbnail;
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      data-aos='fade-up'
      data-aos-delay={`${index * 200}`}
    >
      {/* Image */}
      <div className='mb-6 overflow-hidden rounded-xl'>
        <div className='group/image relative aspect-16/10 w-full bg-slate-100'>
          {hasThumbnail && !imageError ? (
            <>
              <Image
                src={resolvedThumbnail!}
                alt={post.title}
                fill
                quality={95}
                unoptimized={
                  resolvedThumbnail!.startsWith('http://') ||
                  resolvedThumbnail!.startsWith('https://')
                }
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                onError={() => setImageError(true)}
              />
              <div className='absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-800/5 transition-opacity duration-300 group-hover:opacity-0' />
            </>
          ) : (
            <div className='absolute inset-0 flex items-center justify-center p-6'>
              <Image
                src='/images/logo-gray.png'
                alt='Sakyi'
                width={100}
                height={100}
                className='object-contain opacity-60'
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='space-y-6'>
        {/* Metadata Row */}
        <div className='flex items-center space-x-4'>
          {post.category?.name && (
            <span
              className='rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {post.category.name}
            </span>
          )}
          {post.timestamps?.published_at && (
            <span
              className='text-sm text-slate-500'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {new Date(post.timestamps.published_at).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              )}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-2xl font-bold text-slate-900 ${language === 'my' ? 'leading-relaxed' : 'leading-tight'}`}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          className='line-clamp-3 text-slate-600'
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {post.excerpt}
        </p>

        {/* CTA */}
        <div className='pt-2'>
          <Link
            href={`/blog/${post.slug}`}
            className='group/link inline-flex items-center text-base font-medium text-slate-900 transition-all duration-300 hover:text-[#35bec5]'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <span>Read more</span>
            <ArrowRight className='ml-2 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
