import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../services/ThemeContext';
import HomeDashboard from '../../components/home/ui/HomeDashboard';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const backgroundColor = isDark ? '#000000' : '#F2F2F7';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={{ flex: 1, backgroundColor }}>
        <HomeDashboard />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});