import { Copyright, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Input from '@/components/shared/custom/Input';
import FormButton from '@/components/shared/custom/FormButton';

export default function AdminLoginPage() {
  return (
    <main className="bg-background relative flex min-h-screen items-center justify-center p-5">
      {/* Main centered container for the admin login UI */}
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Card-like background container with border, shadow, rounded corners */}
        <div className="bg-background border-border overflow-hidden rounded-lg border p-0 shadow-lg backdrop-blur-xl">
          {/* Two-column grid for large screens: branding left, form right */}
          <div className="grid min-h-120 md:min-h-150 grid-cols-1 lg:grid-cols-2">
            {/* ================= Left Side: Logo & Info ================= */}
            <div className="from-primary/90 via-primary to-accent/90 relative hidden flex-col items-center justify-center overflow-hidden bg-linear-to-br p-8 text-white lg:flex lg:p-12">
              <div className="relative z-10 text-center">
                {/* Brand white logo  */}
                <div className="mb-6 flex items-center justify-center">
                  <Image
                    src="/images/logo-white.png"
                    alt="SaKyi Health & Wellness Logo"
                    width={54}
                    height={54}
                    className="rounded-md object-contain"
                    priority
                  />
                </div>

                {/* Organization name, separator, and panel title */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-xl leading-tight font-bold text-white lg:text-2xl">
                      SaKyi Health & Wellness
                    </h1>
                    {/* Decorative divider */}
                    <div className="mx-auto h-0.5 w-16 rounded-full bg-white/50"></div>
                    <p className="text-md font-medium tracking-wide text-white">
                      Administrative Control Panel
                    </p>
                  </div>

                  {/* Short mission/value statement */}
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-white/80">
                    Delivering innovative solutions to streamline healthcare
                    administration and enhance patient care outcomes.
                  </p>
                </div>
              </div>
            </div>

            {/* ================= Right Side: Login Form ================= */}
            <div className="flex flex-col justify-center bg-white p-6 lg:p-12">
              <div className="mb-5 space-y-3 text-center md:mb-10">
                <div className="mb-3 flex items-center justify-center md:mb-6 lg:hidden">
                  <Image
                    src="/images/logo.png"
                    alt="SaKyi Health & Wellness Logo"
                    width={54}
                    height={54}
                    className="rounded-md object-contain"
                    priority
                  />
                </div>
                <h1 className="text-foreground text-lg font-bold tracking-tight sm:text-2xl">
                  Welcome Back!
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Sign in to securely manage healthcare services and
                  administrative operations.
                </p>
              </div>

              {/* Login form with controlled Email and Password inputs */}
              <form className="space-y-3 md:space-y-4">
                <Input
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@sakyihealth.com"
                  required
                  error="Invalid email address"
                />

                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  required
                />

                {/* Submit button, styled and shows spinner when processing */}
                <FormButton processing={true}>
                  <span>Sign In</span>
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </FormButton>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with copyright info, fixed at page bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform w-full">
        <p className="text-muted-foreground w-full flex items-center justify-center space-x-1 text-xs font-semibold">
          <Copyright className="h-5 w-5" />
          <span>2026 SaKyi Health & Wellness. All rights reserved.</span>
        </p>
      </div>
    </main>
  );
}
