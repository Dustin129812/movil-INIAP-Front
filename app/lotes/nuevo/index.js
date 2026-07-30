import React from 'react';
import { StyleSheet, View } from 'react-native';
import CroquisMapaUI from '../../../components/lotes/ui/CroquisMapaUI';

export default function NuevoLoteScreen() {
  return (
    <View style={styles.container}>
      <CroquisMapaUI />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
