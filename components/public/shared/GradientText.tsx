import { PropsWithChildren } from 'react';

const GradientText = ({ children }: PropsWithChildren) => {
  return (
    <span
      className="text-brand-gradient block bg-clip-text text-transparent"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {children}
    </span>
  );
};

export default GradientText;
