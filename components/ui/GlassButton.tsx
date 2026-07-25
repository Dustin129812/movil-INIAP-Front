import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: GlassButtonProps) {
  const getBackgroundColor = () => {
    if (disabled || loading) return '#C7C7CC';
    switch (variant) {
      case 'secondary':
        return '#F2F2F7';
      case 'danger':
        return '#FF3B30';
      default:
        return '#34C759';
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return '#007AFF';
    return '#fff';
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: getBackgroundColor() }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
  },
});
