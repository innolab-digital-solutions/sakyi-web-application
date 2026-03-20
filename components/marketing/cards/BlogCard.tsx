'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import type { BlogPost } from '@/domains/blogs/types';

type BlogCardProps = {
  post: BlogPost;
  index?: number;
  className?: string;
};

const BlogCard = ({ post, index = 0, className = '' }: BlogCardProps) => {
  const hasThumbnail = post.thumbnail_url && post.thumbnail_url.trim() !== '';
  const [imageError, setImageError] = useState(false);
  const thumbnailSource =
    hasThumbnail && !imageError ? post.thumbnail_url! : '/images/no-image.png';

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      data-aos='fade-up'
      data-aos-delay={`${index * 200}`}
    >
      {/* Image */}
      <div className='mb-6 overflow-hidden rounded-xl'>
        <div className='group/image relative aspect-[16/10] w-full'>
          <Image
            src={thumbnailSource}
            alt={post.title}
            width={1200}
            height={750}
            quality={95}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'
            className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${
              hasThumbnail && !imageError
                ? 'object-cover'
                : 'bg-gray-100 object-contain'
            }`}
            onError={() => {
              if (hasThumbnail) setImageError(true);
            }}
          />

          {hasThumbnail && !imageError && (
            <div className='absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-800/5 transition-opacity duration-300 group-hover:opacity-0' />
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
          {post.timestamps.published_at && (
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
          className='text-2xl leading-tight font-bold text-slate-900'
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
