// ============================================
// SKELETON CARD GLOBAL - Para estados de carga
// ============================================
import { StyleSheet, View } from 'react-native';

const skeletonStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 36,
    overflow: 'hidden',
  },
  light: {
    backgroundColor: '#FFFFFF',
  },
  dark: {
    backgroundColor: '#1C1C1E',
  },
  imageSection: {
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonLight: {
    backgroundColor: '#E5E5EA',
  },
  skeletonDark: {
    backgroundColor: '#38383A',
  },
  line: {
    height: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  lineLarge: {
    height: 20,
    width: '60%',
  },
  lineMedium: {
    height: 14,
    width: '80%',
  },
  lineSmall: {
    height: 12,
    width: '40%',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});

export function SkeletonCard({ dark = false, style }) {
  const skeletonBg = dark ? '#38383A' : '#E5E5EA';

  return (
    <View style={[skeletonStyles.container, dark ? skeletonStyles.dark : skeletonStyles.light, style]}>
      <View style={[skeletonStyles.imageSection, skeletonStyles.skeletonLight, { backgroundColor: skeletonBg }]} />
      <View style={skeletonStyles.row}>
        <View style={[skeletonStyles.line, skeletonStyles.lineLarge, { backgroundColor: skeletonBg }]} />
        <View style={[skeletonStyles.line, { width: 60, backgroundColor: skeletonBg, borderRadius: 10 }]} />
      </View>
      <View style={[skeletonStyles.line, skeletonStyles.lineMedium, { backgroundColor: skeletonBg }]} />
      <View style={[skeletonStyles.line, skeletonStyles.lineSmall, { backgroundColor: skeletonBg }]} />
    </View>
  );
}

export { skeletonStyles };
