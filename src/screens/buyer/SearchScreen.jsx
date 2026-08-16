import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { productsAPI, shopsAPI } from '../../services/api';

const CATEGORIES = [
  { name: 'Mode',        emoji: '👗' },
  { name: 'Tech',        emoji: '📱' },
  { name: 'Alimentaire', emoji: '🥩' },
  { name: 'Beaute',      emoji: '💄' },
  { name: 'Maison',      emoji: '🏠' },
  { name: 'Sport',       emoji: '⚽' },
];

export default function SearchScreen({ navigation, route }) {
  const [search,         setSearch]         = useState(route.params?.initialQuery || '');
  const [products,       setProducts]       = useState([]);
  const [shops,          setShops]          = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [activeCategory, setActiveCategory] = useState(route.params?.initialCategory || null);

  // Reagit quand HomeScreen renvoie ici avec une nouvelle requete
  // ou une nouvelle categorie (navigation.navigate('Explorer', {...}))
  useEffect(() => {
    if (route.params?.initialQuery !== undefined) {
      setSearch(route.params.initialQuery);
    }
    if (route.params?.initialCategory !== undefined) {
      setActiveCategory(route.params.initialCategory);
    }
  }, [route.params]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(search, activeCategory);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  // ═══ CORRECTION ═══
  // Avant, cet ecran ne cherchait que dans les produits (productsAPI.search)
  // alors que le champ dit "produits, boutiques". Une recherche par NOM
  // DE BOUTIQUE ne renvoyait donc jamais rien. On interroge maintenant
  // les deux en parallele.
  const runSearch = async (q, category) => {
    try {
      setLoading(true);
      const params = {};
      if (q) params.q = q;
      if (category) params.category = category;

      const shopParams = {};
      if (q) shopParams.search = q;
      if (category) shopParams.category = category;

      const [productsRes, shopsRes] = await Promise.all([
        productsAPI.search(params),
        shopsAPI.getAll(shopParams),
      ]);
      setProducts(productsRes.products || []);
      setShops(shopsRes.shops || []);
    } catch (e) {
      console.log('Erreur recherche:', e);
      setProducts([]);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = (catName) => {
    setActiveCategory(prev => prev === catName ? null : catName);
  };

  const hasQuery = !!search || !!activeCategory;
  const noResults = hasQuery && products.length === 0 && shops.length === 0 && !loading;

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
          data={[]}
          ListHeaderComponent={
            <View>
              {shops.length > 0 && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={styles.sectionTitle}>Boutiques ({shops.length})</Text>
                  {shops.map(shop => (
                    <TouchableOpacity
                      key={shop.id}
                      style={styles.resultItem}
                      onPress={() => navigation.navigate('HomeMain')}
                    >
                      <View style={styles.resultImg}>
                        {shop.logoUrl ? (
                          <Image source={{ uri: shop.logoUrl }} style={styles.resultRealImg} />
                        ) : (
                          <Text style={{ fontSize: 24 }}>🏪</Text>
                        )}
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{shop.name}</Text>
                        <Text style={styles.resultShop}>{shop.commune} - Note {shop.rating || 0}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {products.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Produits ({products.length})</Text>
                  {products.map(item => (
                    <TouchableOpacity
                      key={item.id}
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
                        <Text style={styles.resultShop}>{item.shop?.name} - {item.shop?.commune}</Text>
                      </View>
                      <Text style={styles.resultPrice}>{item.price?.toLocaleString()} CDF</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {noResults && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyText}>
                    {search ? 'Aucun resultat pour "' + search + '"' : 'Aucun resultat pour cette categorie'}
                  </Text>
                </View>
              )}

              {!hasQuery && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyEmoji}>🛍️</Text>
                  <Text style={styles.emptyText}>Cherche un produit, une boutique, ou choisis une categorie</Text>
                </View>
              )}
            </View>
          }
          renderItem={null}
          contentContainerStyle={styles.list}
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
  list: { padding: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12, marginBottom: 10 },
  resultImg: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  resultRealImg: { width: '100%', height: '100%' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  resultShop: { fontSize: 11, color: colors.muted },
  resultPrice: { fontSize: 14, fontWeight: '800', color: colors.gold },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: spacing.md },
  emptyText: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingHorizontal: spacing.xl },
});
