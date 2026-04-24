'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { Program } from '@/domains/programs/types';
import { resolveApiImageUrl } from '@/lib/utils/url';

interface ProgramCardProperties {
  program: Program;
  index?: number;
  className?: string;
  variant?: 'vertical' | 'horizontal';
}

export default function ProgramCard({
  program,
  index = 0,
  className = '',
  variant = 'vertical',
}: ProgramCardProperties) {
  const { translate } = useLanguage();
  const resolvedThumbnail = resolveApiImageUrl(program.thumbnail_url);
  const hasThumbnail = !!resolvedThumbnail;
  const [imageError, setImageError] = useState(false);
  const thumbnailSource =
    hasThumbnail && !imageError ? resolvedThumbnail : '/images/logo-gray.png';
  const unoptimized =
    thumbnailSource.startsWith('http://') ||
    thumbnailSource.startsWith('https://');

  const imageEl = (
    <div
      className={`group/image relative overflow-hidden rounded-xl bg-slate-100 ${
        variant === 'horizontal'
          ? 'h-40 w-full shrink-0 sm:h-full sm:w-2/5'
          : 'aspect-3/2 w-full'
      }`}
    >
      <Image
        src={thumbnailSource}
        alt={program.title}
        fill
        quality={90}
        unoptimized={unoptimized}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'
        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
          hasThumbnail && !imageError ? '' : 'bg-gray-100 object-contain p-6'
        }`}
        onError={() => {
          if (hasThumbnail) setImageError(true);
        }}
      />
      {hasThumbnail && !imageError && (
        <div className='absolute inset-0 bg-linear-to-br from-slate-900/10 to-slate-800/5 transition-opacity duration-300 group-hover:opacity-0' />
      )}
    </div>
  );

  const contentEl = (
    <div
      className={`flex flex-col justify-center space-y-3 ${
        variant === 'horizontal' ? 'w-full sm:w-3/5' : 'w-full space-y-4'
      }`}
    >
      <h3
        className={`font-bold text-slate-900 ${variant === 'horizontal' ? 'text-lg' : 'text-xl'}`}
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {program.title}
      </h3>
      <p
        className={`text-slate-600 ${variant === 'horizontal' ? 'line-clamp-2 text-sm' : 'line-clamp-3'}`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {program.excerpt}
      </p>
      <div className='pt-1'>
        <Link
          href={`/programs/${program.slug}`}
          className='group/link inline-flex items-center text-sm font-medium text-[#35bec5] transition-all duration-300 hover:text-[#0c96c4]'
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span>{translate('marketing.pages.programs.program-card.cta')}</span>
          <ArrowRight className='ml-2 h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-1' />
        </Link>
      </div>
    </div>
  );

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md ${variant === 'horizontal' ? 'p-4' : 'p-6'} ${className}`}
      data-aos='fade-up'
      data-aos-delay={`${index * 200}`}
    >
      <div
        className={`h-full ${
          variant === 'horizontal'
            ? 'flex flex-col gap-4 sm:flex-row'
            : 'flex flex-col gap-6'
        }`}
      >
        {imageEl}
        {contentEl}
      </div>
    </div>
  );
}
