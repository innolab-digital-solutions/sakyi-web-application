'use client';

import { Calendar, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import type { BlogPost } from '@/domains/blogs/types';

type BlogDetailHeroSectionProps = {
  post: BlogPost;
};

const BlogDetailHeroSection = ({ post }: BlogDetailHeroSectionProps) => {
  const { language } = useLanguage();
  const hasThumbnail = post.thumbnail_url && post.thumbnail_url.trim() !== '';
  const [imageError, setImageError] = useState(false);
  const thumbnailSource =
    hasThumbnail && !imageError ? post.thumbnail_url! : '/images/no-image.png';

  const handleShare = async () => {
    const url = globalThis.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <section className='relative overflow-hidden bg-slate-50 py-16'>
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-1/4 -right-32 h-64 w-64 rounded-full bg-linear-to-br from-[#35bec5]/5 to-[#0c96c4]/5 blur-3xl' />
        <div className='absolute bottom-1/4 -left-32 h-64 w-64 rounded-full bg-linear-to-br from-[#4bc4db]/5 to-[#35bec5]/5 blur-3xl' />
      </div>

      <div className='relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        {/* Back Button */}
        <div className='mb-8' data-aos='fade-up'>
          <Link
            href='/blog'
            className='group inline-flex items-center gap-2 font-medium text-slate-600 transition-colors duration-300 hover:text-[#35bec5]'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <svg
              className='h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <div className='mb-8' data-aos='fade-up' data-aos-delay='200'>
          {/* Title */}
          <h1
            className={`mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl ${language === 'my' ? 'leading-relaxed sm:leading-relaxed lg:leading-relaxed' : 'leading-tight sm:leading-tight lg:leading-tight'}`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          <p
            className='mb-8 text-lg leading-relaxed text-slate-600'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className='flex flex-wrap items-center gap-6 text-sm text-slate-500'>
            {post.category?.name && (
              <div className='bg-brand-gradient inline-flex items-center rounded-md px-3 py-1 text-sm font-medium text-white'>
                {post.category.name}
              </div>
            )}

            {post.timestamps?.published_at && (
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  {new Date(post.timestamps.published_at).toLocaleDateString(
                    'en-US',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
                </span>
              </div>
            )}

            <button
              onClick={handleShare}
              className='flex cursor-pointer items-center gap-2 transition-colors duration-300 hover:text-[#35bec5]'
            >
              <Share2 className='h-4 w-4' />
              <span style={{ fontFamily: 'Inter, sans-serif' }}>Share</span>
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div
          className='relative overflow-hidden rounded-2xl shadow-xl'
          data-aos='fade-up'
          data-aos-delay='400'
        >
          <div className='aspect-video w-full'>
            <Image
              src={thumbnailSource}
              alt={post.title}
              width={1600}
              height={900}
              quality={95}
              priority
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px'
              className={`h-full w-full ${
                hasThumbnail && !imageError
                  ? 'object-cover'
                  : 'bg-gray-100 object-contain'
              }`}
              onError={() => {
                if (hasThumbnail) setImageError(true);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogDetailHeroSection;
