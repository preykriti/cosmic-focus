import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface TabNavigatorProps {
  activeTab: 'friends' | 'requests';
  onTabChange: (tab: 'friends' | 'requests') => void;
  friendsCount: number;
  requestsCount: number;
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({
  activeTab,
  onTabChange,
  friendsCount,
  requestsCount,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
        onPress={() => onTabChange('friends')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'friends' && styles.activeTabText,
          ]}
        >
          Friends
        </Text>
        {/* {friendsCount > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{friendsCount}</Text>
          </View>
        )} */}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
        onPress={() => onTabChange('requests')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'requests' && styles.activeTabText,
          ]}
        >
          Requests
        </Text>
        {requestsCount > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{requestsCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  tabBadge: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: colors.light.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
});
