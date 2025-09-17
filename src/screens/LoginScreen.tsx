import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { globalStyles } from '../styles/global';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { StarBackground } from '../components/StarBackground';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

type Props = {
  navigation: LoginScreenNavigationProp;
};


export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));
  const { login } = useAuth();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert('Login successful');
    } catch (error: any) {
      Alert.alert('Access Denied', error.message);
    }
  };

  return (
    <View style={[globalStyles.container, styles.spaceContainer]}>
      {/* stars background*/}
      <StarBackground count={60} />

      <View style={styles.loginContainer}>
        {/* title */}
        <Animated.View
          style={[styles.titleContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.spaceTitle}>Cosmic Focus</Text>
        </Animated.View>

        <View style={styles.holographicPanel}>
          <View style={styles.panelBorder}>
            {/* inputs*/}
            <View style={styles.inputContainer}>
              <TextInput
                keyboardType="email-address"
                style={styles.spaceInput}
                placeholder="Your email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={colors.placeholderPrimary}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.spaceInput}
                placeholder="Your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.placeholderSecondary}
              />
            </View>

            {/* login button*/}
            <TouchableOpacity
              style={styles.spaceButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.spaceButtonText}>Login</Text>
            </TouchableOpacity>

            <Pressable
              onPress={() => navigation.navigate('Signup')}
              style={styles.signupContainer}
            >
              <Text style={styles.signupText}>Go to signup</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spaceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.backgroundDark,
  },

  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: colors.star,
    borderRadius: 1,
    opacity: 0.8,
  },

  loginContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },

  spaceTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    textShadowColor: colors.textShadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  holographicPanel: {
    width: '100%',
    backgroundColor: colors.panelBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 30,
    boxShadow: `
      0 0 18px ${colors.borderAccent}, 
      0 0 30px rgba(138, 43, 226, 0.4), 
      inset 0 0 8px ${colors.borderAccent},
      inset 0 0 15px rgba(138, 43, 226, 0.3)
    `,
  },

  panelBorder: {
    position: 'relative',
  },

  inputContainer: {
    marginBottom: 25,
    position: 'relative',
  },

  spaceInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.textPrimary,
    width: '100%',
    fontFamily: 'monospace',
    boxShadow: `0 0 6px ${colors.borderAccent}`,
  },

  spaceButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: colors.buttonBackground,
    boxShadow: `
      0 0 10px ${colors.borderAccent},
      0 0 20px rgba(138, 43, 226, 0.4)
    `,
  },

  spaceButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: colors.textShadowDark,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  signupContainer: {
    marginTop: 25,
    alignItems: 'center',
  },

  signupText: {
    color: colors.textAccent,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
