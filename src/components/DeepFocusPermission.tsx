import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  NativeModules,
  AppState,
} from 'react-native';

const { DeepFocusModule } = NativeModules;

const DeepFocusPermission = ({ isDeepFocusEnabled, setIsDeepFocusEnabled }) => {
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [hasOverlayPermission, setHasOverlayPermission] = useState(false);
  const [hasBatteryOptimization, setHasBatteryOptimization] = useState(false);

  useEffect(() => {
    checkPermissions();

    // listen for app state changes
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'background' && isDeepFocusEnabled) {
        DeepFocusModule?.onAppBackground();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, [isDeepFocusEnabled]);

  const checkPermissions = async () => {
    try {
      const usageAccess = await DeepFocusModule?.hasUsageStatsPermission();
      setHasUsageAccess(usageAccess || false);

      const overlayPermission = await DeepFocusModule?.canDrawOverlays();
      setHasOverlayPermission(overlayPermission || false);

      const batteryOptimization =
        await DeepFocusModule?.isBatteryOptimizationIgnored();
      setHasBatteryOptimization(batteryOptimization || false);
    } catch (error) {
      console.log('Error checking permissions:', error);
    }
  };

  const requestUsageAccess = async () => {
    try {
      const granted = await DeepFocusModule?.requestUsageStatsPermission();
      if (granted) {
        setHasUsageAccess(true);
        Alert.alert('Success', 'Usage access granted!');
      } else {
        Alert.alert(
          'Error',
          'Usage access denied. Please enable it in Settings.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request usage access permission');
    }
  };

  const requestOverlayPermission = async () => {
    try {
      const granted = await DeepFocusModule?.requestOverlayPermission();
      if (granted) {
        setHasOverlayPermission(true);
        Alert.alert('Success', 'Overlay permission granted!');
      } else {
        Alert.alert(
          'Error',
          'Overlay permission denied. Please enable it in Settings.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request overlay permission');
    }
  };

  const requestBatteryOptimization = async () => {
    try {
      const granted = await DeepFocusModule?.requestIgnoreBatteryOptimization();
      if (granted) {
        setHasBatteryOptimization(true);
        Alert.alert('Success', 'Battery optimization disabled!');
      } else {
        Alert.alert('Error', 'Battery optimization settings not changed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request battery optimization settings');
    }
  };

  const toggleDeepFocus = async value => {
    if (value) {
      if (!hasUsageAccess || !hasOverlayPermission || !hasBatteryOptimization) {
        Alert.alert(
          'Permissions Required',
          'Please grant all required permissions before enabling Deep Focus mode.',
        );
        return;
      }

      try {
        await DeepFocusModule?.startDeepFocus();
        setIsDeepFocusEnabled(true);
        Alert.alert('Deep Focus Enabled', 'Focus mode is now active!');
      } catch (error) {
        Alert.alert('Error', 'Failed to start deep focus mode');
      }
    } else {
      try {
        await DeepFocusModule?.stopDeepFocus();
        setIsDeepFocusEnabled(false);
        Alert.alert('Deep Focus Disabled', 'Focus mode is now inactive.');
      } catch (error) {
        Alert.alert('Error', 'Failed to stop deep focus mode');
      }
    }
  };

  const allPermissionsGranted =
    hasUsageAccess && hasOverlayPermission && hasBatteryOptimization;

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Deep Focus Mode</Text>
        <Switch
          value={isDeepFocusEnabled}
          onValueChange={toggleDeepFocus}
          disabled={!allPermissionsGranted}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>

      <View style={styles.permissionsContainer}>
        <Text style={styles.permissionsTitle}>Required Permissions:</Text>

        {/* usage permission */}
        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>Usage Access: </Text>
          {hasUsageAccess ? (
            <Ionicons name="checkmark-circle" size={20} color="green" />
          ) : (
            <Ionicons name="close-circle" size={20} color="red" />
          )}
          {!hasUsageAccess && (
            <Text style={styles.permissionButton} onPress={requestUsageAccess}>
              Grant Permission
            </Text>
          )}
        </View>

        {/* overlay permission */}
        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>Display Over Apps: </Text>
          {hasOverlayPermission ? (
            <Ionicons name="checkmark-circle" size={20} color="green" />
          ) : (
            <Ionicons name="close-circle" size={20} color="red" />
          )}
          {!hasOverlayPermission && (
            <Text
              style={styles.permissionButton}
              onPress={requestOverlayPermission}
            >
              Grant Permission
            </Text>
          )}
        </View>

        {/* Battery Optimization */}
        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>Battery Optimization: </Text>
          {hasBatteryOptimization ? (
            <Ionicons name="checkmark-circle" size={20} color="green" />
          ) : (
            <Ionicons name="close-circle" size={20} color="red" />
          )}
          {!hasBatteryOptimization && (
            <Text
              style={styles.permissionButton}
              onPress={requestBatteryOptimization}
            >
              Disable Optimization
            </Text>
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isDeepFocusEnabled ? 'Active' : 'Inactive'}
        </Text>
        {!allPermissionsGranted && (
          <Text style={styles.warningText}>
            Grant all permissions to enable Deep Focus mode
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: 'white',
    padding: 4,
    paddingTop: 18,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 10,
    marginBottom: 18,
    elevation: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  permissionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
  },
  permissionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  permissionText: {
    fontSize: 16,
    flex: 1,
  },
  permissionButton: {
    color: '#044283ff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 18,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FF6B6B',
    marginTop: 10,
  },
});

export default DeepFocusPermission;
