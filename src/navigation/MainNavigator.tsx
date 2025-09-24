import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import { MainStackParamList } from '../types/navigation';
import PomodoroScreen from '../screens/PomodoroScreen';
import { LobbyScreen } from '../components/groupSession/LobbyScreen';
import FeedScreen from '../screens/FeedScreen';
import ShopScreen from '../screens/ShopScreen';
const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} />
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
    </Stack.Navigator>
  );
}
