// Temporary fallback for next/font during build in restricted network environment
// In production, this should be replaced with actual next/font/google imports
export const Inter = (config: any) => ({
  className: 'font-sans',
});
