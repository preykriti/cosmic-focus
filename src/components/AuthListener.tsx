import { useEffect } from "react";
import { Text, View } from "react-native";
import { FirebaseAuthTypes, onAuthStateChanged } from "@react-native-firebase/auth";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser, setInitializing } from "../store/slices/authSlice";
import * as usersService from '../firebase/firestore/users';
import { backgroundInviteListener } from "../services/backgroundInviteListener";

const AuthListener = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { initializing } = useAppSelector((state) => state.auth);

 useEffect(() => {
  const app = getApp();
  const auth = getAuth(app);

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await usersService.getUserProfile(firebaseUser.uid);

      if (profile) {
        dispatch(setUser(profile));
      } else {
        dispatch(setUser(null)); 
      }
    } else {
      dispatch(setUser(null));
      backgroundInviteListener.stopListening();
    }

    dispatch(setInitializing(false));
  });

  return unsubscribe;
}, [dispatch]);


  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthListener;