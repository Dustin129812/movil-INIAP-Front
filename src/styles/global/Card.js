// ============================================
// CARD GLOBAL REUTILIZABLE
// ============================================
// Uso: import { GlobalCard } from '../global/Card';

import { StyleSheet, View } from 'react-native';
import { COLORS } from './colors';

const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.light.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  dark: {
    backgroundColor: COLORS.dark.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  compact: {
    padding: 12,
    borderRadius: 12,
  },
});

export function GlobalCard({ children, dark = false, compact = false, style }) {
  return (
    <View
      style={[
        cardStyles.base,
        dark && cardStyles.dark,
        compact && cardStyles.compact,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export { cardStyles };
