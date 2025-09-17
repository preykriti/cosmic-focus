import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { FirebaseAuthTypes, onAuthStateChanged } from "@react-native-firebase/auth";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import * as authService from "../services/auth";

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  const app = getApp();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
  };

  const logout = async () => {
    await authService.logout();
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
