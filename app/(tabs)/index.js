import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../services/ThemeContext';
import HomeDashboard from '../../components/home/ui/HomeDashboard';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const backgroundColor = isDark ? '#000000' : '#F2F2F7';

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