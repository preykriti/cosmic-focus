import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportScreen from '../screens/ReportScreen';
import TasksScreen from '../screens/TasksScreen';
import { colors } from '../constants/colors';
import { TabParamList } from '../types/navigation';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const [theme] = useState<'light' | 'dark'>('light');
  const themeColors = colors[theme];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
          position: 'absolute',
          padding: 5,
          height: 55,
          elevation: 4,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: IconName = 'ellipse';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Friends':
              iconName = 'people';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Report':
              iconName = 'bar-chart';
              break;
            case 'Tasks':
              iconName = 'checkmark-done-circle';
              break;
          }

          return <Ionicons name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
     
    </Tab.Navigator>
  );
}
