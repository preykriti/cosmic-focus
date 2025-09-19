import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportScreen from '../screens/ReportScreen';
import { colors } from '../constants/colors';
import TasksScreen from '../screens/TasksScreen';
import { TabParamList } from '../types/navigation';
import PomodoroScreen from '../screens/PomodoroScreen';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#93a6daff",
        tabBarStyle: {
          backgroundColor: 'rgba(10, 25, 60, 1)',
          borderTopWidth: 0,
          position: 'absolute',
          padding: 5,
          height: 50,
          boxShadow: '0 4px 10px rgba(51, 180, 255, 0.3)',
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
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
    </Tab.Navigator>
  );
}
