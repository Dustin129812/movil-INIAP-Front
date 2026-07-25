import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

interface InfoDispositivo {
  esIOS: boolean;
  esAndroid: boolean;
  nombreDispositivo: string;
  modelo: string | null;
  sistemaOperativo: string | null;
  versionSistema: string | null;
  soportaDynamicIsland: boolean;
  cargando: boolean;
}

export function useDeviceInfo(): InfoDispositivo {
  const esIOS = Platform.OS === 'ios';
  const esAndroid = Platform.OS === 'android';

  const [info, setInfo] = useState<InfoDispositivo>({
    esIOS,
    esAndroid,
    nombreDispositivo: 'Cargando...',
    modelo: null,
    sistemaOperativo: esIOS ? 'iOS' : 'Android',
    versionSistema: null,
    soportaDynamicIsland: false,
    cargando: true,
  });

  useEffect(() => {
    try {
      const nombreDispositivo = Device.deviceName || (esIOS ? 'iPhone' : 'Android');
      const modelo = Device.modelName || null;
      const versionSistema = Device.osVersion || null;

      let soportaDynamicIsland = false;
      if (esIOS && versionSistema) {
        const versionNum = parseFloat(versionSistema);
        soportaDynamicIsland = versionNum >= 16.1;
      }

      setInfo({
        esIOS,
        esAndroid,
        nombreDispositivo,
        modelo,
        sistemaOperativo: esIOS ? 'iOS' : 'Android',
        versionSistema,
        soportaDynamicIsland,
        cargando: false,
      });
    } catch (error) {
      console.warn('Error obteniendo info del dispositivo:', error);
      setInfo(prev => ({
        ...prev,
        nombreDispositivo: esIOS ? 'iPhone' : 'Android',
        cargando: false,
      }));
    }
  }, [esIOS, esAndroid]);

  return info;
}
