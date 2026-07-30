import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LotesDashboardUI from '../../components/lotes/ui/LotesDashboardUI';

export default function LotesTabScreen() {
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
