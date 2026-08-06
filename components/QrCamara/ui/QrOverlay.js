import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const QrOverlay = ({ onClose }) => {
    return (
        <View style={styles.overlay}>
            <View style={styles.topOverlay}>
                <Text style={styles.scanText}>Apunta al QR del Libro de Campo</Text>
            </View>
            <View style={styles.middleOverlay}>
                <View style={styles.leftOverlay} />
                <View style={styles.focusedBox}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <View style={styles.rightOverlay} />
            </View>
            <View style={styles.bottomOverlay}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="close" size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const overlayColor = 'rgba(15, 23, 42, 0.7)'; // Ajustado a la paleta TALL
const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
    topOverlay: { flex: 1, backgroundColor: overlayColor, justifyContent: 'center', alignItems: 'center' },
    scanText: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 40, letterSpacing: 0.5 },
    middleOverlay: { flexDirection: 'row', height: 260 },
    leftOverlay: { flex: 1, backgroundColor: overlayColor },
    focusedBox: { width: 260, height: 260, backgroundColor: 'transparent', position: 'relative' },
    rightOverlay: { flex: 1, backgroundColor: overlayColor },
    bottomOverlay: { flex: 1, backgroundColor: overlayColor, alignItems: 'center', justifyContent: 'center' },

    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#10b981', borderWidth: 5 },
    topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 12 },
    topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 12 },
    bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 12 },
    bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 12 },

    closeButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});