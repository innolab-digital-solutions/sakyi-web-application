import {
  Sparkles,
  Heart,
  ArrowRight,
  Brain,
  ChevronRight,
  Shield,
} from 'lucide-react';
import SectionContainer from '@/components/public/shared/SectionContainer';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <SectionContainer id="hero-section" className="bg-background">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column - Clean Content */}
        <div
          className="space-y-8"
          data-aos="zoom-in"
          data-aos-duration="1200"
          data-aos-easing="ease-out-cubic"
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2 text-sm font-medium text-[#35bec5]"
            data-aos="slide-down"
            data-aos-delay="200"
            data-aos-duration="800"
            data-aos-easing="ease-out-back"
          >
            <Sparkles className="h-4 w-4" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>
              Transform Your Life
            </span>
          </div>

          {/* Balanced Headline */}
          <div className="space-y-6">
            <h1 className="space-y-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              <span
                className="block"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                data-aos="fade-up"
                data-aos-delay="300"
                data-aos-duration="1000"
                data-aos-easing="ease-out-cubic"
              >
                Transform Your Life
              </span>
              <span
                className="text-brand-gradient block bg-clip-text text-transparent"
                style={{ fontFamily: 'Poppins, sans-serif' }}
                data-aos="fade-up"
                data-aos-delay="500"
                data-aos-duration="1000"
                data-aos-easing="ease-out-cubic"
              >
                for Good
              </span>
              <span
                className="block text-2xl font-light text-slate-600 sm:text-3xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
                data-aos="fade-up"
                data-aos-delay="700"
                data-aos-duration="1000"
                data-aos-easing="ease-out-cubic"
              >
                with Doctor-Designed Programs
              </span>
            </h1>

            <p
              className="max-w-2xl text-lg leading-relaxed text-slate-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
              data-aos="slide-up"
              data-aos-delay="900"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              Join thousands who&apos;ve achieved their health goals with our
              proven, science-backed programs. Get personalized guidance from
              certified doctors and build lasting healthy habits.
            </p>
          </div>

          {/* Clean CTA Buttons */}
          <div
            className="flex flex-col gap-4 sm:flex-row"
            data-aos="fade-up"
            data-aos-delay="1100"
            data-aos-duration="1000"
            data-aos-easing="ease-out-cubic"
          >
            <button
              className="group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Heart className="mr-2 h-5 w-5" />
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:scale-105 hover:border-[#35bec5] hover:text-[#35bec5] hover:shadow-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Brain className="mr-2 h-5 w-5" />
              Learn More
              <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Column - Enhanced Visual */}
        <div
          className="relative"
          data-aos="zoom-in"
          data-aos-duration="1200"
          data-aos-delay="400"
          data-aos-easing="ease-out-cubic"
        >
          <div className="relative">
            {/* Main Image */}
            <div className="group relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="aspect-4/5 w-full sm:aspect-3/4">
                <Image
                  src="/images/home-hero.jpg"
                  alt="Woman doing yoga meditation for wellness and mental health"
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {/* Subtle dark overlay that disappears on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-slate-800/10 to-slate-700/5 transition-opacity duration-300 group-hover:opacity-0"></div>
              {/* Brand gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-[#35bec5]/5 to-[#0c96c4]/5"></div>
            </div>

            {/* Floating Cards */}
            <div
              className="absolute -top-6 -left-2 animate-pulse rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-sm hover:animate-bounce sm:-left-4 lg:-top-4 lg:-left-6"
              data-aos="bounce-in"
              data-aos-delay="600"
              data-aos-duration="1000"
              data-aos-easing="ease-out-back"
              style={{
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-[#35bec5] to-[#4bc4db]">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div
                    className="text-sm font-semibold text-slate-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Personalized Plans
                  </div>
                  <div
                    className="text-xs text-slate-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Tailored to your needs
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute -right-2 -bottom-6 animate-pulse rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-sm hover:animate-bounce sm:-right-4 lg:-right-6"
              data-aos="bounce-in"
              data-aos-delay="800"
              data-aos-duration="1000"
              data-aos-easing="ease-out-back"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-[#4bc4db] to-[#0c96c4]">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div
                    className="text-sm font-semibold text-slate-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Doctor Guided
                  </div>
                  <div
                    className="text-xs text-slate-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Expert supervision
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default HeroSection;
