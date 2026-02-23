import { Smartphone } from 'lucide-react';
import { smoothScrollTo } from '@/lib/utils/common';

const GetTheAppButton = ({ onClick }: { onClick?: () => void }) => {
  const handleClick = () => {
    onClick?.();
    smoothScrollTo('mobile-app-section');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-brand-gradient inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white shadow-none transition-all duration-300 hover:scale-105 hover:shadow-none"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <Smartphone className="mr-2 h-4 w-4" />
      <span className="whitespace-nowrap">Get the App</span>
    </button>
  );
};

export default GetTheAppButton;
