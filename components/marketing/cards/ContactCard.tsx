import Body3 from '@/components/shared/typography/Body3';
import Heading5 from '@/components/shared/typography/Heading5';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/styles';

type ContactCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: string;
  className?: string;
};

const ContactCard = ({
  title,
  description,
  icon,
  value,
  className,
}: ContactCardProps) => {
  const { language } = useLanguage();

  return (
    <div
      className={cn(
        'group border-border relative min-w-0 overflow-hidden rounded-2xl border bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-[#35bec5]/50 hover:shadow-lg sm:p-8',
        className,
      )}
    >
      <div className='mb-6 flex items-center justify-center'>
        <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-50 shadow-sm transition-all duration-500 group-hover:shadow-lg'>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-r from-[#4bc4db] to-[#0c96c4]'>
            {icon}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <Heading5 lang={language} className='text-lg font-bold sm:text-xl'>
          {title}
        </Heading5>

        <Body3 lang={language}>{description}</Body3>

        <a href={`mailto:${value}`} className='text-brand-gradient'>
          {value}
        </a>
      </div>
    </div>
  );
};

export default ContactCard;
