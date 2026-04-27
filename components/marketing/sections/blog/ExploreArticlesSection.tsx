'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import BlogCard from '@/components/marketing/cards/BlogCard';
import ContentEmptyState from '@/components/marketing/cards/ContentEmptyState';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { getBlogCategories, getBlogPosts } from '@/domains/blogs/services';
import type { BlogCategory, BlogPost } from '@/domains/blogs/types';
import { getVisiblePageNumbers } from '@/lib/table';

import SectionBadge from '../../SectionBadge';

const ExploreArticlesSection = () => {
  const { language, translate } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories', language],
    queryFn: () => getBlogCategories(language),
    staleTime: 1000 * 60 * 10,
  });

  const { data, isLoading: postsLoading } = useQuery({
    queryKey: ['blog-posts', language, selectedCategory, currentPage],
    queryFn: () =>
      getBlogPosts(language, currentPage, selectedCategory ?? undefined),
    staleTime: 1000 * 60 * 5,
  });

  const categories = useMemo<BlogCategory[]>(() => {
    if (categoriesData?.status !== 'success') return [];
    return categoriesData.data as BlogCategory[];
  }, [categoriesData]);

  const posts = useMemo<BlogPost[]>(() => {
    if (data?.status !== 'success') return [];
    return data.data as BlogPost[];
  }, [data]);

  const pagination = useMemo(() => {
    if (data?.status !== 'success') return null;
    return data.meta.pagination ?? null;
  }, [data]);

  const lastPage = Math.max(1, pagination?.last_page ?? 1);
  const canPrev = currentPage > 1;
  const canNext = pagination
    ? currentPage < lastPage || pagination.has_more_pages
    : false;
  const pageNumbers = getVisiblePageNumbers(currentPage, lastPage, 5);

  const scrollToSection = () => {
    document
      .getElementById('explore-articles-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToSection();
  };

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const updateShadows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftShadow(el.scrollLeft > 8);
    setShowRightShadow(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateShadows();
  }, [categories]);

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

      {/* Category Filter Carousel */}
      <div className='relative mt-10'>
        {/* Left shadow */}
        {showLeftShadow && (
          <div className='pointer-events-none absolute top-0 left-0 z-10 h-full w-16 bg-linear-to-r from-white to-transparent' />
        )}
        {/* Right shadow */}
        {showRightShadow && (
          <div className='pointer-events-none absolute top-0 right-0 z-10 h-full w-16 bg-linear-to-l from-white to-transparent' />
        )}

        <div
          ref={scrollRef}
          onScroll={updateShadows}
          className='flex gap-3 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        >
          {categoriesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-9 w-24 shrink-0 rounded-full' />
            ))
          ) : (
            <>
              <button
                onClick={() => handleCategorySelect(null)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-brand-gradient text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#35bec5] hover:text-[#35bec5]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {translate('marketing.pages.blog.articles.filter.all')}
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    handleCategorySelect(
                      selectedCategory === category.slug ? null : category.slug,
                    )
                  }
                  className={`shrink-0 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.slug
                      ? 'bg-brand-gradient text-white shadow-md'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-[#35bec5] hover:text-[#35bec5]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {category.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className='mt-10 grid gap-8 lg:grid-cols-2'>
        {postsLoading ? (
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

      {/* Pagination */}
      {!postsLoading && lastPage > 1 && (
        <div className='mt-10 flex items-center justify-center gap-2'>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPrev}
            className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-[#35bec5] hover:text-[#35bec5] disabled:pointer-events-none disabled:opacity-40'
            aria-label='Previous page cursor-pointer'
          >
            <ChevronLeft className='h-4 w-4' />
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => handlePageChange(n)}
              className={`h-10 w-10 cursor-pointer rounded-full text-sm font-medium transition-all duration-200 ${
                n === currentPage
                  ? 'bg-brand-gradient text-white shadow-md'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[#35bec5] hover:text-[#35bec5]'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
              aria-label={`Page ${n}`}
              aria-current={n === currentPage ? 'page' : undefined}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNext}
            className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all duration-200 hover:border-[#35bec5] hover:text-[#35bec5] disabled:pointer-events-none disabled:opacity-40'
            aria-label='Next page'
          >
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      )}
    </SectionContainer>
  );
};

export default ExploreArticlesSection;
