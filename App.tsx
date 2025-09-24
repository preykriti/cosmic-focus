import { StyleSheet } from 'react-native';
import React, { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import { Provider } from 'react-redux';
import AuthListener from './src/components/AuthListener';
import Toast from './src/components/Toast';
import {
  getFcmToken,
  requestUserPermission,
} from './src/firebase/notifications/messaging';
import {
  setupNotificationHandlers,
  setNavigationRef,
} from './src/firebase/notifications/notificationHandler';
import { updateUserFcmToken } from './src/firebase/firestore/users';
import messaging from '@react-native-firebase/messaging';

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
    requestUserPermission();
    setupNotificationHandlers();
    getFcmToken().then(async token => {
      const userId = store.getState().auth.user?.id;
      if (userId && token) {
        await updateUserFcmToken(userId, token);
      }
    });
    const unsubscribe = messaging().onTokenRefresh(async token => {
      const userId = store.getState().auth.user?.id;
      if (userId && token) {
        await updateUserFcmToken(userId, token);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AuthListener>
          <NavigationContainer
            ref={nav => {
              if (nav) setNavigationRef(nav);
            }}
          >
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </AuthListener>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
