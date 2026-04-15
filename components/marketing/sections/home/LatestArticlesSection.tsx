'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import PrimaryButton from '@/components/marketing/buttons/PrimaryButton';
import BlogCard from '@/components/marketing/cards/BlogCard';
import ContentEmptyState from '@/components/marketing/cards/ContentEmptyState';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/config/routes';
import { useLanguage } from '@/context/LanguageContext';
import { getBlogPosts } from '@/domains/blogs/services';
import type { BlogPost } from '@/domains/blogs/types';

const LatestArticlesSection = () => {
  const { language, translate } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['home-blog-posts', language],
    queryFn: () => getBlogPosts(language),
    staleTime: 1000 * 60 * 5,
  });

  const posts = useMemo(() => {
    if (data?.status !== 'success') return [];
    return (data.data as BlogPost[]).slice(0, 2);
  }, [data]);

  return (
    <SectionContainer id='latest-articles-section' className='bg-background'>
      <div
        className='mx-auto max-w-3xl min-w-0 space-y-6 text-center'
        data-aos='fade-up'
      >
        {/* Section badge for Latest Articles */}
        <SectionBadge
          icon={null}
          text={translate('marketing.pages.home.latest-articles.badge')}
        />

        {/* Section headline with gradient highlight */}
        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.home.latest-articles.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.home.latest-articles.title.gradient')}
          </span>
        </Heading2>

        {/* Section description */}
        <Body1 lang={language} className='mx-auto text-center'>
          {translate('marketing.pages.home.latest-articles.description')}
        </Body1>

      </div>

      <div className='mt-12 grid gap-8 lg:grid-cols-2'>
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
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
          : posts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
      </div>

      {!isLoading && posts.length === 0 && (
        <div className='mt-12'>
          <ContentEmptyState
            title='Fresh insights are on the way'
            description='We are curating expert articles right now. Please check back soon.'
          />
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className='pt-10 text-center'>
          <Link
            href={ROUTES.MARKETING.BLOG}
            className='inline-block w-full min-w-0 sm:w-auto'
          >
            <PrimaryButton className='w-full min-w-0 sm:w-auto'>
              <span>
                {translate('marketing.pages.home.latest-articles.cta.primary')}
              </span>
              <ArrowRight className='h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </PrimaryButton>
          </Link>
        </div>
      )}
    </SectionContainer>
  );
};

export default LatestArticlesSection;
