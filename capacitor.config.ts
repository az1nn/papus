import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.universalreader',
  appName: 'Universal Reader AI',
  webDir: 'dist',
  android: { allowMixedContent: false }
};

export default config;
