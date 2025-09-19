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

const filters = ['all', 'study', 'work', 'sleep', 'other'];

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
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  active: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  text: {
    color: '#475569',
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: 14,
  },
  activeText: {
    color: '#1e3a8a',
  },
});
