import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { globalStyles } from '../styles/global'
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { logout } = useAuth();
  return (
    <View>
       <TouchableOpacity style={globalStyles.button} onPress={logout}>
        <Text style={globalStyles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({})