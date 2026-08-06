import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_UUID_KEY = 'device_uuid';

// Mapeo de identificadores de modelo Apple a nombres comerciales
const APPLE_MODEL_MAP = {
  // iPhone
  'iPhone14,4': 'iPhone 13 mini',
  'iPhone14,5': 'iPhone 13',
  'iPhone14,2': 'iPhone 13 Pro',
  'iPhone14,3': 'iPhone 13 Pro Max',
  'iPhone14,7': 'iPhone 14',
  'iPhone14,8': 'iPhone 14 Plus',
  'iPhone15,2': 'iPhone 14 Pro',
  'iPhone15,3': 'iPhone 14 Pro Max',
  'iPhone15,4': 'iPhone 15',
  'iPhone15,5': 'iPhone 15 Plus',
  'iPhone16,1': 'iPhone 15 Pro',
  'iPhone16,2': 'iPhone 15 Pro Max',
  'iPhone17,1': 'iPhone 16 Pro',
  'iPhone17,2': 'iPhone 16 Pro Max',
  'iPhone17,3': 'iPhone 16',
  'iPhone17,4': 'iPhone 16 Plus',
  'iPhone13,1': 'iPhone 12 mini',
  'iPhone13,2': 'iPhone 12',
  'iPhone13,3': 'iPhone 12 Pro',
  'iPhone13,4': 'iPhone 12 Pro Max',
  'iPhone12,8': 'iPhone SE (2da generación)',
  'iPhone12,1': 'iPhone 11',
  'iPhone12,3': 'iPhone 11 Pro',
  'iPhone12,5': 'iPhone 11 Pro Max',
  'iPhone11,8': 'iPhone XR',
  'iPhone11,2': 'iPhone XS',
  'iPhone11,4': 'iPhone XS Max',
  'iPhone11,6': 'iPhone XS Max',
  'iPhone10,3': 'iPhone X',
  'iPhone10,6': 'iPhone X',
  'iPhone10,1': 'iPhone 8',
  'iPhone10,4': 'iPhone 8',
  'iPhone10,2': 'iPhone 8 Plus',
  'iPhone10,5': 'iPhone 8 Plus',
  'iPhone9,1': 'iPhone 7',
  'iPhone9,3': 'iPhone 7',
  'iPhone9,2': 'iPhone 7 Plus',
  'iPhone9,4': 'iPhone 7 Plus',
  'iPhone8,1': 'iPhone 6s',
  'iPhone8,2': 'iPhone 6s Plus',
  'iPhone8,4': 'iPhone SE (1ra generación)',
  // iPad
  'iPad13,1': 'iPad Air (4ta generación)',
  'iPad13,2': 'iPad Air (4ta generación)',
  'iPad13,16': 'iPad Air (5ta generación)',
  'iPad13,17': 'iPad Air (5ta generación)',
  'iPad14,3': 'iPad Pro 11" (4ta generación)',
  'iPad14,4': 'iPad Pro 11" (4ta generación)',
  'iPad14,5': 'iPad Pro 12.9" (6ta generación)',
  'iPad14,6': 'iPad Pro 12.9" (6ta generación)',
  'iPad11,6': 'iPad (8va generación)',
  'iPad11,7': 'iPad (8va generación)',
  'iPad12,1': 'iPad (9na generación)',
  'iPad12,2': 'iPad (9na generación)',
  // iPod
  'iPod9,1': 'iPod touch (7ma generación)',
};

// Mapeo de identificadores de modelo Android a nombres comerciales
const ANDROID_MODEL_MAP = {
  //通用 Android 设备名称映射可以根据需要添加
};

// Función para obtener el nombre comercial del dispositivo
function getDeviceMarketingName(modelId, brand, deviceName) {
  // Si el usuario tiene un nombre personalizado, usarlo
  if (deviceName && deviceName.trim()) {
    return deviceName;
  }

  // Si es Apple, buscar en el mapa
  if (brand?.toLowerCase() === 'apple' && modelId) {
    return APPLE_MODEL_MAP[modelId] || modelId;
  }

  // Si es Android, usar modelId como fallback
  if (modelId) {
    return ANDROID_MODEL_MAP[modelId] || modelId;
  }

  return 'Desconocido';
}

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    uuid: null,
    nombreDispositivo: null,
    modelo: null,
    sistemaOperativo: null,
    versionSistema: null,
    hardware: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getDeviceInfo() {
      try {
        // Obtener o generar UUID persistente
        let uuid = await AsyncStorage.getItem(DEVICE_UUID_KEY);
        if (!uuid) {
          uuid = Crypto.randomUUID();
          await AsyncStorage.setItem(DEVICE_UUID_KEY, uuid);
        }

        // Obtener información del dispositivo
        const marca = Device.brand || 'Apple';
        const modelId = Device.modelId || null;
        const sistemaOperativo = Device.platformApiLevel
          ? 'Android'
          : Device.osVersion?.includes('iOS') ? 'iOS' : Device.osVersion || ' móvil';
        const versionSistema = Device.platformApiLevel
          ? Device.platformApiLevel.toString()
          : Device.osVersion?.replace('iOS ', '') || '';

        // Usar la función de mapeo para obtener el nombre comercial
        const modelo = getDeviceMarketingName(modelId, marca, Device.deviceName);

        // Hardware
        const hardware = Device.productId || modelo;
        // Nombre completo del dispositivo
        const nombreDispositivo = modelo;

        setDeviceInfo({
          uuid,
          nombreDispositivo,
          modelo,
          sistemaOperativo,
          versionSistema,
          hardware,
        });
      } catch (error) {
        console.error('Error obteniendo información del dispositivo');
        // Valores por defecto en caso de error
        const uuid = Crypto.randomUUID();
        setDeviceInfo({
          uuid,
          nombreDispositivo: 'Dispositivo',
          modelo: 'Desconocido',
          sistemaOperativo: ' móvil',
          versionSistema: '',
          hardware: ' móvil',
        });
      } finally {
        setIsLoading(false);
      }
    }

    getDeviceInfo();
  }, []);

  return { deviceInfo, isLoading };
}
