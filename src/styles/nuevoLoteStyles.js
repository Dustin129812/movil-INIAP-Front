// ============================================
// ESTILOS DE NUEVO LOTE
// ============================================
// Origen: app/lotes/nuevo/index.js
// Documentacion: Estilos para la pantalla de creacion de nuevo lote

import { StyleSheet } from 'react-native';

export const nuevoLoteStyles = StyleSheet.create({
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
