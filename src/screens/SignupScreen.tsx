import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { globalStyles } from '../styles/global';
import { useAuth } from '../context/AuthContext';
import { StarBackground } from '../components/StarBackground';


export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth();

  const [pulseAnim] = useState(new Animated.Value(1));

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

  const handleSignup = async () => {
    try {
      await signUp(email, password);
      Alert.alert('Signup successful');
    } catch (error: any) {
      Alert.alert('Signup failed', error.message);
    }
  };

  return (
    <View style={[globalStyles.container, styles.spaceContainer]}>
      <StarBackground count={60} />

      <View style={styles.signupContainer}>
        <Animated.View
          style={[styles.titleContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.spaceTitle}>Join Cosmic Focus</Text>
        </Animated.View>

        <View style={styles.holographicPanel}>
          <View style={styles.panelBorder}>
            {/* inputs */}
            <View style={styles.inputContainer}>
              <TextInput
                keyboardType="email-address"
                style={styles.spaceInput}
                placeholder="Your email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="rgba(100, 200, 255, 0.67)"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.spaceInput}
                placeholder="Your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="rgba(100, 200, 255, 0.67)"
              />
            </View>

            {/* signup button */}
            <TouchableOpacity
              style={styles.spaceButton}
              onPress={handleSignup}
              activeOpacity={0.8}
            >
              <Text style={styles.spaceButtonText}>Signup</Text>
            </TouchableOpacity>

            <Pressable
              onPress={() => navigation.navigate('Login')}
              style={styles.loginRedirect}
            >
              <Text style={styles.redirectText}>Go to Login</Text>
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
    backgroundColor: '#111633',
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
    backgroundColor: 'white',
    borderRadius: 1,
    opacity: 0.8,
  },

  signupContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  spaceTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: '#64c8ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  holographicPanel: {
    width: '100%',
    backgroundColor: 'rgba(10, 25, 60, 0.55)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.6)',
    padding: 30,
    boxShadow: `
      0 0 18px rgba(0, 212, 255, 0.6), 
      0 0 30px rgba(138, 43, 226, 0.4), 
      inset 0 0 8px rgba(0, 212, 255, 0.5),
      inset 0 0 15px rgba(138, 43, 226, 0.3)
    `,
  },

  panelBorder: {
    position: 'relative',
  },

  inputContainer: {
    marginBottom: 25,
  },

  spaceInput: {
    backgroundColor: 'rgba(15, 40, 90, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(100, 200, 255, 0.4)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
    width: '100%',
    fontFamily: 'monospace',
    boxShadow: '0 0 6px rgba(0, 212, 255, 0.3)',
  },

  spaceButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 140, 180, 0.8)',
    boxShadow: `
      0 0 10px rgba(0, 212, 255, 0.7),
      0 0 20px rgba(138, 43, 226, 0.4)
    `,
  },

  spaceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  loginRedirect: {
    marginTop: 25,
    alignItems: 'center',
  },

  redirectText: {
    color: '#64c8ff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
