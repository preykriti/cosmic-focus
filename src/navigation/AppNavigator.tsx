import { useAppSelector } from '../store/hooks';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function AppNavigator() {
  const { user } = useAppSelector(state => state.auth);

  return user ? <MainNavigator /> : <AuthNavigator />;
}
