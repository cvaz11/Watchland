import { Search, Filter, ArrowLeft, Lightbulb, X, Camera, Sparkles, Zap } from 'lucide-react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Pressable, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import WatchCard from '@/components/WatchCard';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { watchesDatabase } from '@/mocks/watches-database';
import { intelligentSearch, getSearchSuggestions } from '@/services/intelligent-search';

const BRANDS = ['Todos', 'Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'TAG Heuer', 'Breitling', 'IWC', 'Grand Seiko', 'Jaeger-LeCoultre', 'Tissot'];
const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até R$ 25.000', min: 0, max: 25000 },
  { label: 'R$ 25.000 - R$ 50.000', min: 25000, max: 50000 },
  { label: 'R$ 50.000 - R$ 100.000', min: 50000, max: 100000 },
  { label: 'Acima de R$ 100.000', min: 100000, max: Infinity },
];

const SEARCH_EXAMPLES = [
  "tissot prx azul",
  "cronógrafo até R$ 15.000",
  "rolex submariner preto",
  "relógio dourado clássico",
  "omega speedmaster",
  "mergulhador automático aço",
  "patek philippe nautilus",
  "relógio esportivo para trabalho",
  "dress watch couro marrom",
  "gmt para viagem profissional",
];

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todos');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(watchesDatabase);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [lastSearchCriteria, setLastSearchCriteria] = useState<any>(null);

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

  // Busca inteligente com debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const result = await intelligentSearch(searchQuery);
          setSearchResults(result.results);
          setLastSearchCriteria(result.searchCriteria);
          
          if (result.suggestions.length > 0) {
            setSearchSuggestions(result.suggestions);
          }
        } catch (error) {
          console.error('Erro na busca:', error);
          setSearchResults(watchesDatabase);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(watchesDatabase);
        setLastSearchCriteria(null);
        setSearchSuggestions([]);
      }
    }, 800); // Debounce de 800ms para dar tempo da IA processar

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Atualizar sugestões baseadas na query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
    } else {
      const suggestions = getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
    }
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
    setLastSearchCriteria(null);
  };

  const handleExamplePress = (example: string) => {
    setSearchQuery(example);
    setShowExamples(false);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const handleCameraPress = () => {
    router.push('/camera');
  };

  const renderSearchCriteria = () => {
    if (!lastSearchCriteria) return null;

    const criteria = lastSearchCriteria;
    const tags = [];

    if (criteria.brand) tags.push(`Marca: ${criteria.brand}`);
    if (criteria.model) tags.push(`Modelo: ${criteria.model}`);
    if (criteria.color) tags.push(`Cor: ${criteria.color}`);
    if (criteria.material) tags.push(`Material: ${criteria.material}`);
    if (criteria.category) tags.push(`Categoria: ${criteria.category}`);
    if (criteria.priceMax) tags.push(`Até R$ ${criteria.priceMax.toLocaleString('pt-BR')}`);

    if (tags.length === 0) return null;

    return (
      <View style={styles.criteriaContainer}>
        <Text style={styles.criteriaTitle}>🤖 IA entendeu:</Text>
        <View style={styles.criteriaTagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.criteriaTag}>
              <Text style={styles.criteriaTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>🔍 Busca Inteligente</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ex: tissot prx azul, cronógrafo até 15 mil..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.gray[500]}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}
        </View>
        <Pressable onPress={() => setShowExamples(true)} style={styles.examplesButton}>
          <Lightbulb size={20} color={Colors.primary} />
        </Pressable>
        <Pressable onPress={toggleFilters} style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Sugestões de busca */}
      {searchSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {searchSuggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {renderSearchCriteria()}

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Marca</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Faixa de Preço</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            </ScrollView>
          </View>

          <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {isSearching ? '🤖 Buscando...' : `${filteredWatches.length} relógio${filteredWatches.length !== 1 ? 's' : ''} encontrado${filteredWatches.length !== 1 ? 's' : ''}`}
        </Text>
        {searchQuery && !isSearching && (
          <Text style={styles.searchHint}>
            {lastSearchCriteria ? '✨ Busca inteligente ativada' : '💡 Use linguagem natural para melhores resultados'}
          </Text>
        )}
      </View>

      <FlatList
        data={filteredWatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WatchCard watch={item} showRarity />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />

      {/* Botões fixos */}
      <View style={[styles.fixedButtons, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title="🤖 Busca IA"
          onPress={() => {}}
          variant="secondary"
          size="medium"
          icon={<Zap size={18} color={Colors.primary} />}
          disabled={!searchQuery.trim() || isSearching}
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="📸 Identificar"
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
              <Text style={styles.modalTitle}>💡 Exemplos de Busca Inteligente</Text>
              <Pressable onPress={() => setShowExamples(false)} style={styles.modalCloseButton}>
                <X size={24} color={Colors.gray[600]} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Use linguagem natural! Nossa IA entende o que você quer:
              </Text>
              
              {SEARCH_EXAMPLES.map((example, index) => (
                <Pressable
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => handleExamplePress(example)}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                  <Sparkles size={16} color={Colors.primary} />
                </Pressable>
              ))}
              
              <View style={styles.modalTip}>
                <Text style={styles.tipTitle}>🤖 Como funciona a busca inteligente:</Text>
                <Text style={styles.tipText}>
                  {`• Entende linguagem natural: "cronógrafo azul até 15 mil"
• Converte preços automaticamente para Reais
• Encontra relógios similares mesmo sem nome exato
• Ordena por relevância usando IA
• Funciona offline como fallback`}
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
  suggestionsContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  suggestionChip: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  criteriaContainer: {
    backgroundColor: Colors.accent + '10',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  criteriaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  criteriaTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  criteriaTag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  criteriaTagText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
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
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exampleText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    flex: 1,
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