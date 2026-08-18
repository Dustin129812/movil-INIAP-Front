// ============================================
// ESTILOS DE CREAR PROYECTO
// ============================================
// Diseño: Apple-style con scroll animado, secciones, verde (#34C759)
// Origen: app/proyectos/nuevo/index.js

import { StyleSheet } from 'react-native';
import { sharedProyectoStyles } from './sharedProyectoStyles';

// Re-exportar estilos compartidos
export const crearProyectoStyles = {
  ...sharedProyectoStyles,
};

// Estilos específicos de crear proyecto (agregar si es necesario)
export const crearProyectoSpecificStyles = StyleSheet.create({
  // Solo estilos únicos para crear proyecto
});
