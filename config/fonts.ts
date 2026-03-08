import { Inter, Noto_Sans_Myanmar } from 'next/font/google';

/**
 * Font configuration for Inter, using the Next.js font optimization.
 * Provides the Inter font family as a CSS variable (--font-inter) with support for various weights.
 *
 * @see https://nextjs.org/docs/app/getting-started/fonts#with-tailwind-css
 */
export const interFont = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

/**
 * Font configuration for Noto Sans Myanmar, using Next.js font optimization.
 * Exposes the Noto Sans Myanmar font as a CSS variable (--font-noto-sans-myanmar), supporting Myanmar script and multiple weights.
 *
 * @see https://nextjs.org/docs/app/getting-started/fonts#with-tailwind-css
 */
export const notoSansMyanmarFont = Noto_Sans_Myanmar({
  variable: '--font-noto-sans-myanmar',
  subsets: ['myanmar'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
