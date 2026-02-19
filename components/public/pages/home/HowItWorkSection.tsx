import SectionContainer from '@/components/public/shared/SectionContainer';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Heart } from 'lucide-react';

const HowItWorkSection = () => {
  return (
    <SectionContainer id="how-it-work-section" className="">
      {/* Section Header */}
      <div
        className="space-y-6 text-center"
        data-aos="zoom-in"
        data-aos-duration="1200"
        data-aos-easing="ease-out-cubic"
      >
        <div
          className="inline-flex items-center space-x-2 rounded-full bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2"
          data-aos="slide-down"
          data-aos-delay="200"
          data-aos-duration="800"
          data-aos-easing="ease-out-back"
        >
          <Settings className="h-4 w-4 text-[#35bec5]" />
          <span
            className="text-sm font-medium text-[#35bec5]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            How It Works
          </span>
        </div>

        <h2
          className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <span
            data-aos="fade-up"
            data-aos-delay="300"
            data-aos-duration="1000"
            data-aos-easing="ease-out-cubic"
          >
            Transform Your Health in{' '}
          </span>
          <span
            className="text-brand-gradient bg-clip-text text-transparent"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            data-aos="fade-up"
            data-aos-delay="500"
            data-aos-duration="1000"
            data-aos-easing="ease-out-cubic"
          >
            Just 3 Steps
          </span>
        </h2>

        <p
          className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600"
          style={{ fontFamily: 'Inter, sans-serif' }}
          data-aos="slide-up"
          data-aos-delay="700"
          data-aos-duration="1000"
          data-aos-easing="ease-out-cubic"
        >
          Join thousands who&apos;ve transformed their lives with our proven
          3-step process. Get personalized guidance from certified doctors and
          see real results in just weeks.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {[
          {
            step: '01',
            title: 'Talk with Our Experts',
            description:
              'Get professional guidance through an initial health consultation.',
            color: 'from-[#35bec5] to-[#4bc4db]',
            illustration: (
              <div className="relative mb-6">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#35bec5]/10 to-[#4bc4db]/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg">
                  <Heart className="h-12 w-12 text-[#35bec5] transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-[#35bec5] to-[#4bc4db] text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl">
                  <span className="text-sm font-bold">01</span>
                </div>
              </div>
            ),
          },
          {
            step: '02',
            title: 'Find Your Best-Fit Program',
            description:
              'Choose a program tailored to your body and lifestyle needs.',
            color: 'from-[#4bc4db] to-[#0c96c4]',
            illustration: (
              <div className="relative mb-6">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#4bc4db]/10 to-[#0c96c4]/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-[#4bc4db] to-[#0c96c4] transition-transform duration-500 group-hover:scale-110">
                    <div className="h-6 w-6 rounded-full bg-white transition-transform duration-500 group-hover:scale-110"></div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-[#4bc4db] to-[#0c96c4] text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl">
                  <span className="text-sm font-bold">02</span>
                </div>
              </div>
            ),
          },
          {
            step: '03',
            title: 'See Your Results & Begin Your Journey',
            description:
              'Review your InBody analysis and start your personalized wellness plan.',
            color: 'from-[#0c96c4] to-[#35bec5]',
            illustration: (
              <div className="relative mb-6">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-[#0c96c4]/10 to-[#35bec5]/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-[#0c96c4] to-[#35bec5] transition-transform duration-500 group-hover:scale-110">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-white transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="h-2 w-2 rounded-full bg-white transition-transform duration-500 group-hover:scale-110"></div>
                      <div className="h-2 w-2 rounded-full bg-white transition-transform duration-500 group-hover:scale-110"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-[#0c96c4] to-[#35bec5] text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl">
                  <span className="text-sm font-bold">03</span>
                </div>
              </div>
            ),
          },
        ].map((step, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:border-[#35bec5]/50 hover:shadow-lg"
            data-aos="flip-up"
            data-aos-delay={`${index * 200 + 400}`}
            data-aos-duration="1000"
            data-aos-easing="ease-out-cubic"
          >
            {/* Illustration */}
            {step.illustration}

            {/* Content */}
            <div className="space-y-4">
              <h3
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {step.title}
              </h3>

              <p
                className="text-slate-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="mt-12 text-center"
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <Link
          href="/contact"
          className="group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span className="relative z-10">Get Started Today</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </SectionContainer>
  );
};

export default HowItWorkSection;
