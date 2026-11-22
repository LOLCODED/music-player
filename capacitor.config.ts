import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

// appId is the store bundle identifier and is effectively permanent once
// published — set it to a reverse-DNS name on a domain you control before
// running `npx cap add ios/android`.
const config: CapacitorConfig = {
  appId: 'com.lolcoded.cascade',
  appName: 'Cascade',
  webDir: 'dist',
  ios: {
    // The app scrolls inside its own panes; letting the web view itself scroll
    // slides the whole layout, header included, under the status bar.
    scrollEnabled: false,
  },
  plugins: {
    // Native HTTP: the app's capacitor:// origin isn't on servers' CORS lists.
    CapacitorHttp: { enabled: true },
    // Shrink the whole web view above the keyboard, so bottom sheets and focused fields stay visible.
    Keyboard: { resize: KeyboardResize.Native, resizeOnFullScreen: true },
  },
};

export default config;
