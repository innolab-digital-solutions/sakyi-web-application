'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Grid3X3,
  Heart,
  Play,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { getProgramBySlug } from '@/domains/programs/services';
import type { Program } from '@/domains/programs/types';
import { resolveApiImageUrl } from '@/lib/utils/url';

type ProgramDetailSectionProps = {
  slug: string;
};

const ProgramDetailSection = ({ slug }: ProgramDetailSectionProps) => {
  const { language } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['program', slug, language],
    queryFn: () => getProgramBySlug(slug, language),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  });

  const program = data?.status === 'success' ? (data.data as Program) : null;
  const resolvedThumbnail = resolveApiImageUrl(program?.thumbnail_url);
  const hasThumbnail = !!resolvedThumbnail;
  const thumbnailSource =
    hasThumbnail && !imageError ? resolvedThumbnail : '/images/logo-gray.png';
  const unoptimized =
    thumbnailSource.startsWith('http://') ||
    thumbnailSource.startsWith('https://');

  if (isError) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-slate-500'>{error?.message}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative flex min-h-screen items-center overflow-hidden bg-slate-50'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-linear-to-br from-[#35bec5]/10 to-[#4bc4db]/10 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-linear-to-br from-[#4bc4db]/10 to-[#0c96c4]/10 blur-3xl' />
          <div className='absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-[#35bec5]/5 to-[#0c96c4]/5 blur-3xl' />
        </div>

        <div className='relative mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 lg:px-8'>
          {/* Back Button */}
          <div className='mb-8' data-aos='fade-up'>
            <Link
              href='/programs'
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
              Back to Programs
            </Link>
          </div>

          <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
            {/* Left Column */}
            <div className='space-y-8' data-aos='fade-up'>
              {/* Tagline Badge */}
              {isLoading ? (
                <Skeleton className='h-8 w-40 rounded-full' />
              ) : (
                program?.tagline && (
                  <div className='inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2 text-sm font-medium text-[#35bec5]'>
                    <Zap className='h-4 w-4' />
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>
                      {program.tagline}
                    </span>
                  </div>
                )
              )}

              {/* Title & Overview */}
              <div className='space-y-6'>
                {isLoading ? (
                  <>
                    <Skeleton className='h-14 w-full' />
                    <Skeleton className='h-6 w-5/6' />
                    <Skeleton className='h-6 w-4/6' />
                  </>
                ) : (
                  <>
                    <h1
                      className={`text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl ${language === 'my' ? 'leading-relaxed sm:leading-relaxed lg:leading-relaxed' : 'leading-tight sm:leading-tight lg:leading-tight'}`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {program?.title}
                    </h1>
                    <p
                      className='max-w-2xl text-lg leading-relaxed text-slate-600'
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {program?.excerpt}
                    </p>
                  </>
                )}
              </div>

              {/* Duration */}
              {isLoading ? (
                <Skeleton className='h-10 w-32' />
              ) : (
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10'>
                    <Clock className='h-5 w-5 text-[#35bec5]' />
                  </div>
                  <div>
                    <div
                      className='text-sm text-slate-600'
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Duration
                    </div>
                    <div
                      className='font-semibold text-slate-900'
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {program?.duration}
                    </div>
                  </div>
                </div>
              )}

              {/* Price */}
              {!isLoading && program?.price?.amount != null && (
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10'>
                    <DollarSign className='h-5 w-5 text-[#35bec5]' />
                  </div>
                  <div>
                    <div
                      className='text-sm text-slate-600'
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Price
                    </div>
                    <div
                      className='font-semibold text-slate-900'
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {program.price.amount.toLocaleString()}{' '}
                      {program.price.currency}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className='flex flex-col gap-4 sm:flex-row'>
                <Link
                  href='/contact'
                  className='group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Play className='mr-2 h-5 w-5' />
                  Start This Program
                  <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
                </Link>

                <Link
                  href='/programs'
                  className='group inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:scale-105 hover:border-[#35bec5] hover:text-[#35bec5] hover:shadow-lg'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Grid3X3 className='mr-2 h-5 w-5' />
                  View All Programs
                  <ChevronRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
                </Link>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className='relative' data-aos='fade-up' data-aos-delay='200'>
              {isLoading ? (
                <Skeleton className='aspect-4/5 w-full rounded-3xl' />
              ) : (
                <div className='group relative overflow-hidden rounded-3xl shadow-2xl'>
                  <div className='relative aspect-4/5 w-full sm:aspect-3/4'>
                    <Image
                      src={thumbnailSource}
                      alt={program?.title ?? ''}
                      fill
                      quality={95}
                      priority
                      unoptimized={unoptimized}
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      className={`transition-transform duration-300 group-hover:scale-105 ${
                        hasThumbnail && !imageError
                          ? 'object-cover'
                          : 'bg-gray-100 object-contain p-8'
                      }`}
                      onError={() => {
                        if (hasThumbnail) setImageError(true);
                      }}
                    />
                  </div>
                  {hasThumbnail && !imageError && (
                    <div className='absolute inset-0 bg-linear-to-br from-slate-900/20 to-slate-800/10 transition-opacity duration-300 group-hover:opacity-0' />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className='relative overflow-hidden bg-white py-24'>
        <div className='relative mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-16' data-aos='fade-up'>
            {isLoading ? (
              <Skeleton className='h-12 w-1/2' />
            ) : (
              <h2
                className='text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl'
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                About This Program
              </h2>
            )}
            <div
              className='mt-6 max-w-4xl text-lg leading-relaxed text-slate-600'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isLoading ? (
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-4/5' />
                </div>
              ) : (
                <p>{program?.about}</p>
              )}
            </div>
          </div>

          {/* Features & Ideals */}
          <div className='grid gap-12 lg:grid-cols-2'>
            {/* Features */}
            <div data-aos='fade-up' data-aos-delay='100'>
              {isLoading ? (
                <Skeleton className='mb-6 h-8 w-40' />
              ) : (
                <h3
                  className='mb-6 text-2xl font-bold text-slate-900'
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  What&apos;s Included
                </h3>
              )}
              <div className='space-y-4'>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className='flex items-center gap-4'>
                        <Skeleton className='h-8 w-8 rounded-lg' />
                        <Skeleton className='h-4 w-full' />
                      </div>
                    ))
                  : program?.features?.map((feature, index) => (
                      <div key={index} className='flex items-center gap-4'>
                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10'>
                          <CheckCircle className='h-5 w-5 text-[#35bec5]' />
                        </div>
                        <p
                          className='text-slate-600'
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {Array.isArray(feature)
                            ? feature.join(', ')
                            : feature}
                        </p>
                      </div>
                    ))}
              </div>
            </div>

            {/* Ideals */}
            <div data-aos='fade-up' data-aos-delay='200'>
              {isLoading ? (
                <Skeleton className='mb-6 h-8 w-40' />
              ) : (
                <h3
                  className='mb-6 text-2xl font-bold text-slate-900'
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Who This Is For
                </h3>
              )}
              <div className='space-y-4'>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className='flex items-center gap-4'>
                        <Skeleton className='h-8 w-8 rounded-lg' />
                        <Skeleton className='h-4 w-full' />
                      </div>
                    ))
                  : program?.ideals?.map((item, index) => (
                      <div key={index} className='flex items-center gap-4'>
                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10'>
                          <CheckCircle className='h-5 w-5 text-[#35bec5]' />
                        </div>
                        <p
                          className='text-slate-600'
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {Array.isArray(item) ? item.join(', ') : item}
                        </p>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expected Results */}
      <section className='relative overflow-hidden bg-slate-50 py-24'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute top-1/4 -right-32 h-64 w-64 rounded-full bg-linear-to-br from-[#35bec5]/5 to-[#0c96c4]/5 blur-3xl' />
          <div className='absolute bottom-1/4 -left-32 h-64 w-64 rounded-full bg-linear-to-br from-[#4bc4db]/5 to-[#35bec5]/5 blur-3xl' />
        </div>

        <div className='relative mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-16 text-center' data-aos='fade-up'>
            {isLoading ? (
              <Skeleton className='mx-auto h-12 w-1/2' />
            ) : (
              <h2
                className='text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl'
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                What You Can{' '}
                <span className='text-brand-gradient bg-clip-text text-transparent'>
                  Expect
                </span>
              </h2>
            )}
          </div>

          <div className='space-y-4'>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className='h-20 w-full rounded-2xl' />
                ))
              : program?.expectations?.map((item, index) => (
                  <div
                    key={index}
                    data-aos='fade-up'
                    data-aos-delay={`${index * 100}`}
                    className='group flex items-start gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#35bec5]/50 hover:shadow-lg'
                  >
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-[#35bec5] to-[#0c96c4] transition-all duration-300 group-hover:scale-105'>
                      <CheckCircle className='h-6 w-6 text-white' />
                    </div>
                    <div className='space-y-1'>
                      <p
                        className='text-xl font-semibold text-slate-900'
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {item.title}
                      </p>
                      {item.description ? (
                        <p
                          className='text-slate-600'
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Program Structure */}
      <section className='relative overflow-hidden bg-white py-24'>
        <div className='relative mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-16 text-center' data-aos='fade-up'>
            {isLoading ? (
              <Skeleton className='mx-auto h-12 w-1/2' />
            ) : (
              <h2
                className='text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl'
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Program{' '}
                <span className='text-brand-gradient bg-clip-text text-transparent'>
                  Structure
                </span>
              </h2>
            )}
          </div>

          <div className='space-y-6'>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className='h-24 w-full rounded-2xl' />
                ))
              : program?.structures?.map((phase, index) => (
                  <div
                    key={index}
                    data-aos='fade-up'
                    data-aos-delay={`${index * 100}`}
                    className='group flex items-start gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#35bec5]/50 hover:shadow-lg sm:p-8'
                  >
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5] to-[#0c96c4] font-bold text-white transition-all duration-300 group-hover:scale-105'>
                      {index + 1}
                    </div>
                    <div className='space-y-1'>
                      {phase.period && (
                        <p
                          className='text-sm font-medium text-[#35bec5]'
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {phase.period}
                        </p>
                      )}
                      <p
                        className='text-xl font-semibold text-slate-900'
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {phase.title}
                      </p>
                      {phase.description && (
                        <p
                          className='text-slate-600'
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {phase.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-brand-gradient relative overflow-hidden py-24'>
        <div
          className='relative mx-auto max-w-7xl px-6 text-center lg:px-8'
          data-aos='fade-up'
        >
          <h2
            className='text-3xl font-bold text-white sm:text-4xl'
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Ready to Start Your Journey?
          </h2>
          <p
            className='mx-auto mt-6 max-w-2xl text-lg text-white/80'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Join our program and start transforming your health and wellness
            today.
          </p>
          <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link
              href='/contact'
              className='group inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-8 py-4 font-semibold text-[#35bec5] transition-all duration-300 hover:scale-105 hover:bg-slate-50 hover:shadow-lg'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Heart className='mr-2 h-5 w-5' />
              Start This Program
              <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </Link>

            <Link
              href='/programs'
              className='group inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#35bec5] hover:shadow-lg'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Explore All Programs
              <ArrowRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramDetailSection;
