// ============================================
// BOTÓN GLOBAL REUTILIZABLE
// ============================================
// Uso: import { GlobalButton } from '../global/Button';

import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { COLORS } from './colors';

const buttonStyles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseDark: {
    backgroundColor: COLORS.primary,
  },
  disabled: {
    backgroundColor: 'rgba(52, 199, 89, 0.4)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  small: {
    paddingVertical: 12,
    borderRadius: 12,
  },
  smallText: {
    fontSize: 15,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
});

export function GlobalButton({
  onPress,
  title,
  disabled = false,
  loading = false,
  small = false,
  outline = false,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        buttonStyles.base,
        small && buttonStyles.small,
        outline && buttonStyles.outline,
        isDisabled && buttonStyles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text
          style={[
            buttonStyles.text,
            small && buttonStyles.smallText,
            outline && buttonStyles.outlineText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export { buttonStyles };
