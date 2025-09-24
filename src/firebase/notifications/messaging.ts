import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { displayNotification } from './notificationHandler';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted.');
  }
  return enabled;
}

export async function getFcmToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (err) {
    console.error('Error getting FCM token', err);
    return null;
  }
}

// function for group invites
export async function showGroupInviteNotification(
  groupName: string,
  groupId: string,
) {
  await displayNotification(
    'Group Session Invite',
    `Join ${groupName} session`,
    { groupId, screen: 'Lobby' },
  );
}
