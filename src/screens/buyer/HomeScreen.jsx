// src/screens/buyer/HomeScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, FlatList, Image,
} from 'react-native';
import { LinearGradient }  from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { useSelector }     from 'react-redux';
import { colors, radius, spacing } from '../../theme';

// Données de démo (remplacer par appel API)
const CATEGORIES = [
  { id: '1', name: 'Mode',       emoji: '👗' },
  { id: '2', name: 'Électronique', emoji: '📱' },
  { id: '3', name: 'Alimentation', emoji: '🥩' },
  { id: '4', name: 'Beauté',     emoji: '💄' },
  { id: '5', name: 'Maison',     emoji: '🏠' },
  { id: '6', name: 'Sport',      emoji: '⚽' },
];

const FEATURED_SHOPS = [
  { id: '1', name: 'Mode Kin',    category: 'Mode',    rating: 4.8, emoji: '👗', commune: 'Gombe',    products: 127 },
  { id: '2', name: 'TechHub KIN', category: 'Tech',    rating: 4.6, emoji: '📱', commune: 'Lingwala', products: 45  },
  { id: '3', name: 'Marché Bio',  category: 'Food',    rating: 4.9, emoji: '🥩', commune: 'Kalamu',   products: 89  },
  { id: '4', name: 'Beauté RDC',  category: 'Beauté',  rating: 4.7, emoji: '💄', commune: 'Lemba',    products: 63  },
];

const PRODUCTS = [
  { id: '1', name: 'Robe Ankara Premium', price: 8500,  shopId: '1', shopName: 'Mode Kin',    emoji: '👗' },
  { id: '2', name: 'Samsung Galaxy A14',  price: 95000, shopId: '2', shopName: 'TechHub KIN', emoji: '📱' },
  { id: '3', name: 'Panier de légumes',   price: 1200,  shopId: '3', shopName: 'Marché Bio',  emoji: '🥦' },
  { id: '4', name: 'Rouge à lèvres mat',  price: 2500,  shopId: '4', shopName: 'Beauté RDC',  emoji: '💄' },
  { id: '5', name: 'Chemise Wax',         price: 6500,  shopId: '1', shopName: 'Mode Kin',    emoji: '👔' },
  { id: '6', name: 'Casque Bluetooth',    price: 18000, shopId: '2', shopName: 'TechHub KIN', emoji: '🎧' },
];

export default function HomeScreen({ navigation }) {
  const { user }   = useSelector(state => state.auth);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const firstName = user?.fullName?.split(' ')[0] || 'toi';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── En-tête ── */}
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bonjour 👋</Text>
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

          {/* Barre de recherche */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Chercher produits, boutiques..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={18} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Bannière promo ── */}
        <LinearGradient
          colors={[colors.accent, '#0A2FD4']}
          style={styles.banner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View>
            <Text style={styles.bannerTitle}>🎉 Boutiques vérifiées</Text>
            <Text style={styles.bannerSub}>Achetez en toute confiance{'\n'}à Kinshasa</Text>
          </View>
          <Text style={styles.bannerEmoji}>🛒</Text>
        </LinearGradient>

        {/* ── Catégories ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catégories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catItem, activeCategory === cat.id && styles.catItemActive]}
              onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catName, activeCategory === cat.id && { color: '#fff' }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Boutiques en vedette ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Boutiques en vedette</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Voir tout →</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopScroll}>
          {FEATURED_SHOPS.map(shop => (
            <TouchableOpacity
              key={shop.id}
              style={styles.shopCard}
              onPress={() => navigation.navigate('Shop', { shop })}
            >
              <LinearGradient colors={[colors.mid, colors.deep]} style={styles.shopImgBg}>
                <Text style={styles.shopEmoji}>{shop.emoji}</Text>
              </LinearGradient>
              <View style={styles.shopCardInfo}>
                <Text style={styles.shopCardName}>{shop.name}</Text>
                <Text style={styles.shopCardMeta}>⭐ {shop.rating} · {shop.products} produits</Text>
                <Text style={styles.shopCardCommune}>📍 {shop.commune}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Produits populaires ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produits populaires</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Voir tout →</Text></TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {PRODUCTS.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('Product', { product })}
            >
              <LinearGradient colors={[colors.mid, colors.deep]} style={styles.productImgBg}>
                <Text style={styles.productEmoji}>{product.emoji}</Text>
              </LinearGradient>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price.toLocaleString()} CDF</Text>
                <Text style={styles.productShop}>🏪 {product.shopName}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  filterBtn: { width:32, height:32, borderRadius:10, backgroundColor:'rgba(26,58,255,0.15)', alignItems:'center', justifyContent:'center' },
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
  productEmoji:{ fontSize:38 },
  productInfo: { padding:10 },
  productName: { fontSize:12, fontWeight:'600', color:colors.text, marginBottom:4, lineHeight:16 },
  productPrice:{ fontSize:14, fontWeight:'800', color:colors.gold, fontFamily:'System' },
  productShop: { fontSize:10, color:colors.muted, marginTop:3 },
});
