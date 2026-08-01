import type { CapacitorConfig } from '@capacitor/cli';

// appId is the store bundle identifier and is effectively permanent once
// published — set it to a reverse-DNS name on a domain you control before
// running `npx cap add ios/android`.
const config: CapacitorConfig = {
  appId: 'com.lolcoded.cascade',
  appName: 'Cascade',
  webDir: 'dist'
};

export default config;
