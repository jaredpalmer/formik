// Temporary fallback for next/font during build in restricted network environment
// TODO: Replace this with actual next/font/google imports in production
// In production, this should be replaced with:
// import { Inter } from 'next/font/google';

let hasWarned = false;

export const Inter = (config: any) => {
  if (!hasWarned && typeof window === 'undefined') {
    console.warn(
      '⚠️  Using font fallback instead of next/font/google. ' +
      'Replace this with actual next/font/google import in production.'
    );
    hasWarned = true;
  }
  
  return {
    className: 'font-sans',
    // Basic config support to match next/font API shape
    style: { fontFamily: 'ui-sans-serif, system-ui, sans-serif' },
    variable: '--font-inter',
  };
};
