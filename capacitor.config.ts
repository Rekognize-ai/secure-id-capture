import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6a00e3b5fe364f12b8aac7490f59e8aa',
  appName: 'Prison Enrollment System',
  webDir: 'dist',
  server: {
    url: 'https://6a00e3b5-fe36-4f12-b8aa-c7490f59e8aa.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#1B4332',
      showSpinner: false,
    },
  },
};

export default config;
