/**
 * Resolves the API URL based on the runtime environment.
 * In a Capacitor native app, absolute URLs are required to reach the backend.
 * In a web context, relative paths are preferred.
 */
export const getApiUrl = (path: string): string => {
  if (typeof window === 'undefined') {
    return path;
  }

  // Check if running inside a Capacitor native container
  const isCapacitor = 
    (window as any).Capacitor?.isNativePlatform?.() || 
    (window as any).Capacitor !== undefined ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'http:' && window.location.hostname === 'localhost' && !window.location.port;

  if (isCapacitor) {
    return `https://igwtbible.vercel.app${path}`;
  }

  return path;
};
