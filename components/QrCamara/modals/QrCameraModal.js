import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { CameraView } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQrCamera } from '../hooks/useQrCamera';
import { QrOverlay } from '../ui/QrOverlay';

export default function QrCameraModal({ visible, onClose }) {
    // Inyección de dependencias del hook
    const {
        permission,
        requestPermission,
        scanned,
        handleBarCodeScanned
    } = useQrCamera(onClose);

    if (!permission) {
        return <View />; // Esperando inicialización de permisos
    }

    // Renderizado para solicitar permisos
    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="fade" transparent={true}>
                <View style={styles.permissionContainer}>
                    <View style={styles.permissionCard}>
                        <MaterialCommunityIcons name="camera-off" size={56} color="#ef4444" />
                        <Text style={styles.permissionText}>El sistema requiere acceso a la cámara para leer el libro de campo.</Text>
                        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                            <Text style={styles.permissionBtnText}>Habilitar Cámara</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // Orquestación principal
    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />

                <QrOverlay onClose={onClose} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.95)' },
    permissionCard: { backgroundColor: '#fff', padding: 32, borderRadius: 24, width: '85%', alignItems: 'center', elevation: 10 },
    permissionText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#334155', marginVertical: 20, lineHeight: 24 },
    permissionBtn: { backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' },
    permissionBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    cancelBtn: { marginTop: 16, padding: 8 },
    cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 15 }
});