// ============================================
// ESTILOS DE CREAR PROYECTO
// ============================================

// Origen: app/proyectos/nuevo/index.js

import { StyleSheet } from 'react-native';

import { sharedProyectoStyles } from './sharedProyectoStyles';

// Re-exportar estilos compartidos
export const crearProyectoStyles = {
    ...sharedProyectoStyles,
};

// ============================================
// ESTILOS ESPECÍFICOS DE CREAR PROYECTO
// ============================================

export const crearProyectoSpecificStyles = StyleSheet.create({
    // Solo estilos únicos para crear proyecto
});