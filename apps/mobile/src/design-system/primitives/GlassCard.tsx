import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** 블러 강도 (0-100) */
  intensity?: number;
  /** 블러 틴트 */
  tint?: 'light' | 'dark' | 'default';
}

/**
 * Glass morphism 카드 — iOS/Android: BlurView, Web: CSS backdrop-filter
 */
export function GlassCard({
  children,
  className = '',
  intensity = 40,
  tint = 'light',
}: GlassCardProps) {
  if (Platform.OS === 'web') {
    return (
      <View className={`overflow-hidden rounded-card ${className}`} style={webStyles.glass}>
        {children}
      </View>
    );
  }

  return (
    <View className={`overflow-hidden rounded-card ${className}`}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View className="relative z-10">{children}</View>
    </View>
  );
}

const webStyles = StyleSheet.create({
  glass: {
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
