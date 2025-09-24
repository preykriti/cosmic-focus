import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import { MainStackParamList } from '../types/navigation';
import PomodoroScreen from '../screens/PomodoroScreen';
import { LobbyScreen } from '../components/groupSession/LobbyScreen';
const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
      <Stack.Screen name="Lobby" component={LobbyScreen} />
    </Stack.Navigator>
  );
}
