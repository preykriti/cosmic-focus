import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

export default function AppNavigator() {
  const { user } = useAuth();

  return user ? <MainNavigator /> : <AuthNavigator />;
}