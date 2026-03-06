import { Inter } from 'next/font/google';

/**
 * Shared Inter font instance used across admin layouts.
 *
 * Declared once to avoid duplicate font loading and ensure consistent
 * weight availability across the admin auth and dashboard surfaces.
 */
export const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});
