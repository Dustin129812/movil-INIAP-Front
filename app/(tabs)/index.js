import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getAppTheme, useTheme } from '../../services/theme';
import HomeDashboard from '../../components/home/ui/HomeDashboard';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const backgroundColor = getAppTheme(isDark).background;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <HomeDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});