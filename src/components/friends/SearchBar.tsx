import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicon from '@react-native-vector-icons/ionicons';

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  loading: boolean;
}

export const SearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
}: SearchBarProps) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicon
        name="search-outline"
        size={18}
        color="#64748b"
        style={{ marginRight: 6 }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search friends and users"
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={onSearch}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Ionicon name="close-circle" size={18} color="#64748b" />
        </TouchableOpacity>
      )}
      {loading && searchQuery.length > 0 && (
        <ActivityIndicator
          size="small"
          color="#1e3a8a"
          style={{ marginLeft: 8 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 0,
  },
});
