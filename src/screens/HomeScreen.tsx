import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import StarCanvas from '../components/home/StarCanvas';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MainTabs'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <>
      <StarCanvas />
      <View style={styles.icons}>
        {/* shop */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Shop')}
        >
          <Ionicons name="basket" size={28} color={colors.white} />
          <Text style={styles.iconLabel}>Shop</Text>
        </TouchableOpacity>

        {/* feed */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('Feed')}
        >
          <Ionicons name="albums" size={28} color={colors.white} />
          <Text style={styles.iconLabel}>Feed</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  icons: {
    position: 'absolute',
    zIndex: 100,
    right: 20,
    top: 60,
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconLabel: {
    color: colors.white,
    marginTop: 4,
    fontSize: 12,
  },
});
