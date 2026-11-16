import type { InlineSegment } from '@/lib/legal/parse-legal-markdown';

type LegalInlineTextProps = {
  segments: InlineSegment[];
};

/**
 * Renders inline legal-document segments (text, bold, and links).
 */
export default function LegalInlineText({ segments }: LegalInlineTextProps) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'bold') {
          return (
            <span key={index} className='text-foreground font-semibold'>
              {segment.value}
            </span>
          );
        }

        if (segment.type === 'link') {
          return (
            <a
              key={index}
              href={segment.href}
              className='text-brand underline-offset-2 hover:underline'
              {...(segment.href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {segment.value}
            </a>
          );
        }

        return <span key={index}>{segment.value}</span>;
      })}
    </>
  );
}
