import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser } from '../store/slices/authSlice';
import { colors } from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { getFcmToken } from '../firebase/notifications/messaging';
import { updateUserFcmToken } from '../firebase/firestore/users';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { error } = useAppSelector(state => state.auth);

  const theme = colors.light;
  const styles = createStyles(theme);

  const handleLogin = async () => {
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      const token = await getFcmToken();
      if(token && result?.user?.id) {
        await updateUserFcmToken(result.user.id, token);
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7b6cdfff', '#6659b4ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <BlurView
          style={styles.absolute}
          blurType="light"
          blurAmount={1}
          reducedTransparencyFallbackColor={theme.background}
        />

        {/* main card */}
        <View style={styles.formWrapper}>
          <Animated.View style={styles.titleContainer}>
            <Text style={styles.spaceTitle}>Welcome Back</Text>
          </Animated.View>

          {/* email */}
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

          {/* password */}
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

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && { opacity: 0.6 }]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.signupRedirect}>
            <Text style={styles.noAccountText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.redirectText}>Sign Up</Text>
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
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
      justifyContent: 'center',
      backgroundColor: theme.background,
      paddingHorizontal: 24,
      paddingVertical: 30,
      borderRadius: 12,
      boxShadow: `0 4px 6px ${theme.text}40`,
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
    loginButton: {
      borderRadius: 12,
      marginTop: 8,
      marginBottom: 30,
      elevation: 5,
    },
    loginButtonGradient: {
      paddingVertical: 16,
      paddingHorizontal: 30,
      borderRadius: 12,
      alignItems: 'center',
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    signupRedirect: {
      alignItems: 'center',
    },
    noAccountText: {
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
