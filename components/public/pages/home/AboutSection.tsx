import SectionContainer from '@/components/public/shared/SectionContainer';
import Image from 'next/image';
import { Users, Shield, Target, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const AboutSection = () => {
  return (
    <SectionContainer id="about-section" className="">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        {/* Left Column - Clean Image */}
        <div
          className="relative"
          data-aos="zoom-in"
          data-aos-duration="1200"
          data-aos-delay="200"
          data-aos-easing="ease-out-cubic"
        >
          <div className="relative">
            <div className="aspect-3/4 w-full">
              <div className="group relative h-full overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="/images/home-about.jpg"
                  alt="Diverse group of people doing wellness activities together"
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Subtle dark overlay that disappears on hover */}
                <div className="absolute inset-0 bg-linear-to-br from-slate-900/10 to-slate-800/5 transition-opacity duration-300 group-hover:opacity-0"></div>
                {/* Brand gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-[#35bec5]/5 to-[#0c96c4]/5"></div>
              </div>
            </div>

            {/* Floating Cards with Movement Animation */}
            <div
              className="absolute -top-6 -left-2 animate-pulse rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-sm hover:animate-bounce sm:-left-4 lg:-top-4 lg:-left-6"
              data-aos="bounce-in"
              data-aos-delay="400"
              data-aos-duration="1000"
              data-aos-easing="ease-out-back"
              style={{
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-[#35bec5] to-[#4bc4db]">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div
                    className="text-sm font-semibold text-slate-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    10K+ Lives
                  </div>
                  <div
                    className="text-xs text-slate-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Transformed
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute -right-2 -bottom-6 animate-pulse rounded-2xl border border-slate-200/50 bg-white/90 p-4 shadow-xl backdrop-blur-sm hover:animate-bounce sm:-right-4 lg:-right-6"
              data-aos="bounce-in"
              data-aos-delay="600"
              data-aos-duration="1000"
              data-aos-easing="ease-out-back"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-[#4bc4db] to-[#0c96c4]">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div
                    className="text-sm font-semibold text-slate-900"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    98% Success
                  </div>
                  <div
                    className="text-xs text-slate-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Clean Content */}
        <div
          className="space-y-8"
          data-aos="slide-up"
          data-aos-duration="1200"
          data-aos-delay="300"
          data-aos-easing="ease-out-cubic"
        >
          {/* Section Header */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2">
              <Users className="h-4 w-4 text-[#35bec5]" />
              <span
                className="text-sm font-medium text-[#35bec5]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                About SaKyi
              </span>
            </div>

            <h2 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              <span
                className="block text-slate-900"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Your Wellness
              </span>
              <span
                className="text-brand-gradient block bg-clip-text text-transparent"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Journey Starts Here
              </span>
            </h2>

            <p
              className="max-w-2xl text-lg leading-relaxed text-slate-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              We combine medical expertise with personalized wellness strategies
              to help you achieve lasting health transformation. Our
              evidence-based programs are designed by certified doctors and
              wellness experts.
            </p>
          </div>

          {/* Clean Features List */}
          <div className="space-y-4">
            {[
              {
                icon: Shield,
                title: 'Doctor-Designed Programs',
                description:
                  'Evidence-based wellness plans created by certified medical professionals',
              },
              {
                icon: Target,
                title: 'Personalized Approach',
                description:
                  'Tailored strategies that adapt to your unique lifestyle and goals',
              },
              {
                icon: TrendingUp,
                title: 'Proven Results',
                description:
                  'Track your progress with measurable outcomes and celebrate milestones',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex items-start space-x-3 rounded-lg p-3 transition-all duration-300 hover:bg-white/50"
                data-aos="fade-up"
                data-aos-delay={`${index * 200 + 400}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5] to-[#0c96c4] shadow-lg">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="mb-1 text-base font-semibold text-slate-900"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm text-slate-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Clean CTA */}
          <div className="pt-4" data-aos="fade-up" data-aos-delay="800">
            <Link
              href="/programs"
              className="group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span className="relative z-10">Explore Our Programs</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default AboutSection;
