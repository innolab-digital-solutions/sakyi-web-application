import { Inter, Noto_Sans_Myanmar } from 'next/font/google';

/**
 * Inter: primary font for Latin/English text.
 * Used across site and admin. Loaded with CSS variable for use in font stack.
 */
export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

/**
 * Noto Sans Myanmar: font for Myanmar (Burmese) script.
 * Used in font stack so Myanmar script renders with proper glyphs; Inter used for Latin.
 */
export const notoSansMyanmar = Noto_Sans_Myanmar({
  variable: '--font-noto-sans-myanmar',
  subsets: ['myanmar'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
