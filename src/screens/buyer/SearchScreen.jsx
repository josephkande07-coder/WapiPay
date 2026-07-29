import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { productsAPI } from '../../services/api';

const CATEGORIES = [
  { name: 'Mode',        emoji: '👗' },
  { name: 'Tech',        emoji: '📱' },
  { name: 'Alimentaire', emoji: '🥩' },
  { name: 'Beaute',      emoji: '💄' },
  { name: 'Maison',      emoji: '🏠' },
  { name: 'Sport',       emoji: '⚽' },
];

export default function SearchScreen({ navigation }) {
  const [search,         setSearch]         = useState('');
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(search, activeCategory);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  const loadProducts = async (q = '', category = null) => {
    try {
      setLoading(true);
      const params = {};
      if (q)        params.q        = q;
      if (category) params.category = category;
      const res = await productsAPI.search(params);
      setProducts(res.products || []);
    } catch (e) {
      console.log('Erreur recherche:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = (catName) => {
    const newCat = activeCategory === catName ? null : catName;
    setActiveCategory(newCat);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <Text style={styles.headerTitle}>Explorer</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher un produit ou une boutique..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.catRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item => item.name}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, activeCategory === item.name && styles.catChipActive]}
              onPress={() => handleCategory(item.name)}
            >
              <Text style={styles.catEmoji}>{item.emoji}</Text>
              <Text style={[styles.catName, activeCategory === item.name && { color: '#fff' }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.resultsTitle}>
              {search
                ? products.length + ' resultat' + (products.length > 1 ? 's' : '') + ' pour "' + search + '"'
                : 'Tous les produits'
              }
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>
                {search ? 'Aucun resultat pour "' + search + '"' : 'Aucun produit disponible'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => navigation.navigate('Product', { product: item, shop: item.shop })}
            >
              <View style={styles.resultImg}>
                {item.images && item.images[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.resultRealImg} />
                ) : (
                  <Text style={{ fontSize: 28 }}>📦</Text>
                )}
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultShop}>{item.shop?.name} · {item.shop?.commune}</Text>
                {item.description ? (
                  <Text style={styles.resultDesc} numberOfLines={1}>{item.description}</Text>
                ) : null}
              </View>
              <Text style={styles.resultPrice}>{item.price?.toLocaleString()} CDF</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, height: 48, gap: 10 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  catRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  catChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  catEmoji: { fontSize: 16 },
  catName: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  list: { padding: spacing.lg, gap: 10 },
  resultsTitle: { fontSize: 13, color: colors.muted, marginBottom: spacing.sm },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12 },
  resultImg: { width: 60, height: 60, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  resultRealImg: { width: '100%', height: '100%' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  resultShop: { fontSize: 11, color: colors.muted },
  resultDesc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  resultPrice: { fontSize: 15, fontWeight: '800', color: colors.gold },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: spacing.md },
  emptyText: { fontSize: 14, color: colors.muted },
});
