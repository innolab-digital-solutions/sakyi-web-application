import SectionContainer from '@/components/site/shared/SectionContainer';
import { Users, Shield, Target, TrendingUp, ArrowRight } from 'lucide-react';
import DecorativeImage from '@/components/site/shared/DecorativeImage';
import FloatingCard from '@/components/site/shared/FloatingCard';
import SectionBadge from '@/components/site/shared/SectionBadge';
import GradientText from '@/components/site/shared/GradientText';
import GradientButton from '@/components/site/shared/GradientButton';
import Link from 'next/link';
import { PATHS } from '@/config/paths';
import FeatureList from '@/components/site/shared/FeatureList';

const AboutSection = () => {
  const features = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Doctor-Designed Programs',
      description:
        'Evidence-based wellness plans created by certified medical professionals',
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: 'Personalized Approach',
      description:
        'Tailored strategies that adapt to your unique lifestyle and goals',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Proven Results',
      description:
        'Track your progress with measurable outcomes and celebrate milestones',
    },
  ];

  return (
    <SectionContainer id="about-section" className="bg-background">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        {/* Left Column: Visual storytelling with decorative image and floating highlight cards */}
        <div className="relative">
          <div className="relative">
            {/* Main illustrative image communicating wellness and mindfulness */}
            <DecorativeImage
              src="/images/home-about.jpg"
              alt="Woman doing yoga meditation for wellness and mental health"
              width={600}
              height={600}
            />

            {/* FloatingCard: Showcases impact with user count */}
            <FloatingCard
              icon={<Users className="h-5 w-5" />}
              title="10K+ Lives"
              description="Transformed"
              className="-top-6 -left-2 sm:-left-4 lg:-top-4 lg:-left-6"
              iconClassName="bg-linear-to-r from-[#35bec5] to-[#4bc4db]"
            />

            {/* FloatingCard: Highlights program success rate */}
            <FloatingCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="98% Success"
              description="Rate"
              className="-right-2 -bottom-6 sm:-right-4 lg:-right-6"
              iconClassName="bg-linear-to-r from-[#4bc4db] to-[#0c96c4]"
            />
          </div>
        </div>

        {/* Right Column: Headline, descriptive introduction, features, and strong call to action */}
        <div className="space-y-8">
          {/* Section Header: Badge, headline, and program summary */}
          <div className="space-y-6">
            {/* Section badge introduces the about section with icon */}
            <SectionBadge
              icon={<Users className="h-4 w-4" />}
              text="About SaKyi"
            />

            {/* Headline with visual emphasis and gradient highlight */}
            <h2 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              <span
                className="text-foreground block"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Your Wellness
              </span>

              <GradientText>Journey Starts Here</GradientText>
            </h2>

            {/* Introductory paragraph describing value and approach */}
            <p
              className="text-foreground/80 max-w-2xl text-lg leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              We combine medical expertise with personalized wellness strategies
              to help you achieve lasting health transformation. Our
              evidence-based programs are designed by certified doctors and
              wellness experts.
            </p>
          </div>

          {/* Features List: Key differentiators as visually grouped feature items */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <FeatureList
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          {/* Call To Action: Encourages users to explore available programs with strong visual button */}
          <div className="pt-4">
            <Link href={PATHS.PUBLIC.PROGRAMS} className="inline-block">
              <GradientButton>
                <span>Explore Our Programs</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default AboutSection;
