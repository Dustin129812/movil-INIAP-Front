// ============================================
// ESTILOS DE DETALLE DE LOTE
// ============================================
// Origen: app/lotes/[id].js
// Documentacion: Estilos para la pantalla de detalle de lote

import { StyleSheet } from 'react-native';

export const loteDetalleStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
