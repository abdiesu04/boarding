export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL}`
    : 'http://localhost:3000';
}
