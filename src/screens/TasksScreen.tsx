import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { globalStyles } from '../styles/global'
import { StarBackground } from '../components/StarBackground'

export default function TasksScreen() {
  return (
    <View style={globalStyles.container}>
      <StarBackground count={60} />
    </View>
  )
}

const styles = StyleSheet.create({
    spaceContainer: {
    flex: 1,
  },
})