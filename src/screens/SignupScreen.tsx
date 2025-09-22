import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Animated,
} from 'react-native';
import { useAppDispatch } from '../store/hooks';
import {
  clearError,
  clearMessage,
  signUpUser,
} from '../store/slices/authSlice';
import { colors } from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';

type SignupScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Signup'
>;

type Props = {
  navigation: SignupScreenNavigationProp;
};

export default function SignupScreen({ navigation }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();

  const theme = isDarkMode ? colors.dark : colors.light;
  const styles = createStyles(theme);

  const handleSignup = async () => {
    if (!username.trim()) {
      dispatch(clearMessage());
      dispatch(clearError());
      dispatch({ type: 'auth/setError', payload: 'Username cannot be empty' });
      return;
    }
    if (!email.trim() || !password.trim()) {
      dispatch(clearMessage());
      dispatch(clearError());
      dispatch({
        type: 'auth/setError',
        payload: 'Email and Password cannot be empty',
      });
      return;
    }

    try {
      await dispatch(signUpUser({ email, password, username })).unwrap();
    } catch (error: any) {}
  };

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={['#7b6cdfff', '#6659b4ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <BlurView
          style={styles.absolute}
          blurType={isDarkMode ? 'dark' : 'light'}
          blurAmount={90}
          reducedTransparencyFallbackColor={theme.background}
        />

        {/* main card */}
        <View style={styles.formWrapper}>
          <Animated.View style={styles.titleContainer}>
            <Text style={styles.spaceTitle}>Join Cosmic Focus</Text>
          </Animated.View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              keyboardType="email-address"
              style={styles.input}
              placeholder="Your email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignup}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signUpButtonGradient}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginRedirect}>
            <Text style={styles.alreadyAccountText}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.redirectText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (theme: typeof colors.light | typeof colors.dark) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      flex: 1,
      backgroundColor: theme.background,
    },

    gradientBackground: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    absolute: {
      ...StyleSheet.absoluteFillObject,
    },

    spaceTitle: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.primary,
      textAlign: 'center',
    },

    titleContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },

    formWrapper: {
      width: '100%',
      height: '100%',
      // alignItems: 'center',
      justifyContent: 'center',
      maxWidth: 400,
      minWidth: 300,
      backgroundColor: theme.background,
      paddingHorizontal: 24,
      paddingVertical: 30,
      boxShadow: `0 4px 6px ${theme.text}40`,
      borderRadius: 12,
    },
    inputContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      paddingLeft: 48,
      fontSize: 15,
      color: theme.text,
      elevation: 1,
    },
    passwordInput: {
      paddingRight: 48,
    },
    inputIcon: {
      position: 'absolute',
      left: 16,
      top: 17,
      zIndex: 1,
    },
    eyeIcon: {
      position: 'absolute',
      right: 16,
      top: 14,
      padding: 4,
      zIndex: 1,
    },

    signUpButton: {
      borderRadius: 12,
      marginTop: 8,
      marginBottom: 30,
      elevation: 5,
    },
    signUpButtonGradient: {
      paddingVertical: 16,
      paddingHorizontal: 30,
      borderRadius: 12,
      alignItems: 'center',
    },
    signUpButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    loginRedirect: {
      alignItems: 'center',
    },
    alreadyAccountText: {
      color: theme.textSecondary,
      fontSize: 14,
      marginBottom: 4,
    },
    redirectText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });
