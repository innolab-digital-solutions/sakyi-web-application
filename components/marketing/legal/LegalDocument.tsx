import type { LucideIcon } from 'lucide-react';

import LegalInlineText from '@/components/marketing/legal/LegalInlineText';
import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import Body1 from '@/components/shared/typography/Body1';
import Heading1 from '@/components/shared/typography/Heading1';
import type {
  LegalBlock,
  LegalDocumentModel,
  LegalSection,
} from '@/lib/legal/parse-legal-markdown';

type LegalDocumentProps = {
  document: LegalDocumentModel;
  sectionId: string;
  badgeIcon: LucideIcon;
  badgeText: string;
  titleLead: string;
  titleAccent: string;
  intro: string;
  notice: string;
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  contactLabel?: string;
};

/**
 * Shared marketing layout for Terms, Privacy Policy, and Disclaimer pages.
 *
 * Preserves the existing legal-page visual language while rendering the
 * structured markdown document model.
 */
export default function LegalDocument({
  document,
  sectionId,
  badgeIcon: BadgeIcon,
  badgeText,
  titleLead,
  titleAccent,
  intro,
  notice,
  contactTitle,
  contactDescription,
  contactEmail,
  contactLabel = 'Contact Support',
}: LegalDocumentProps) {
  return (
    <SectionContainer id={sectionId} className='bg-background'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-12 space-y-5 text-center'>
          <div className='flex justify-center'>
            <SectionBadge
              icon={<BadgeIcon className='h-4 w-4' />}
              text={badgeText}
            />
          </div>
          <Heading1>
            <span className='text-foreground font-sans'>{titleLead} </span>
            <span className='text-brand-gradient bg-clip-text font-sans text-transparent'>
              {titleAccent}
            </span>
          </Heading1>
          <Body1 className='text-muted-foreground mx-auto max-w-2xl'>
            {intro}
          </Body1>
          {(document.effectiveDate || document.lastUpdated) && (
            <p className='text-muted-foreground font-sans text-xs tracking-wide'>
              {document.effectiveDate && (
                <span>Effective Date: {document.effectiveDate}</span>
              )}
              {document.effectiveDate && document.lastUpdated && (
                <span className='mx-2'>·</span>
              )}
              {document.lastUpdated && (
                <span>Last Updated: {document.lastUpdated}</span>
              )}
            </p>
          )}
        </div>

        <div className='border-brand-gradient bg-muted/40 mb-10 rounded-2xl border-l-4 p-5'>
          <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
            {notice}
          </p>
        </div>

        <div className='space-y-2'>
          {document.sections.map((section) => (
            <LegalSectionCard
              key={`${section.number ?? 'x'}-${section.title}`}
              section={section}
            />
          ))}
        </div>

        <div className='bg-brand-gradient mt-10 rounded-2xl p-px'>
          <div className='rounded-2xl bg-white p-6 text-center'>
            <BadgeIcon className='text-brand mx-auto mb-3 h-8 w-8' />
            <h3 className='text-foreground mb-1 font-sans text-base font-semibold'>
              {contactTitle}
            </h3>
            <p className='text-muted-foreground mb-4 font-sans text-sm'>
              {contactDescription}
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className='bg-brand-gradient inline-flex items-center rounded-full px-5 py-2.5 font-sans text-sm font-semibold text-white shadow transition-all duration-300 hover:scale-105 hover:shadow-md'
            >
              {contactLabel}
            </a>
          </div>
        </div>

        {document.copyright && (
          <p className='text-muted-foreground mt-8 text-center font-sans text-xs'>
            {document.copyright}
          </p>
        )}
      </div>
    </SectionContainer>
  );
}

function LegalSectionCard({ section }: { section: LegalSection }) {
  return (
    <div className='border-border rounded-2xl border bg-white p-7 shadow-sm'>
      <div className='mb-4 flex items-start gap-3'>
        {section.number && (
          <span className='bg-brand-gradient mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-1.5 font-sans text-xs font-bold text-white'>
            {section.number}
          </span>
        )}
        <div>
          {section.number && (
            <p className='text-muted-foreground font-sans text-xs font-medium tracking-widest uppercase'>
              Section {section.number}
            </p>
          )}
          <h2 className='text-foreground font-sans text-lg leading-snug font-semibold'>
            {section.title}
          </h2>
        </div>
      </div>

      <div className='space-y-4'>
        {section.blocks.map((block, index) => (
          <LegalBlockView key={index} block={block} />
        ))}
      </div>
    </div>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === 'hr') {
    return <hr className='border-border' />;
  }

  if (block.type === 'subheading') {
    return (
      <div className='border-border border-t pt-4'>
        <h3 className='text-foreground font-sans text-base font-semibold'>
          {block.number ? `${block.number}. ${block.title}` : block.title}
        </h3>
      </div>
    );
  }

  if (block.type === 'paragraph') {
    return (
      <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
        <LegalInlineText segments={block.segments} />
      </p>
    );
  }

  if (block.ordered) {
    return (
      <ol className='space-y-3'>
        {block.items.map((item, index) => (
          <li key={index} className='flex gap-3'>
            <span className='border-border text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-sans text-xs font-semibold'>
              {index + 1}
            </span>
            <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
              <LegalInlineText segments={item} />
            </p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className='space-y-3'>
      {block.items.map((item, index) => (
        <li key={index} className='flex gap-3'>
          <span className='bg-brand-gradient mt-2 h-1.5 w-1.5 shrink-0 rounded-full' />
          <p className='text-muted-foreground font-sans text-sm leading-relaxed'>
            <LegalInlineText segments={item} />
          </p>
        </li>
      ))}
    </ul>
  );
}
