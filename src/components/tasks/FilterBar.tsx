import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../constants/colors';

type FilterBarProps = {
  selected: string;
  onSelect: (tag: string) => void;
};

const filters = ['all', 'study', 'work', 'sleep', 'other'];

export default function FilterBar({ selected, onSelect }: FilterBarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filter, selected === f && styles.active]}
            onPress={() => onSelect(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.text, selected === f && styles.activeText]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 4,
  },
  filter: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  active: {
    backgroundColor: `${colors.light.primary}15`,
    borderColor: colors.light.primary,
  },
  text: {
    color: colors.light.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: 14,
  },
  activeText: {
    color: colors.light.primary,
  },
});
