import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import { Provider } from 'react-redux';
import AuthListener from './src/components/AuthListener';
import Toast from './src/components/Toast';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AuthListener>
          <NavigationContainer>
            <AppNavigator />
            <Toast/>
          </NavigationContainer>
        </AuthListener>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
