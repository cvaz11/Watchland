import { Search, Filter, ArrowLeft, Lightbulb, X, Camera, Sparkles } from 'lucide-react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Pressable, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import WatchCard from '@/components/WatchCard';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { watchesDatabase } from '@/mocks/watches-database';
import { searchWatches, searchWithAI } from '@/services/watch-matching';

const BRANDS = ['Todos', 'Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'TAG Heuer', 'Breitling', 'IWC', 'Grand Seiko', 'Jaeger-LeCoultre', 'Tissot'];
const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até R$ 25.000', min: 0, max: 25000 },
  { label: 'R$ 25.000 - R$ 50.000', min: 25000, max: 50000 },
  { label: 'R$ 50.000 - R$ 100.000', min: 50000, max: 100000 },
  { label: 'Acima de R$ 100.000', min: 100000, max: Infinity },
];

const SEARCH_EXAMPLES = [
  "tissot prx",
  "relógio dourado até R$ 10.000",
  "cronógrafo preto esportivo",
  "relógio clássico para trabalho",
  "mergulhador automático",
  "relógio para presente até R$ 5.000",
  "cronógrafo vintage italiano",
  "dress watch suíço dourado",
  "GMT para viagem profissional",
];

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todos');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isSearchingWithAI, setIsSearchingWithAI] = useState(false);
  const [searchResults, setSearchResults] = useState(watchesDatabase);

  const filteredWatches = useMemo(() => {
    let watches = searchResults;

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
  }, [searchResults, selectedBrand, selectedPriceRange]);

  // Auto-search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSmartSearch(searchQuery);
      } else {
        setSearchResults(watchesDatabase);
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setSelectedBrand('Todos');
    setSelectedPriceRange(PRICE_RANGES[0]);
    setSearchQuery('');
    setSearchResults(watchesDatabase);
  };

  const handleExamplePress = (example: string) => {
    setSearchQuery(example);
    setShowExamples(false);
  };

  const handleSmartSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(watchesDatabase);
      return;
    }
    
    setIsSearchingWithAI(true);
    try {
      // First try regular search
      const regularResults = searchWatches(query);
      
      // If we have good results, use them
      if (regularResults.length > 0) {
        setSearchResults(regularResults);
      } else {
        // Try AI search for better results
        const aiResults = await searchWithAI(query);
        setSearchResults(aiResults.length > 0 ? aiResults : regularResults);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      // Fallback to regular search
      const fallbackResults = searchWatches(query);
      setSearchResults(fallbackResults);
    } finally {
      setIsSearchingWithAI(false);
    }
  };

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const handleAISearch = () => {
    if (searchQuery.trim()) {
      handleSmartSearch(searchQuery);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Catálogo de Relógios</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ex: tissot prx, cronógrafo azul..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.gray[500]}
          />
          {isSearchingWithAI && (
            <Text style={styles.aiIndicator}>🤖</Text>
          )}
        </View>
        <Pressable onPress={() => setShowExamples(true)} style={styles.examplesButton}>
          <Lightbulb size={20} color={Colors.primary} />
        </Pressable>
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
        {searchQuery && (
          <Text style={styles.searchHint}>
            {isSearchingWithAI ? '🤖 Buscando com IA...' : 'Use linguagem natural: tissot prx, cronógrafo azul'}
          </Text>
        )}
      </View>

      <FlatList
        data={filteredWatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WatchCard watch={item} showRarity />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 }, // Extra space for fixed buttons
        ]}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />

      {/* Fixed bottom buttons */}
      <View style={[styles.fixedButtons, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title="🤖 Busca Inteligente"
          onPress={handleAISearch}
          variant="secondary"
          size="medium"
          icon={<Sparkles size={18} color={Colors.primary} />}
          disabled={!searchQuery.trim() || isSearchingWithAI}
          loading={isSearchingWithAI}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="📸 Identificar por Foto"
          onPress={handleCameraPress}
          variant="primary"
          size="medium"
          icon={<Camera size={18} color={Colors.white} />}
        />
      </View>

      <Modal
        visible={showExamples}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExamples(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exemplos de Busca</Text>
              <Pressable onPress={() => setShowExamples(false)} style={styles.modalCloseButton}>
                <X size={24} color={Colors.gray[600]} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Use linguagem natural para encontrar o relógio perfeito:
              </Text>
              
              {SEARCH_EXAMPLES.map((example, index) => (
                <Pressable
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => handleExamplePress(example)}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                </Pressable>
              ))}
              
              <View style={styles.modalTip}>
                <Text style={styles.tipTitle}>🤖 Dicas para busca com IA:</Text>
                <Text style={styles.tipText}>
                  • Mencione marca e modelo: "tissot prx"{'\n'}
                  • Inclua cor: "relógio preto", "mostrador azul"{'\n'}
                  • Especifique faixa de preço: "até R$ 10.000"{'\n'}
                  • Descreva o estilo: "esportivo", "clássico", "vintage"{'\n'}
                  • Mencione uso: "para trabalho", "mergulho", "viagem"
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },
  placeholder: {
    width: 40,
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
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  aiIndicator: {
    fontSize: 16,
    marginLeft: 8,
  },
  examplesButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
    marginBottom: 4,
  },
  searchHint: {
    fontSize: 12,
    color: Colors.gray[500],
    fontStyle: 'italic',
  },
  listContent: {
    padding: 20,
  },
  fixedButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonSpacing: {
    width: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 20,
    lineHeight: 24,
  },
  exampleItem: {
    backgroundColor: Colors.gray[100],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalTip: {
    backgroundColor: Colors.accent + '20',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
});