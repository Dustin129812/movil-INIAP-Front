import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const esExpoGo = Constants.appOwnership === 'expo';

export interface Notificacion {
  titulo: string;
  cuerpo: string;
  datos?: Record<string, unknown>;
}

class ServicioNotificaciones {
  private esIOS = Platform.OS === 'ios';
  private esAndroid = Platform.OS === 'android';
  private Notifications: any = null;

  private async obtenerModulo() {
    if (esExpoGo) return null;
    if (!this.Notifications) {
      const mod = await import('expo-notifications');
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      this.Notifications = mod;
    }
    return this.Notifications;
  }

  async configurar(): Promise<void> {
    try {
      if (esExpoGo) {
        console.log('Notificaciones no disponibles en Expo Go (SDK 53+)');
        return;
      }

      const Notifications = await this.obtenerModulo();
      if (!Notifications) return;

      if (Device.isDevice) {
        const permisos = await Notifications.getPermissionsAsync() as any;

        if (permisos.status !== 'granted') {
          const nuevosPermisos = await Notifications.requestPermissionsAsync() as any;

          if (nuevosPermisos.status !== 'granted') {
            console.log('Permisos de notificaciones no otorgados');
            return;
          }
        }

        if (this.esAndroid) {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'General',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2E7D32',
          });
        }
      }
    } catch (error) {
      console.log('Notificaciones no disponibles en Expo Go:', error);
    }
  }

  async mostrarNotificacion(notification: Notificacion): Promise<void> {
    if (esExpoGo) return;
    const Notifications = await this.obtenerModulo();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.titulo,
        body: notification.cuerpo,
        data: notification.datos,
        sound: true,
      },
      trigger: null,
    });
  }

  async mostrarBienvenida(nombreUsuario: string): Promise<void> {
    const esIOS = Platform.OS === 'ios';

    await this.mostrarNotificacion({
      titulo: esIOS ? '🎉' : 'Bienvenido',
      cuerpo: esIOS
        ? `${nombreUsuario}, session iniciada correctamente`
        : `Hola ${nombreUsuario}, sesión iniciada correctamente`,
    });
  }

  async mostrarErrorLogin(): Promise<void> {
    await this.mostrarNotificacion({
      titulo: '❌ Error',
      cuerpo: 'Credenciales incorrectas. Intenta de nuevo.',
    });
  }

  async mostrarRegistroExitoso(): Promise<void> {
    await this.mostrarNotificacion({
      titulo: '✅ Registro exitoso',
      cuerpo: 'Tu cuenta ha sido creada correctamente.',
    });
  }

  async mostrarCerrarSesion(): Promise<void> {
    await this.mostrarNotificacion({
      titulo: '👋 Sesión cerrada',
      cuerpo: 'Hasta pronto. Tu sesión ha sido cerrada.',
    });
  }

  async agregarListenerNotificacion(callback: (notification: any) => void): Promise<any> {
    if (esExpoGo) return { remove: () => {} };
    const Notifications = await this.obtenerModulo();
    if (!Notifications) return { remove: () => {} };
    return Notifications.addNotificationReceivedListener(callback);
  }

  async agregarListenerRespuesta(callback: (response: any) => void): Promise<any> {
    if (esExpoGo) return { remove: () => {} };
    const Notifications = await this.obtenerModulo();
    if (!Notifications) return { remove: () => {} };
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const servicioNotificaciones = new ServicioNotificaciones();