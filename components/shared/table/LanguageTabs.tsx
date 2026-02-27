import Image from 'next/image';

const LanguageTabs = () => {
  return (
    <div className='bg-muted border-border flex h-10 flex-1 items-center overflow-x-auto rounded-md border px-1 sm:flex-none'>
      <div className='text-primary flex h-8 items-center justify-center gap-2 rounded-sm bg-white px-4 text-sm font-semibold'>
        <Image
          src='/svg/english.svg'
          alt='English Flag'
          width={14}
          height={14}
          style={{ display: 'inline-block' }}
        />
        English
      </div>
      <div className='text-muted-foreground flex h-8 items-center justify-center gap-2 rounded-sm px-4 text-sm font-medium'>
        <Image
          src='/svg/myanmar.svg'
          alt='Myanmar Flag'
          width={14}
          height={14}
          style={{ display: 'inline-block' }}
        />
        Myanmar
      </div>
    </div>
  );
};

export default LanguageTabs;
