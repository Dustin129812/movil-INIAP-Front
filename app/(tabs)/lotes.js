import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getAppTheme, useTheme } from '../../services/theme';
import LotesDashboardUI from '../../components/lotes/ui/LotesDashboardUI';

export default function LotesScreen() {
  const { isDark } = useTheme();
  const backgroundColor = getAppTheme(isDark).background;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LotesDashboardUI />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
