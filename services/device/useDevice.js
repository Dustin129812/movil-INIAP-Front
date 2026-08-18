import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const CLAVE_DISPOSITIVO = 'dispositivo_id';

export function useDevice() {
  const [info, setInfo] = useState({
    dispositivoId: null,
    modelo: null,
    sistemaOperativo: null,
    cargando: true,
  });

  useEffect(() => {
    let mounted = true;

    async function inicializar() {
      try {
        // Obtener o crear UUID
        let uuid = await AsyncStorage.getItem(CLAVE_DISPOSITIVO);
        if (!uuid) {
          uuid = Crypto.randomUUID();
          await AsyncStorage.setItem(CLAVE_DISPOSITIVO, uuid);
        }

        // Obtener info del dispositivo
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