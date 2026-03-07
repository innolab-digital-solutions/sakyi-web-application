import { PropsWithChildren } from 'react';

const GradientText = ({ children }: PropsWithChildren) => {
  return (
    <span className='text-brand-gradient block bg-clip-text font-sans leading-relaxed text-transparent'>
      {children}
    </span>
  );
};

export default GradientText;
