import SectionContainer from '@/components/marketing/SectionContainer';

const ContactIntroSection = () => {
  return (
    <SectionContainer id='contact-hero-section' className='bg-white'>
      <section className='relative overflow-hidden bg-slate-50 py-24 sm:py-32'>

        <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-16 lg:grid-cols-2 lg:items-center'>
            <div className='space-y-8' data-aos='fade-right'>
              <div className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2 text-sm font-medium text-[#35bec5]'>
                <MessageCircle className='h-4 w-4' />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  Get in Touch
                </span>
              </div>

              <h1
                className='text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl'
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                We&apos;d Love to{' '}
                <span
                  className='bg-gradient-to-r from-[#35bec5] via-[#4bc4db] to-[#0c96c4] bg-clip-text text-transparent'
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Hear From You
                </span>
              </h1>

              <p
                className='text-lg leading-relaxed text-slate-600'
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Have questions about our wellness programs? Need support with
                your health journey? We&apos;re here to help you every step of
                the way. Reach out and let&apos;s start your transformation
                together.
              </p>

              {/* CTA Button */}
              <div className='flex flex-col gap-4 sm:flex-row sm:gap-6'>
                <button
                  onClick={() => smoothScrollTo('contact-form', 80)}
                  className='group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Send Us a Message
                  <MessageCircle className='ml-2 h-5 w-5 transition-transform duration-300' />
                </button>

                <button
                  onClick={() => smoothScrollTo('contact-details', 80)}
                  className='group inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:scale-105 hover:border-[#35bec5] hover:text-[#35bec5] hover:shadow-lg'
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  View Contact Info
                  <ChevronRight className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1' />
                </button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className='relative' data-aos='fade-left'>
              <div className='group relative overflow-hidden rounded-2xl shadow-2xl'>
                <div className='aspect-4/5 w-full sm:aspect-3/4'>
                  <Image
                    src='/images/contact/hero.jpg'
                    alt='SaKyi Wellness Team - Ready to Help'
                    width={800}
                    height={1000}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    quality={95}
                    priority
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
                  />
                </div>

                {/* Subtle dark overlay that disappears on hover */}
                <div className='absolute inset-0 bg-gradient-to-br from-slate-900/10 to-slate-800/5 transition-opacity duration-300 group-hover:opacity-0'></div>
                {/* Image Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent'></div>

                {/* Floating Card */}
                <div
                  className='absolute right-6 bottom-6 left-6 rounded-xl border border-white/20 bg-white/90 p-4 backdrop-blur-sm'
                  style={{
                    animation: 'float 6s ease-in-out infinite',
                  }}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-full'>
                      <MessageCircle className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <p
                        className='text-sm font-semibold text-slate-900'
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Quick Response
                      </p>
                      <p
                        className='text-xs text-slate-600'
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        We reply within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionContainer>
  );
};

export default ContactIntroSection;
