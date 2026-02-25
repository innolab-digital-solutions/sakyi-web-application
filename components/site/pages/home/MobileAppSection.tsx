import {
  Award,
  CheckCircle,
  Clock,
  Heart,
  Smartphone,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import SectionContainer from '@/components/site/shared/SectionContainer';

const MobileAppSection = () => {
  return (
    <SectionContainer id='mobile-app-section' className='bg-white'>
      <div className='grid items-center gap-8 lg:grid-cols-2 lg:gap-12'>
        {/* Left Column - Text Content */}
        <div
          className='space-y-8'
          data-aos='slide-up'
          data-aos-duration='1200'
          data-aos-easing='ease-out-cubic'
        >
          <div className='space-y-6'>
            <div
              className='inline-flex items-center space-x-2 rounded-full bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2'
              data-aos='slide-down'
              data-aos-delay='200'
              data-aos-duration='800'
              data-aos-easing='ease-out-back'
            >
              <Smartphone className='h-4 w-4 text-[#35bec5]' />
              <span
                className='text-sm font-medium text-[#35bec5]'
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Mobile App
              </span>
            </div>

            <h2
              className='text-2xl leading-tight font-bold sm:text-3xl sm:leading-tight lg:text-4xl xl:text-5xl'
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <span
                data-aos='fade-up'
                data-aos-delay='300'
                data-aos-duration='1000'
                data-aos-easing='ease-out-cubic'
              >
                Your Wellness Journey,{' '}
              </span>
              <span
                className='text-brand-gradient bg-clip-text text-transparent'
                style={{ fontFamily: 'Poppins, sans-serif' }}
                data-aos='fade-up'
                data-aos-delay='500'
                data-aos-duration='1000'
                data-aos-easing='ease-out-cubic'
              >
                Always With You
              </span>
            </h2>

            <p
              className='text-lg leading-relaxed text-slate-600'
              style={{ fontFamily: 'Inter, sans-serif' }}
              data-aos='slide-up'
              data-aos-delay='700'
              data-aos-duration='1000'
              data-aos-easing='ease-out-cubic'
            >
              Stay on track with SaKyi&apos;s mobile app — receive your weekly
              doctor updates, complete daily tasks, and monitor your health
              progress anytime, anywhere.
            </p>
          </div>

          {/* App Store Buttons */}
          <div className='flex flex-col gap-4 sm:flex-row sm:gap-6'>
            <Link
              href='#'
              className='group bg-brand-gradient inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span className='relative z-10'>Coming Soon</span>
              <Clock className='ml-2 h-5 w-5 transition-transform duration-300' />
            </Link>
          </div>

          <p
            className='text-sm text-slate-500'
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Available on iOS and Android.
          </p>
        </div>

        {/* Right Column - App Mockups */}
        <div
          className='relative'
          data-aos='zoom-in'
          data-aos-duration='1200'
          data-aos-delay='400'
          data-aos-easing='ease-out-cubic'
        >
          <div className='flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-6'>
            {/* First Phone Mockup - Dashboard Screen */}
            <div className='group relative z-10'>
              {/* Glow effect */}
              <div className='absolute inset-0 -z-10 h-100 w-45 rotate-12 transform rounded-3xl bg-linear-to-br from-[#35bec5]/20 to-[#0c96c4]/20 blur-xl sm:h-112.5 sm:w-50 lg:h-125 lg:w-60'></div>
              <div className='h-100 w-45 rotate-12 transform overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-112.5 sm:w-50 sm:rotate-12 lg:h-125 lg:w-60 lg:rotate-12'>
                {/* Phone Status Bar */}
                <div className='flex items-center justify-between bg-white px-4 py-2'>
                  <div className='flex items-center space-x-1'>
                    <div className='h-1 w-1 rounded-full bg-black'></div>
                    <div className='h-1 w-1 rounded-full bg-black'></div>
                    <div className='h-1 w-1 rounded-full bg-black'></div>
                  </div>
                  <div className='text-xs font-semibold'>9:41</div>
                  <div className='flex items-center space-x-1'>
                    <div className='h-2 w-4 rounded-sm border border-black'>
                      <div className='m-0.5 h-1.5 w-3 rounded-sm bg-green-500'></div>
                    </div>
                    <div className='h-3 w-6 rounded-sm border border-black'></div>
                  </div>
                </div>

                {/* App Header */}
                <div className='bg-linear-to-br from-[#35bec5] to-[#0c96c4] px-4 py-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-sm font-bold text-white'>
                        SaKyi Wellness
                      </h3>
                      <p className='text-xs text-white/80'>
                        Your Health Journey
                      </p>
                    </div>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20'>
                      <Heart className='h-4 w-4 text-white' />
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className='space-y-4 p-4'>
                  {/* Welcome Card */}
                  <div className='rounded-xl bg-linear-to-br from-[#35bec5]/10 to-[#0c96c4]/10 p-3'>
                    <h4 className='text-sm font-semibold text-slate-800'>
                      Good Morning, Sarah!
                    </h4>
                    <p className='mt-1 text-xs text-slate-600'>
                      Ready for today&apos;s wellness journey?
                    </p>
                  </div>

                  {/* Progress Cards */}
                  <div className='space-y-2'>
                    <div className='rounded-lg bg-slate-50 p-2'>
                      <div className='mb-1 flex items-center justify-between'>
                        <span className='text-xs font-medium text-slate-700'>
                          Daily Steps
                        </span>
                        <span className='text-xs font-semibold text-[#35bec5]'>
                          8,247
                        </span>
                      </div>
                      <div className='h-1.5 w-full rounded-full bg-slate-200'>
                        <div
                          className='h-1.5 rounded-full bg-linear-to-br from-[#35bec5] to-[#0c96c4]'
                          style={{ width: '82%' }}
                        ></div>
                      </div>
                    </div>

                    <div className='rounded-lg bg-slate-50 p-2'>
                      <div className='mb-1 flex items-center justify-between'>
                        <span className='text-xs font-medium text-slate-700'>
                          Water Intake
                        </span>
                        <span className='text-xs font-semibold text-[#35bec5]'>
                          6/8 glasses
                        </span>
                      </div>
                      <div className='h-1.5 w-full rounded-full bg-slate-200'>
                        <div
                          className='h-1.5 rounded-full bg-linear-to-br from-[#35bec5] to-[#0c96c4]'
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Today's Tasks */}
                  <div>
                    <h5 className='mb-2 text-xs font-semibold text-slate-800'>
                      Today&apos;s Tasks
                    </h5>
                    <div className='space-y-1'>
                      <div className='flex items-center space-x-2'>
                        <div className='flex h-4 w-4 items-center justify-center rounded-full bg-green-100'>
                          <CheckCircle className='h-2.5 w-2.5 text-green-600' />
                        </div>
                        <span className='text-xs text-slate-600'>
                          Morning meditation
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <div className='h-4 w-4 rounded-full bg-slate-200'></div>
                        <span className='text-xs text-slate-600'>
                          30-min walk
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <div className='h-4 w-4 rounded-full bg-slate-200'></div>
                        <span className='text-xs text-slate-600'>
                          Healthy lunch
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Phone Mockup - Progress Screen */}
            <div className='group relative z-0 -translate-y-8 sm:-translate-y-10 lg:-translate-y-12'>
              {/* Glow effect */}
              <div className='absolute inset-0 -z-10 h-100 w-45 -rotate-12 transform rounded-3xl bg-linear-to-br from-[#4bc4db]/20 to-[#35bec5]/20 blur-xl sm:h-112.5 sm:w-50 lg:h-125 lg:w-60'></div>
              <div className='h-100 w-45 -rotate-12 transform overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-112.5 sm:w-50 sm:-rotate-12 lg:h-125 lg:w-60 lg:-rotate-12'>
                {/* Phone Status Bar */}
                <div className='flex items-center justify-between bg-white px-4 py-2'>
                  <div className='flex items-center space-x-1'>
                    <div className='h-1 w-1 rounded-full bg-black'></div>
                    <div className='h-1 w-1 rounded-full bg-black'></div>
                    <div className='h-1 w-1 rounded-full bg-black'></div>
                  </div>
                  <div className='text-xs font-semibold'>9:41</div>
                  <div className='flex items-center space-x-1'>
                    <div className='h-2 w-4 rounded-sm border border-black'>
                      <div className='m-0.5 h-1.5 w-3 rounded-sm bg-green-500'></div>
                    </div>
                    <div className='h-3 w-6 rounded-sm border border-black'></div>
                  </div>
                </div>

                {/* App Header */}
                <div className='bg-linear-to-br from-[#4bc4db] to-[#35bec5] px-4 py-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-sm font-bold text-white'>Progress</h3>
                      <p className='text-xs text-white/80'>Week 3 of 12</p>
                    </div>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20'>
                      <TrendingUp className='h-4 w-4 text-white' />
                    </div>
                  </div>
                </div>

                {/* Progress Content */}
                <div className='space-y-4 p-4'>
                  {/* Weekly Overview */}
                  <div className='rounded-xl bg-linear-to-br from-[#4bc4db]/10 to-[#35bec5]/10 p-3'>
                    <h4 className='text-sm font-semibold text-slate-800'>
                      This Week
                    </h4>
                    <div className='mt-2 flex items-center justify-between'>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-[#4bc4db]'>
                          5
                        </div>
                        <div className='text-xs text-slate-600'>
                          Days Active
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-[#35bec5]'>
                          12
                        </div>
                        <div className='text-xs text-slate-600'>Goals Met</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-[#0c96c4]'>
                          85%
                        </div>
                        <div className='text-xs text-slate-600'>
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className='rounded-lg bg-slate-50 p-3'>
                    <h5 className='mb-2 text-xs font-semibold text-slate-800'>
                      Weekly Progress
                    </h5>
                    <div className='flex h-16 items-end justify-between'>
                      <div className='flex flex-col items-center'>
                        <div
                          className='w-3 rounded-t bg-linear-to-t from-[#35bec5] to-[#4bc4db]'
                          style={{ height: '60%' }}
                        ></div>
                        <span className='mt-1 text-xs text-slate-500'>Mon</span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <div
                          className='w-3 rounded-t bg-linear-to-t from-[#35bec5] to-[#4bc4db]'
                          style={{ height: '80%' }}
                        ></div>
                        <span className='mt-1 text-xs text-slate-500'>Tue</span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <div
                          className='w-3 rounded-t bg-linear-to-t from-[#35bec5] to-[#4bc4db]'
                          style={{ height: '100%' }}
                        ></div>
                        <span className='mt-1 text-xs text-slate-500'>Wed</span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <div
                          className='w-3 rounded-t bg-linear-to-t from-[#35bec5] to-[#4bc4db]'
                          style={{ height: '70%' }}
                        ></div>
                        <span className='mt-1 text-xs text-slate-500'>Thu</span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <div
                          className='w-3 rounded-t bg-linear-to-t from-[#35bec5] to-[#4bc4db]'
                          style={{ height: '90%' }}
                        ></div>
                        <span className='mt-1 text-xs text-slate-500'>Fri</span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h5 className='mb-2 text-xs font-semibold text-slate-800'>
                      Recent Achievements
                    </h5>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2 rounded-lg bg-yellow-50 p-2'>
                        <Award className='h-4 w-4 text-yellow-600' />
                        <span className='text-xs text-slate-700'>
                          7-day streak!
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 rounded-lg bg-green-50 p-2'>
                        <Target className='h-4 w-4 text-green-600' />
                        <span className='text-xs text-slate-700'>
                          Goal completed
                        </span>
                      </div>
                    </div>
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

export default MobileAppSection;
