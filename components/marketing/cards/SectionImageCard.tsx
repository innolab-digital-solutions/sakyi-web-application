import Image from 'next/image';

import { cn } from '@/lib/utils/styles';

type SectionImageCardProps = {
  /** Image source path (e.g. /images/about-hero-1.jpg) */
  src: string;
  /** Alt text for the image */
  alt: string;
  /** Optional overlay title (e.g. "Our Expert Team") */
  title?: string;
  /** Optional overlay subtitle (e.g. "Certified Medical Professionals") */
  subtitle?: string;
  /** large = prominent card (e.g. top of grid); small = compact card */
  variant: 'large' | 'small';
  /** Optional grid placement (e.g. col-span-2 row-span-2) and other layout classes */
  className?: string;
  /** Image width for Next/Image (large: 800, small: 400) */
  width?: number;
  /** Image height for Next/Image (large: 600, small: 400) */
  height?: number;
  /** Priority loading for above-the-fold image */
  priority?: boolean;
};

/**
 * Reusable image card with an overlay gradient and an optional caption. Used for
 * the about hero and similar section image grids. Supports large (feature) and
 * small variants.
 *
 * `title` and `subtitle` are optional and render independently: pass either,
 * both, or neither. With neither, no caption element is rendered at all.
 */
const SectionImageCard = ({
  src,
  alt,
  title,
  subtitle,
  variant,
  className,
  width,
  height,
  priority = false,
}: SectionImageCardProps) => {
  const isLarge = variant === 'large';

  const aspectClass = isLarge
    ? 'aspect-4/3 w-full sm:aspect-3/2 lg:aspect-4/3'
    : 'aspect-square w-full sm:aspect-4/3 lg:aspect-square';

  const sizes = isLarge
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
    : '(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw';

  const defaultWidth = isLarge ? 800 : 400;
  const defaultHeight = isLarge ? 600 : 400;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        isLarge ? 'shadow-xl' : 'shadow-lg',
        className,
      )}
    >
      <div className={aspectClass}>
        <Image
          src={src}
          alt={alt}
          width={width ?? defaultWidth}
          height={height ?? defaultHeight}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          quality={isLarge ? 95 : 90}
          priority={priority}
          sizes={sizes}
        />
      </div>
      <div className='absolute inset-0 bg-linear-to-br from-slate-900/20 to-slate-800/10 transition-opacity duration-300 group-hover:opacity-0' />
      <div className='from-brand/5 to-brand-deep/5 absolute inset-0 bg-linear-to-br' />
      {(title || subtitle) && (
        <div
          className={cn(
            'absolute left-4 font-sans text-white',
            isLarge ? 'bottom-4' : 'bottom-3 left-3',
          )}
        >
          {title && (
            <div
              className={isLarge ? 'text-lg font-bold' : 'text-sm font-bold'}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div
              className={
                isLarge ? 'text-sm text-white/90' : 'text-xs text-white/90'
              }
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionImageCard;
