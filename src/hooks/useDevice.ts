import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';

const CLAVE_DISPOSITIVO = 'dispositivo_id';

interface InfoDispositivo {
  dispositivoId: string | null;
  modelo: string | null;
  sistemaOperativo: string | null;
  cargando: boolean;
}

export function useDevice(): InfoDispositivo {
  const [info, setInfo] = useState<InfoDispositivo>({
    dispositivoId: null,
    modelo: null,
    sistemaOperativo: null,
    cargando: true,
  });

  useEffect(() => {
    let mounted = true;

    async function inicializar() {
      try {
        // 1. Obtener o crear UUID
        let uuid = await AsyncStorage.getItem(CLAVE_DISPOSITIVO);
        if (!uuid) {
          uuid = Crypto.randomUUID();
          await AsyncStorage.setItem(CLAVE_DISPOSITIVO, uuid);
        }

        // 2. Obtener info del dispositivo (igual que AuthMobile original)
        const modelo = Device.modelName || Device.deviceName || null;
        const sistemaOperativo = Device.osVersion
          ? `${Device.osName} ${Device.osVersion}`
          : Device.osName || null;

        if (mounted) {
          setInfo({
            dispositivoId: uuid,
            modelo: modelo,
            sistemaOperativo: sistemaOperativo,
            cargando: false,
          });
        }
      } catch (error) {
        console.warn('Error al obtener info del dispositivo:', error);
        if (mounted) {
          setInfo({
            dispositivoId: null,
            modelo: Platform.OS === 'ios' ? 'iPhone' : 'Android',
            sistemaOperativo: Platform.OS,
            cargando: false,
          });
        }
      }
    }

    inicializar();

    return () => {
      mounted = false;
    };
  }, []);

  return info;
}
