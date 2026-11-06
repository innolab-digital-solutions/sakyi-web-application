import Body3 from '@/components/shared/typography/Body3';
import Heading5 from '@/components/shared/typography/Heading5';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils/styles';

type ContactCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  value: string;
  /**
   * Where the value links to (`mailto:`, `tel:`, `https://`). Omit it for
   * information that isn't actionable, such as opening hours, and the value
   * renders as plain text.
   */
  href?: string;
  className?: string;
};

/**
 * Offers a line-break opportunity right after the `@` in an email address, so a
 * narrow card wraps it as `name@` / `domain.com` rather than mid-word.
 * `wrap-anywhere` on the element remains the fallback if a part still won't fit.
 */
const withEmailBreak = (value: string) => {
  const at = value.indexOf('@');
  if (at === -1) return value;
  return (
    <>
      {value.slice(0, at + 1)}
      <wbr />
      {value.slice(at + 1)}
    </>
  );
};

const ContactCard = ({
  title,
  description,
  icon,
  value,
  href,
  className,
}: ContactCardProps) => {
  const { language } = useLanguage();

  return (
    <div
      className={cn(
        'group border-border hover:border-brand/50 relative h-full min-w-0 overflow-hidden rounded-2xl border bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-lg sm:p-8',
        className,
      )}
    >
      <div className='mb-6 flex items-center justify-center'>
        <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-50 shadow-sm transition-all duration-500 group-hover:shadow-lg'>
          <div className='from-brand-light to-brand-deep flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-r'>
            {icon}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <Heading5 lang={language} className='text-lg font-bold sm:text-xl'>
          {title}
        </Heading5>

        <Body3 lang={language}>{description}</Body3>

        {href ? (
          <a
            href={href}
            className='text-brand-gradient wrap-anywhere whitespace-pre-line'
            {...(href.startsWith('http')
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {withEmailBreak(value)}
          </a>
        ) : (
          <p className='text-brand-gradient wrap-anywhere whitespace-pre-line'>
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
