'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { useMemo } from 'react';

import BlogCard from '@/components/marketing/cards/BlogCard';
import ContentEmptyState from '@/components/marketing/cards/ContentEmptyState';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { getBlogPosts } from '@/domains/blogs/services';
import type { BlogPost } from '@/domains/blogs/types';

import SectionBadge from '../../SectionBadge';

const ExploreArticlesSection = () => {
  const { language, translate } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts', language],
    queryFn: () => getBlogPosts(language),
    staleTime: 1000 * 60 * 5,
  });

  const posts = useMemo(() => {
    if (data?.status !== 'success') return [];
    return data.data as BlogPost[];
  }, [data]);

  return (
    <SectionContainer id='explore-articles-section' className='bg-white'>
      {/* Header */}
      <div
        className='flex min-w-0 flex-col items-center justify-center space-y-6 text-center'
        data-aos='fade-up'
      >
        <SectionBadge
          icon={<BookOpen className='h-4 w-4' />}
          text={translate('marketing.pages.blog.articles.badge')}
        />

        <Heading1 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.blog.articles.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.blog.articles.title.gradient')}
          </span>
        </Heading1>

        <Body1
          lang={language}
          className='mx-auto max-w-3xl text-center text-slate-600'
        >
          {translate('marketing.pages.blog.articles.description')}
        </Body1>
      </div>

      {/* Blog Cards Grid */}
      <div className='mt-12 grid gap-8 lg:grid-cols-2'>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
            >
              <Skeleton className='aspect-3/2 w-full rounded-xl' />
              <div className='mt-4 space-y-3'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-5 w-24' />
              </div>
            </div>
          ))
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))
        ) : (
          <ContentEmptyState
            title='Fresh insights are on the way'
            description="We're curating expert articles right now. Please check back soon."
            className='col-span-full'
          />
        )}
      </div>
    </SectionContainer>
  );
};

export default ExploreArticlesSection;
