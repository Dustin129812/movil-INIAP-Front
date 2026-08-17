// ============================================
// INPUT GLOBAL REUTILIZABLE
// ============================================
// Uso: import { GlobalInput } from '../global/Input';

import { StyleSheet, View, Text, TextInput } from 'react-native';
import { COLORS } from './colors';

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.light.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputDark: {
    backgroundColor: COLORS.dark.input,
    color: COLORS.textDark.primary,
    borderColor: COLORS.dark.border,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export function GlobalInput({
  label,
  value,
  onChangeText,
  placeholder,
  dark = false,
  multiline = false,
  style,
  inputStyle,
  ...props
}) {
  return (
    <View style={[inputStyles.container, style]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark ? COLORS.textDark.placeholder : COLORS.text.placeholder}
        style={[
          inputStyles.input,
          dark && inputStyles.inputDark,
          multiline && inputStyles.multiline,
          inputStyle,
        ]}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

export { inputStyles };
