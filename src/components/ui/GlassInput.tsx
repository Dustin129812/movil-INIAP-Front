import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function GlassInput({ label, error, containerStyle, style, ...props }: GlassInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3C3C43',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
});
