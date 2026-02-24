import {
  Sparkles,
  Heart,
  ArrowRight,
  Brain,
  ChevronRight,
  Shield,
} from 'lucide-react';
import SectionContainer from '@/components/site/shared/SectionContainer';
import SectionBadge from '@/components/site/shared/SectionBadge';
import DecorativeImage from '@/components/site/shared/DecorativeImage';
import FloatingCard from '@/components/site/shared/FloatingCard';
import GradientText from '@/components/site/shared/GradientText';
import GradientButton from '@/components/site/shared/GradientButton';
import OutlineButton from '@/components/site/shared/OutlineButton';

const HeroSection = () => {
  return (
    <SectionContainer id="hero-section" className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Headline, descriptive text, and call-to-action buttons */}
        <div className="space-y-8">
          {/* Section Badge: Short eye-catching phrase with icon */}
          <SectionBadge
            icon={<Sparkles className="h-4 w-4" />}
            text="Transform Your Life"
          />

          {/* Section Headline: Main marketing message with multi-line headline and subtitle */}
          <div className="space-y-6">
            <h1 className="text-foreground space-y-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {/* Hero headline - upper line */}
              <span
                className="block"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Transform Your Life
              </span>

              {/* Hero headline - gradient highlight */}
              <GradientText>for Good</GradientText>

              {/* Hero headline - supporting subtitle */}
              <span
                className="text-muted-foreground block text-2xl font-light sm:text-3xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                with Doctor-Designed Programs
              </span>
            </h1>

            {/* Supporting paragraph describing value proposition */}
            <p
              className="text-foreground/80 max-w-2xl text-lg leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Join thousands who&apos;ve achieved their health goals with our
              proven, science-backed programs. Get personalized guidance from
              certified doctors and build lasting healthy habits.
            </p>
          </div>

          {/* Call To Action Buttons: Start and Learn More */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Primary CTA button */}
            <GradientButton>
              <Heart className="h-5 w-5" />
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </GradientButton>

            {/* Secondary CTA button */}
            <OutlineButton>
              <Brain className="h-5 w-5" />
              <span>Learn More</span>
              <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </OutlineButton>
          </div>
        </div>

        {/* Right Column: Main image and floating highlight cards for visual appeal */}
        <div className="relative">
          <div className="relative">
            <DecorativeImage
              src="/images/home-hero.jpg"
              alt="Woman doing yoga meditation for wellness and mental health"
              width={600}
              height={600}
            />

            {/* Personalized Plans Floating Card */}
            <FloatingCard
              icon={<Heart className="h-5 w-5" />}
              title="Personalized Plans"
              description="Tailored to your needs"
              className="-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6"
              iconClassName="bg-linear-to-r from-[#35bec5] to-[#4bc4db]"
            />

            {/* Doctor Guided Floating Card */}
            <FloatingCard
              icon={<Shield className="h-5 w-5" />}
              title="Doctor Guided"
              description="Expert supervision"
              className="-right-2 -bottom-6 sm:-right-4 lg:-right-6"
              iconClassName="bg-linear-to-r from-[#4bc4db] to-[#0c96c4]"
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default HeroSection;
