import { Search, Filter } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WatchCard from '@/components/WatchCard';
import Colors from '@/constants/colors';
import { watchesDatabase } from '@/mocks/watches-database';
import { searchWatches } from '@/services/watch-matching';

const BRANDS = ['Todos', 'Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'TAG Heuer', 'Breitling', 'IWC', 'Grand Seiko', 'Jaeger-LeCoultre'];
const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até R$ 25.000', min: 0, max: 25000 },
  { label: 'R$ 25.000 - R$ 50.000', min: 25000, max: 50000 },
  { label: 'R$ 50.000 - R$ 100.000', min: 50000, max: 100000 },
  { label: 'Acima de R$ 100.000', min: 100000, max: Infinity },
];

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todos');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredWatches = useMemo(() => {
    let watches = searchQuery ? searchWatches(searchQuery) : watchesDatabase;

    if (selectedBrand !== 'Todos') {
      watches = watches.filter(watch => watch.brand === selectedBrand);
    }

    if (selectedPriceRange.label !== 'Todos') {
      watches = watches.filter(watch => {
        if (!watch.priceMin || !watch.priceMax) return false;
        return watch.priceMin >= selectedPriceRange.min && watch.priceMax <= selectedPriceRange.max;
      });
    }

    return watches;
  }, [searchQuery, selectedBrand, selectedPriceRange]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setSelectedBrand('Todos');
    setSelectedPriceRange(PRICE_RANGES[0]);
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Catálogo de Relógios</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar marca ou modelo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.gray[500]}
          />
        </View>
        <Pressable onPress={toggleFilters} style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Marca</Text>
            <View style={styles.filterOptions}>
              {BRANDS.map((brand) => (
                <Pressable
                  key={brand}
                  style={[
                    styles.filterOption,
                    selectedBrand === brand && styles.filterOptionSelected,
                  ]}
                  onPress={() => setSelectedBrand(brand)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedBrand === brand && styles.filterOptionTextSelected,
                    ]}
                  >
                    {brand}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Faixa de Preço</Text>
            <View style={styles.filterOptions}>
              {PRICE_RANGES.map((range) => (
                <Pressable
                  key={range.label}
                  style={[
                    styles.filterOption,
                    selectedPriceRange.label === range.label && styles.filterOptionSelected,
                  ]}
                  onPress={() => setSelectedPriceRange(range)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedPriceRange.label === range.label && styles.filterOptionTextSelected,
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredWatches.length} relógio{filteredWatches.length !== 1 ? 's' : ''} encontrado{filteredWatches.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredWatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WatchCard watch={item} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
  },
  filterOptionSelected: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterOptionTextSelected: {
    color: Colors.white,
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.gray[100],
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  listContent: {
    padding: 20,
  },
});