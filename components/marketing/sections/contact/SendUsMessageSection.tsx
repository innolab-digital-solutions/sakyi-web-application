'use client';

import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

import SectionBadge from '@/components/marketing/SectionBadge';
import SectionContainer from '@/components/marketing/SectionContainer';
import TextareaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import Body1 from '@/components/shared/typography/Body1';
import Heading2 from '@/components/shared/typography/Heading2';
import { useLanguage } from '@/context/LanguageContext';
import { useContactForm } from '@/hooks/useContactForm';

const SendUsMessageSection = () => {
  const { language, translate } = useLanguage();
  const { data, errors, processing, setField, submit } = useContactForm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submit(
      () =>
        toast.success(
          "Message sent successfully! We'll get back to you within 24 hours.",
        ),
      (msg) => toast.error(msg),
    );
  };

  return (
    <SectionContainer id='send-us-message-section' className='bg-slate-50'>
      {/* Header */}
      <div className='flex min-w-0 flex-col items-center justify-center space-y-6'>
        <SectionBadge
          icon={<MessageCircle className='h-4 w-4' />}
          text={translate('marketing.pages.contact.contact-form.badge')}
        />

        <Heading2 lang={language} className='mx-auto text-center'>
          <span className='text-foreground'>
            {translate('marketing.pages.contact.contact-form.title.black')}{' '}
          </span>
          <span className='text-brand-gradient bg-clip-text text-transparent'>
            {translate('marketing.pages.contact.contact-form.title.gradient')}
          </span>
        </Heading2>

        <Body1 lang={language} className='mx-auto max-w-2xl text-center'>
          {translate('marketing.pages.contact.contact-form.description')}
        </Body1>
      </div>

      {/* Form */}
      <div className='mt-16 flex justify-center'>
        <div className='w-full max-w-2xl'>
          <form
            onSubmit={handleSubmit}
            className='rounded-3xl border border-slate-200 bg-white p-10 shadow-lg'
          >
            <div className='space-y-8'>
              {/* Form Header */}
              <div className='text-center'>
                <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#35bec5]/10 to-[#0c96c4]/10'>
                  <Send className='h-8 w-8 text-[#35bec5]' />
                </div>
                <h3
                  className='text-2xl font-bold text-slate-900'
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {translate('marketing.pages.contact.contact-form.form.title')}
                </h3>
                <p
                  className='mt-2 text-slate-600'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {translate(
                    'marketing.pages.contact.contact-form.form.subtitle',
                  )}
                </p>
              </div>

              {/* Fields */}
              <div className='space-y-6'>
                <TextField
                  id='name'
                  name='name'
                  type='text'
                  label={translate(
                    'marketing.pages.contact.contact-form.form.fields.name.label',
                  )}
                  placeholder={translate(
                    'marketing.pages.contact.contact-form.form.fields.name.placeholder',
                  )}
                  value={data.name}
                  onChange={(e) => setField('name', e.target.value)}
                  error={errors.name}
                  required
                  disabled={processing}
                />

                <div className='grid gap-6 sm:grid-cols-2'>
                  <TextField
                    id='phone'
                    name='phone'
                    type='text'
                    label={translate(
                      'marketing.pages.contact.contact-form.form.fields.phone.label',
                    )}
                    placeholder={translate(
                      'marketing.pages.contact.contact-form.form.fields.phone.placeholder',
                    )}
                    value={data.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    error={errors.phone}
                    required
                    disabled={processing}
                  />

                  <TextField
                    id='email'
                    name='email'
                    type='email'
                    label={translate(
                      'marketing.pages.contact.contact-form.form.fields.email.label',
                    )}
                    placeholder={translate(
                      'marketing.pages.contact.contact-form.form.fields.email.placeholder',
                    )}
                    value={data.email}
                    onChange={(e) => setField('email', e.target.value)}
                    error={errors.email}
                    required
                    disabled={processing}
                  />
                </div>

                <TextField
                  id='subject'
                  name='subject'
                  type='text'
                  label={translate(
                    'marketing.pages.contact.contact-form.form.fields.subject.label',
                  )}
                  placeholder={translate(
                    'marketing.pages.contact.contact-form.form.fields.subject.placeholder',
                  )}
                  value={data.subject}
                  onChange={(e) => setField('subject', e.target.value)}
                  error={errors.subject}
                  required
                  disabled={processing}
                />

                <TextareaField
                  id='message'
                  name='message'
                  label={translate(
                    'marketing.pages.contact.contact-form.form.fields.message.label',
                  )}
                  placeholder={translate(
                    'marketing.pages.contact.contact-form.form.fields.message.placeholder',
                  )}
                  value={data.message}
                  onChange={(e) => setField('message', e.target.value)}
                  error={errors.message}
                  required
                  disabled={processing}
                  className='min-h-[160px]'
                />
              </div>

              {/* Submit */}
              <div className='pt-4'>
                <button
                  type='submit'
                  disabled={processing}
                  className='group bg-brand-gradient inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {processing
                    ? translate(
                        'marketing.pages.contact.contact-form.form.submit.loading',
                      )
                    : translate(
                        'marketing.pages.contact.contact-form.form.submit.label',
                      )}
                  <Send className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SectionContainer>
  );
};

export default SendUsMessageSection;
