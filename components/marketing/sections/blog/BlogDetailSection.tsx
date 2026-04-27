'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { getBlogPostBySlug } from '@/domains/blogs/services';
import type { BlogPost } from '@/domains/blogs/types';

import BlogDetailContentSection from './BlogDetailContentSection';
import BlogDetailHeroSection from './BlogDetailHeroSection';

type BlogDetailSectionProps = {
  slug: string;
};

const BlogDetailSection = ({ slug }: BlogDetailSectionProps) => {
  const { language } = useLanguage();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug, language],
    queryFn: () => getBlogPostBySlug(slug, language),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });

  const post = data?.status === 'success' ? (data.data as BlogPost) : null;

  if (isLoading) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8'>
        <Skeleton className='mb-8 h-5 w-24' />
        <Skeleton className='mb-4 h-12 w-full' />
        <Skeleton className='mb-4 h-6 w-5/6' />
        <Skeleton className='mb-8 h-6 w-4/6' />
        <Skeleton className='aspect-video w-full rounded-2xl' />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50'>
        <div className='text-center'>
          <div className='bg-brand-gradient mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white'>
            <FileQuestion className='h-8 w-8' />
          </div>
          <h2
            className='mb-4 text-2xl font-bold text-slate-900'
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Post Not Found
          </h2>
          <p
            className='mx-auto mb-8 max-w-md text-slate-600'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            The blog post you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href='/blog'
            className='bg-brand-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowRight className='h-5 w-5 rotate-180' />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <BlogDetailHeroSection post={post} />
      <BlogDetailContentSection content={post.content ?? ''} />

      {/* CTA Section */}
      <section className='bg-brand-gradient relative overflow-hidden py-24'>
        <div className='relative mx-auto max-w-7xl px-6 text-center lg:px-8'>
          <h2
            className='text-3xl font-bold text-white sm:text-4xl'
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Ready to Put This Knowledge Into Action?
          </h2>
          <p
            className='mx-auto mt-6 max-w-2xl text-lg text-white/80'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            You&apos;ve just learned valuable insights. Now it&apos;s time to
            implement these strategies with our personalized programs.
          </p>
          <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link
              href='/programs'
              className='group inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-8 py-4 font-semibold text-[#35bec5] transition-all duration-300 hover:scale-105 hover:bg-slate-50 hover:shadow-lg'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <BookOpen className='mr-2 h-5 w-5' />
              Start Your Program
            </Link>

            <Link
              href='/contact'
              className='group inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#35bec5] hover:shadow-lg'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Discuss This Article
              <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetailSection;
