import { PropsWithChildren } from 'react';

const GradientButton = ({ children }: PropsWithChildren) => {
  return (
    <button className='group bg-brand-gradient inline-flex items-center justify-center space-x-2 rounded-full px-6 py-3 font-sans text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'>
      {children}
    </button>
  );
};

export default GradientButton;
