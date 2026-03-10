import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StudioGo',
  slug: 'studiogo',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#6C5CE7',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'kr.studiogo.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#6C5CE7',
    },
    package: 'kr.studiogo.app',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-secure-store', '@sentry/react-native/expo'],
  experiments: {
    typedRoutes: true,
  },
  scheme: 'studiogo',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001',
    kakaoAppKey: process.env.EXPO_PUBLIC_KAKAO_APP_KEY ?? '',
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  },
});
