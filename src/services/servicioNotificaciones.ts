import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

// Desde el SDK 53 de Expo, expo-notifications ya no funciona en Expo Go para
// Android (solo en development builds): el simple hecho de importar el
// paquete lanza un error ahí. Por eso NO se importa de forma estática arriba:
// se carga de forma diferida y solo cuando sabemos que sí es compatible.
let notificacionesConfiguradas = false;

async function cargarNotifications() {
  const Notifications = await import('expo-notifications');
  if (!notificacionesConfiguradas) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificacionesConfiguradas = true;
  }
  return Notifications;
}

// En Expo Go, Android no soporta expo-notifications (hace falta development
// build); iOS y web sí lo soportan dentro de Expo Go.
function soportadoEnEsteEntorno(): boolean {
  return !(isRunningInExpoGo() && Platform.OS === 'android');
}

export const servicioNotificaciones = {
  async solicitarPermiso(): Promise<boolean> {
    if (!soportadoEnEsteEntorno()) return false;

    const Notifications = await cargarNotifications();
    const { status: estadoActual } = await Notifications.getPermissionsAsync();
    let estadoFinal = estadoActual;

    if (estadoActual !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      estadoFinal = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    return estadoFinal === 'granted';
  },

  async programarNotificacionPrueba() {
    if (!soportadoEnEsteEntorno()) return;

    const Notifications = await cargarNotifications();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ATRIO',
        body: 'Las notificaciones están activadas. Te avisaremos sobre tus pedidos.',
      },
      trigger: null,
    });
  },

  async cancelarTodas() {
    if (!soportadoEnEsteEntorno()) return;

    const Notifications = await cargarNotifications();
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
