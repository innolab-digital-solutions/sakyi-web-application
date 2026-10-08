import Image, { type ImageProps } from 'next/image';

import { cn } from '@/lib/utils/styles';

type DecorativeImageProps = ImageProps & {
  /**
   * Aspect ratio of the frame, as a Tailwind class. Defaults to a portrait
   * `aspect-4/5`; pass the photo's own ratio (e.g. `aspect-3/2` for a landscape
   * shot) so `object-cover` has nothing to crop away.
   */
  aspectClassName?: string;
};

/**
 * Rounded, shadowed image frame used beside marketing copy.
 *
 * The image fills the frame with `object-cover`, so a photo whose ratio differs
 * from {@link DecorativeImageProps.aspectClassName} will be cropped to fit.
 * Match the frame to the photo, or pass `className` (e.g. `object-contain`,
 * `object-top`) to change how it fills.
 */
const DecorativeImage = ({
  alt,
  className,
  aspectClassName = 'aspect-4/5',
  ...imageProps
}: DecorativeImageProps) => {
  return (
    <div className='group relative max-w-full overflow-hidden rounded-3xl shadow-2xl'>
      <div className={cn('w-full', aspectClassName)}>
        <Image
          alt={alt}
          {...imageProps}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
            className,
          )}
        />
      </div>
      <div className='absolute inset-0 bg-linear-to-br from-slate-800/10 to-slate-700/5 transition-opacity duration-300 group-hover:opacity-0' />
      <div className='from-brand/5 to-brand-deep/5 absolute inset-0 bg-linear-to-br' />
    </div>
  );
};

export default DecorativeImage;
