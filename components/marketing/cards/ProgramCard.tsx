'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { Program } from '@/domains/programs/types';

interface ProgramCardProperties {
  program: Program;
  index?: number;
  className?: string;
}

export default function ProgramCard({
  program,
  index = 0,
  className = '',
}: ProgramCardProperties) {
  const { translate } = useLanguage();
  const hasThumbnail =
    program.thumbnail_url && program.thumbnail_url.trim() !== '';
  const [imageError, setImageError] = useState(false);
  const thumbnailSource =
    hasThumbnail && !imageError
      ? program.thumbnail_url
      : '/images/no-image.png';

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      data-aos='fade-up'
      data-aos-delay={`${index * 200}`}
    >
      <div className='flex h-full flex-col gap-6'>
        {/* Image */}
        <div className='group/image relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-slate-100'>
          <Image
            src={thumbnailSource}
            alt={program.title}
            fill
            quality={90}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              hasThumbnail && !imageError
                ? ''
                : 'bg-gray-100 object-contain p-6'
            }`}
            onError={() => {
              if (hasThumbnail) setImageError(true);
            }}
          />

          {hasThumbnail && !imageError && (
            <div className='absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-800/5 transition-opacity duration-300 group-hover:opacity-0' />
          )}
        </div>

        {/* Content */}
        <div className='flex w-full flex-col justify-center space-y-4'>
          {/* Title */}
          <h3
            className='text-xl font-bold text-slate-900'
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {program.title}
          </h3>

          {/* Overview */}
          <p
            className='line-clamp-3 text-slate-600'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {program.overview}
          </p>

          {/* CTA */}
          <div className='pt-2'>
            <Link
              href={`/programs/${program.slug}`}
              className='group/link inline-flex items-center text-sm font-medium text-[#35bec5] transition-all duration-300 hover:text-[#0c96c4]'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span>
                {translate('marketing.pages.programs.program-card.cta')}
              </span>
              <ArrowRight className='ml-2 h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-1' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
