import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient }  from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { useSelector }     from 'react-redux';
import { colors, radius, spacing } from '../../theme';
import { shopsAPI, productsAPI } from '../../services/api';

const CATEGORIES = [
  { id: '1', name: 'Mode',        emoji: '👗' },
  { id: '2', name: 'Tech',        emoji: '📱' },
  { id: '3', name: 'Alimentaire', emoji: '🥩' },
  { id: '4', name: 'Beaute',      emoji: '💄' },
  { id: '5', name: 'Maison',      emoji: '🏠' },
  { id: '6', name: 'Sport',       emoji: '⚽' },
];

export default function HomeScreen({ navigation }) {
  const { user }   = useSelector(state => state.auth);
  const [search,   setSearch]   = useState('');
  const [shops,    setShops]    = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const firstName = user?.fullName?.split(' ')[0] || 'toi';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopsRes, productsRes] = await Promise.all([
        shopsAPI.getFeatured(),
        productsAPI.search({}),
      ]);
      setShops(shopsRes.shops || []);
      setProducts(productsRes.products || []);
    } catch (e) {
      console.log('Erreur chargement:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search) return loadData();
    try {
      const res = await productsAPI.search({ q: search });
      setProducts(res.products || []);
    } catch (e) {
      console.log('Erreur recherche:', e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bonjour</Text>
              <Text style={styles.username}>{firstName}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={22} color={colors.text} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Chercher produits, boutiques..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); loadData(); }}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <LinearGradient colors={[colors.accent, '#0A2FD4']} style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Boutiques verifiees</Text>
            <Text style={styles.bannerSub}>Achetez en toute confiance a Kinshasa</Text>
          </View>
          <Text style={styles.bannerEmoji}>🛒</Text>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catItem, activeCategory === cat.id && styles.catItemActive]}
              onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catName, activeCategory === cat.id && { color: '#fff' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Boutiques en vedette</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopScroll}>
            {shops.length > 0 ? shops.map(shop => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                onPress={() => navigation.navigate('Shop', { shop })}
              >
                <LinearGradient colors={[colors.mid, colors.deep]} style={styles.shopImgBg}>
                  <Text style={styles.shopEmoji}>🏪</Text>
                </LinearGradient>
                <View style={styles.shopCardInfo}>
                  <Text style={styles.shopCardName}>{shop.name}</Text>
                  <Text style={styles.shopCardMeta}>{shop.rating} etoiles</Text>
                  <Text style={styles.shopCardCommune}>{shop.commune}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>V</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Aucune boutique pour l instant</Text>
              </View>
            )}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produits populaires</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {products.length > 0 ? products.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('Product', { product, shop: product.shop })}
            >
              <LinearGradient colors={[colors.mid, colors.deep]} style={styles.productImgBg}>
                {product.images && product.images[0] ? (
                  <Image source={{ uri: product.images[0] }} style={styles.productRealImg} />
                ) : (
                  <Text style={styles.productEmoji}>📦</Text>
                )}
              </LinearGradient>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price?.toLocaleString()} CDF</Text>
                <Text style={styles.productShop}>{product.shop?.name}</Text>
              </View>
            </TouchableOpacity>
          )) : !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aucun produit pour l instant</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting:  { fontSize: 13, color: colors.muted },
  username:  { fontSize: 20, fontWeight: '800', color: colors.text },
  headerRight:{ flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:   { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, borderWidth:1, borderColor:colors.border, alignItems:'center', justifyContent:'center' },
  notifDot:  { position:'absolute', top:8, right:8, width:8, height:8, borderRadius:4, backgroundColor:colors.danger, borderWidth:1, borderColor:colors.navy },
  avatar:    { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.accent, alignItems:'center', justifyContent:'center' },
  avatarText:{ color:'#fff', fontWeight:'800', fontSize:16 },
  searchBar: { flexDirection:'row', alignItems:'center', backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, borderRadius:radius.lg, paddingHorizontal:14, height:48, gap:10 },
  searchInput:{ flex:1, color:colors.text, fontSize:14 },
  banner: { margin:spacing.lg, borderRadius:radius.xl, padding:spacing.lg, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  bannerTitle:{ color:'#fff', fontWeight:'800', fontSize:16, marginBottom:4 },
  bannerSub:  { color:'rgba(255,255,255,0.75)', fontSize:12, lineHeight:18 },
  bannerEmoji:{ fontSize:50, opacity:0.8 },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:spacing.lg, marginBottom:spacing.md },
  sectionTitle: { fontSize:16, fontWeight:'700', color:colors.text },
  seeAll:       { fontSize:12, color:colors.accent, fontWeight:'600' },
  catScroll:  { paddingHorizontal:spacing.lg, gap:10, paddingBottom:4 },
  catItem:    { alignItems:'center', paddingVertical:10, paddingHorizontal:14, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, borderRadius:radius.lg, minWidth:70 },
  catItemActive:{ backgroundColor:colors.accent, borderColor:colors.accent },
  catEmoji:   { fontSize:22, marginBottom:4 },
  catName:    { fontSize:11, color:colors.muted, fontWeight:'600' },
  shopScroll: { paddingHorizontal:spacing.lg, gap:12, paddingBottom:4 },
  shopCard:   { width:160, backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, borderRadius:radius.xl, overflow:'hidden' },
  shopImgBg:  { height:90, alignItems:'center', justifyContent:'center' },
  shopEmoji:  { fontSize:40 },
  shopCardInfo:{ padding:10 },
  shopCardName:{ fontSize:13, fontWeight:'700', color:colors.text, marginBottom:3 },
  shopCardMeta:{ fontSize:10, color:colors.muted, marginBottom:2 },
  shopCardCommune:{ fontSize:10, color:colors.muted },
  verifiedBadge:{ position:'absolute', top:8, right:8, width:20, height:20, borderRadius:10, backgroundColor:colors.success, alignItems:'center', justifyContent:'center' },
  verifiedText: { fontSize:10, fontWeight:'900', color:'#000' },
  productsGrid:{ flexDirection:'row', flexWrap:'wrap', paddingHorizontal:spacing.lg, gap:12 },
  productCard: { width:'47%', backgroundColor:colors.card, borderWidth:1, borderColor:colors.border, borderRadius:radius.xl, overflow:'hidden' },
  productImgBg:{ height:100, alignItems:'center', justifyContent:'center' },
  productRealImg:{ width:'100%', height:'100%' },
  productEmoji:{ fontSize:38 },
  productInfo: { padding:10 },
  productName: { fontSize:12, fontWeight:'600', color:colors.text, marginBottom:4, lineHeight:16 },
  productPrice:{ fontSize:14, fontWeight:'800', color:colors.gold },
  productShop: { fontSize:10, color:colors.muted, marginTop:3 },
  emptyBox:   { padding:spacing.xl, alignItems:'center' },
  emptyText:  { color:colors.muted, fontSize:13 },
});
