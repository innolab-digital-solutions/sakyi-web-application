import Image, { type ImageProps } from 'next/image';

const DecorativeImage = ({ alt, ...imageProps }: ImageProps) => {
  return (
    <div className='group relative overflow-hidden rounded-3xl shadow-2xl'>
      <div className='aspect-4/5 h-180 w-full sm:aspect-3/4'>
        <Image
          alt={alt}
          {...imageProps}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
      </div>
      <div className='absolute inset-0 bg-linear-to-br from-slate-800/10 to-slate-700/5 transition-opacity duration-300 group-hover:opacity-0' />
      <div className='absolute inset-0 bg-linear-to-br from-[#35bec5]/5 to-[#0c96c4]/5' />
    </div>
  );
};

export default DecorativeImage;
