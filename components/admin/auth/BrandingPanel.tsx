import Image from 'next/image';

const BrandingPanel = () => {
  return (
    // Main branding panel container, shown only on large screens
    <div className='from-primary via-primary/90 to-accent relative hidden flex-col items-center justify-center overflow-hidden bg-linear-to-br p-8 text-white lg:flex lg:p-12'>
      <div className='relative z-10 text-center'>
        {/* Logo section */}
        <div className='mb-6 flex items-center justify-center'>
          <Image
            src='/images/logo-white.png'
            alt='SaKyi Health & Wellness Logo'
            width={64}
            height={64}
            className='rounded-md object-contain'
            priority
          />
        </div>
        <div className='space-y-6'>
          {/* Header: Company name and panel label */}
          <div className='space-y-3'>
            <h1 className='text-xl leading-tight font-bold text-white lg:text-2xl'>
              SaKyi Health & Wellness
            </h1>
            {/* Divider */}
            <div className='mx-auto h-0.5 w-16 rounded-full bg-white/50'></div>
            <p className='text-md font-medium tracking-wide text-white'>
              Administrative Control Panel
            </p>
          </div>
          {/* Mission statement */}
          <p className='mx-auto max-w-sm text-sm leading-relaxed text-white/80'>
            Delivering innovative solutions to streamline healthcare
            administration and enhance patient care outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandingPanel;
