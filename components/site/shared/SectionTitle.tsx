'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/styles';

type SupportedLanguage = 'en' | 'my';

type SectionTitleProps = {
  /** Heading level */
  as: 'h1' | 'h2';
  /** Hero = larger title (e.g. hero section); section = standard section heading */
  variant: 'hero' | 'section';
  /** For EN/MY typography scale (Myanmar uses slightly smaller scale) */
  language: SupportedLanguage;
  /** Main title text (default color) */
  blackPart: ReactNode;
  /** Optional gradient-highlight text (brand gradient). Rendered inline or block per layout. */
  gradientPart?: ReactNode;
  /** Optional muted subtitle line (hero variant only) */
  subtitle?: ReactNode;
  /** block = black and gradient on separate lines; inline = on same line */
  layout?: 'block' | 'inline';
  /** Center the title (e.g. How It Works, Our Programs) */
  center?: boolean;
  className?: string;
};

const gradientBlockClasses =
  'text-brand-gradient block bg-clip-text font-sans leading-relaxed text-transparent';

const gradientInlineClasses =
  'text-brand-gradient inline-block bg-clip-text font-sans leading-relaxed text-transparent';

/**
 * Reusable section title with optional gradient part. Use for all section headings
 * so typography stays consistent across the site (badge + title + description pattern).
 */
const SectionTitle = ({
  as: Tag = 'h2',
  variant,
  language,
  blackPart,
  gradientPart,
  subtitle,
  layout = 'block',
  center = false,
  className,
}: SectionTitleProps) => {
  const isMyanmar = language === 'my';

  const heroTitleClasses = isMyanmar
    ? 'text-foreground space-y-2 text-3xl leading-relaxed font-bold tracking-tight sm:text-4xl lg:text-5xl'
    : 'text-foreground space-y-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl';

  const heroSubtitleClasses = isMyanmar
    ? 'text-muted-foreground block font-sans text-xl leading-relaxed font-light sm:text-2xl'
    : 'text-muted-foreground block font-sans text-2xl font-light sm:text-3xl';

  const sectionTitleBlockClasses = isMyanmar
    ? 'font-sans text-2xl leading-relaxed font-bold sm:text-3xl lg:text-4xl'
    : 'font-sans text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl';

  const sectionTitleInlineClasses = isMyanmar
    ? 'font-sans text-2xl leading-relaxed font-bold sm:text-3xl lg:text-4xl'
    : 'font-sans text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl';

  const wrapClasses = 'min-w-0 break-words';

  if (variant === 'hero') {
    return (
      <Tag
        className={cn(
          heroTitleClasses,
          wrapClasses,
          center && 'flex flex-col items-center text-center',
          className,
        )}
      >
        <span className='block font-sans'>{blackPart}</span>
        {gradientPart != null && (
          <span className={gradientBlockClasses}>{gradientPart}</span>
        )}
        {subtitle != null && (
          <span className={heroSubtitleClasses}>{subtitle}</span>
        )}
      </Tag>
    );
  }

  if (layout === 'inline') {
    return (
      <Tag
        className={cn(
          sectionTitleInlineClasses,
          wrapClasses,
          center && 'flex flex-wrap items-center justify-center',
          className,
        )}
      >
        <span className='text-foreground'>{blackPart}</span>
        {gradientPart != null && (
          <>
            &nbsp;
            <span className={gradientInlineClasses}>{gradientPart}</span>
          </>
        )}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn(
        sectionTitleBlockClasses,
        wrapClasses,
        center && 'flex flex-col items-center text-center',
        className,
      )}
    >
      <span className='text-foreground block'>{blackPart}</span>
      {gradientPart != null && (
        <span className={gradientBlockClasses}>{gradientPart}</span>
      )}
    </Tag>
  );
};

export default SectionTitle;
