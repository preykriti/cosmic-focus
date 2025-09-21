import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  count: number;
  countLabel?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  countLabel = 'items',
}) => {
  return (
    <View style={styles.friendsHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.friendsCount}>
        {count} {countLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  friendsCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});
