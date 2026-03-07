import { PropsWithChildren } from 'react';

const OutlineButton = ({ children }: PropsWithChildren) => {
  return (
    <button className='group text-foreground/80 inline-flex items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-sans text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:border-[#35bec5] hover:text-[#35bec5] hover:shadow-lg'>
      {children}
    </button>
  );
};

export default OutlineButton;
