import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";
import HomeScreen from "../screens/HomeScreen";
import FriendsScreen from "../screens/FriendsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportScreen from "../screens/ReportScreen";
import { colors } from "../constants/colors";

export type TabParamList = {
  Home: undefined;
  Friends: undefined;
  Report: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.textAccent,
        tabBarStyle: {
          backgroundColor: colors.panelBackground,
          borderTopWidth: 0,
          position: "absolute",
          paddingBottom: 10,
          boxShadow: "0 4px 10px rgba(51, 180, 255, 0.3)",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "ellipse";

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Friends":
              iconName = "people";
              break;
            case "Profile":
              iconName = "person";
              break;
            case "Report":
              iconName = "bar-chart";
              break;
          }

          return <Ionicons name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
