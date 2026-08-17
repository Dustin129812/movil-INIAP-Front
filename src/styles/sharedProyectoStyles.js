// ============================================
// ESTILOS COMPARTIDOS PARA PROYECTOS
// ============================================
// Uso: crear/editar proyectos - estilos comunes a ambos
// Origen: src/styles/sharedProyectoStyles.js

import { StyleSheet } from 'react-native';
import { COLORS } from './global/colors';

export const sharedProyectoStyles = StyleSheet.create({
  // --- CONTENEDORES PRINCIPALES ---
  container: { flex: 1 },
  containerLight: { backgroundColor: COLORS.light.bg },
  containerDark: { backgroundColor: COLORS.dark.bg },
  textWhite: { color: '#FFFFFF' },

  // --- SCROLL VIEW ---
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // --- STATUS BAR ---
  statusBarScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },

  // --- HEADER ---
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 42,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },

  // --- BOTONES DEL HEADER ---
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonDark: {
    backgroundColor: COLORS.primaryDark,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(52, 199, 89, 0.3)',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // --- SECCIONES ---
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleDark: { color: COLORS.textDark.secondary },

  // --- CARDS ---
  card: {
    backgroundColor: COLORS.light.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: COLORS.dark.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  // --- INPUTS ---
  inputContainer: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.light.input,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputDark: {
    backgroundColor: COLORS.dark.input,
    color: '#FFFFFF',
    borderColor: COLORS.dark.border,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // --- OPTIONS CHIPS (botones de seleccion) ---
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.light.input,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipDark: {
    backgroundColor: COLORS.dark.input,
  },
  optionChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // --- BOTON CREAR ---
  buttonContainer: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(52, 199, 89, 0.4)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  // --- ESTADOS ESPECIALES ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  volverText: {
    color: COLORS.primary,
    fontSize: 16,
    marginTop: 20,
  },
});
