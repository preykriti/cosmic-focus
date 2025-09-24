import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';
import { colors } from '../../constants/colors';

export interface EmptyStateProps {
  type: 'loading' | 'error' | 'empty' | 'search-empty';
  message?: string;
  error?: string;
  searchQuery?: string;
  onRetry?: () => void;
}

export default function EmptyState({
  type,
  message,
  error,
  searchQuery,
  onRetry,
}: EmptyStateProps) {
  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <>
            <ActivityIndicator size="large" color={colors.light.primary} />
            <Text style={styles.emptyStateText}>{message || 'Loading...'}</Text>
          </>
        );
      case 'error':
        return (
          <>
            <Ionicon
              name="alert-circle-outline"
              size={48}
              color={colors.light.error}
            />
            <Text
              style={[styles.emptyStateText, { color: colors.light.error }]}
            >
              {error || 'An error occurred'}
            </Text>
            {onRetry && (
              <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </>
        );
      case 'search-empty':
        return (
          <>
            <Ionicon name="person-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>
              No users found with username "{searchQuery}"
            </Text>
          </>
        );
      default:
        return (
          <>
            <Ionicon name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyStateText}>{message}</Text>
          </>
        );
    }
  };

  return <View style={styles.emptyState}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
