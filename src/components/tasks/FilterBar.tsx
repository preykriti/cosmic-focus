import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

type FilterBarProps = {
  selected: string;
  onSelect: (tag: string) => void;
};

const filters = ['all', 'study', 'work', 'sleep','other'];

export default function FilterBar({ selected, onSelect }: FilterBarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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
    marginBottom: 20,
    paddingHorizontal: 10, 
  },
  container: {
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  filter: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    boxShadow: `
      0 0 6px rgba(255, 255, 255, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.06)
    `,
  },
  active: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: 'rgba(59, 130, 246, 0.7)',
    boxShadow: `
      0 0 10px rgba(59, 130, 246, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  },
  text: {
    color: '#cbd5e1',
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: 14,
  },
  activeText: {
    color: '#3b82f6',
    textShadowColor: 'rgba(59, 130, 246, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
