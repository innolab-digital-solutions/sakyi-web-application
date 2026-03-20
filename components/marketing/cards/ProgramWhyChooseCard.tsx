import type { LucideIcon } from 'lucide-react';

type FeatureCardProperties = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  index?: number;
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
  index = 0,
}: FeatureCardProperties) => {
  return (
    <div
      className='group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-[#35bec5]/50 hover:shadow-lg'
      data-aos='fade-up'
      data-aos-delay={`${index * 200}`}
      data-aos-duration='800'
      data-aos-easing='ease-out'
    >
      {/* Icon */}
      <div className='mb-6'>
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-r ${color} shadow-lg transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl`}
        >
          <Icon className='h-6 w-6 text-white transition-transform duration-500 group-hover:scale-110' />
        </div>
      </div>

      {/* Content */}
      <div className='space-y-4'>
        <h3
          className='text-xl font-bold text-slate-900'
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {title}
        </h3>
        <p
          className='leading-relaxed text-slate-600'
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {description}
        </p>
      </div>

      {/* Hover Effect */}
      <div className='absolute inset-0 rounded-2xl bg-linear-to-r from-[#35bec5]/5 to-[#0c96c4]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
    </div>
  );
};

export default FeatureCard;
