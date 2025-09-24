import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { NavigationContainerRef } from '@react-navigation/native';

let navigationRef: NavigationContainerRef<any> | null = null;

export function setNavigationRef(ref: NavigationContainerRef<any>) {
  navigationRef = ref;
}

export async function displayNotification(title: string, body: string, data?: any) {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
  });
}

export function setupNotificationHandlers() {
  // foreground
  messaging().onMessage(async remoteMessage => {
    if (remoteMessage.notification) {
      await displayNotification(
        remoteMessage.notification.title || 'New Notification',
        remoteMessage.notification.body || '',
        remoteMessage.data
      );
    }
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    if (remoteMessage.notification) {
      await displayNotification(
        remoteMessage.notification.title || 'New Notification',
        remoteMessage.notification.body || '',
        remoteMessage.data
      );
    }
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('App opened from background by notification:', remoteMessage);
    if (navigationRef && remoteMessage.data?.groupId) {
      navigationRef.navigate('Lobby', { groupId: remoteMessage.data.groupId });
    }
  });

  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('App opened from quit by notification:', remoteMessage);
      if (navigationRef && remoteMessage.data?.groupId) {
        navigationRef.navigate('Lobby', { groupId: remoteMessage.data.groupId });
      }
    }
  });

  notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification?.data?.sessionId) {
       console.log('Notification pressed, navigating to session:', detail.notification.data.sessionId);
      if (navigationRef) {
        navigationRef.navigate('Lobby', {
          sessionId: detail.notification.data.sessionId
        });
      }
    }
  });
  notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS && detail.notification?.data?.sessionId) {
    navigationRef?.navigate('Lobby', { sessionId: detail.notification.data.sessionId });
  }
});
}