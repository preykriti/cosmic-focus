import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import DeepFocusPermission from './src/components/DeepFocusPermission';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
