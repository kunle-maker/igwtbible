import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.igwtbible.app',
  appName: 'In God We Trust Bible',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
