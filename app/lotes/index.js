import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { LotesDashboardUI } from '../../components/lotes/ui/LotesDashboardUI';

export default function LotesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LotesDashboardUI />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
