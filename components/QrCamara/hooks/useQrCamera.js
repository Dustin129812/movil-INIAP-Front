import { useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

export const useQrCamera = (onCloseModal) => {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        onCloseModal();
        
        if (data) {
            router.push({
                pathname: '/(superior)/ejecucion-campo/proyecto-detalle',
                params: { id: data }
            });

            setTimeout(() => {
                setScanned(false);
            }, 1000);
        } else {
            Alert.alert(
                "Código Inválido",
                "El código QR escaneado no contiene un identificador válido para el libro de campo.",
                [{ text: "Entendido", onPress: () => setScanned(false) }]
            );
        }
    };

    const resetScanner = () => {
        setScanned(false);
    };

    return {
        permission,
        requestPermission,
        scanned,
        handleBarCodeScanned,
        resetScanner
    };
};