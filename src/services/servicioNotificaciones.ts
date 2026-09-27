import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const servicioNotificaciones = {
  async solicitarPermiso(): Promise<boolean> {
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ATRIO',
        body: 'Las notificaciones están activadas. Te avisaremos sobre tus pedidos.',
      },
      trigger: null, 
    });
  },

  async cancelarTodas() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};