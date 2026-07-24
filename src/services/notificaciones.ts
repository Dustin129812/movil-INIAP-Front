import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface Notificacion {
  titulo: string;
  cuerpo: string;
  datos?: Record<string, unknown>;
}

class ServicioNotificaciones {
  private esIOS = Platform.OS === 'ios';
  private esAndroid = Platform.OS === 'android';

  async configurar(): Promise<void> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permisos de notificaciones no otorgados');
        return;
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
  }

  async mostrarNotificacion(notification: Notificacion): Promise<void> {
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

  agregarListenerNotificacion(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  agregarListenerRespuesta(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const servicioNotificaciones = new ServicioNotificaciones();
