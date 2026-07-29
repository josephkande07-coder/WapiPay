import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { shopsAPI, productsAPI } from '../../services/api';

export default function MyShopScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [shop,     setShop]     = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    loadShop();
    const unsubscribe = navigation.addListener('focus', loadShop);
    return unsubscribe;
  }, [navigation]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const res = await shopsAPI.getMyShop();
      setShop(res.shop);
      setProducts(res.shop?.products || []);
    } catch (e) {
      console.log('Erreur boutique:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (productId, currentStatus) => {
    try {
      await productsAPI.update(productId, { isActive: !currentStatus });
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de modifier le produit.');
    }
  };

  const deleteProduct = (productId) => {
    Alert.alert('Supprimer', 'Veux-tu supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await productsAPI.delete(productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
          } catch (e) {
            Alert.alert('Erreur', 'Impossible de supprimer.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <Text style={styles.headerTitle}>Ma boutique</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {shop && (
          <View style={styles.shopInfoCard}>
            <Text style={styles.shopName}>{shop.name}</Text>
            <Text style={styles.shopAddress}>{shop.address}, {shop.commune}</Text>
            <View style={styles.shopStats}>
              <View style={styles.shopStat}>
                <Text style={styles.shopStatVal}>{products.length}</Text>
                <Text style={styles.shopStatLbl}>Produits</Text>
              </View>
              <View style={styles.shopStat}>
                <Text style={styles.shopStatVal}>{shop.rating}</Text>
                <Text style={styles.shopStatLbl}>Note</Text>
              </View>
              <View style={styles.shopStat}>
                <Text style={styles.shopStatVal}>{shop.totalSales}</Text>
                <Text style={styles.shopStatLbl}>Ventes</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes produits ({products.length})</Text>
          {products.map(product => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productImg}>
                {product.images && product.images[0] ? (
                  <Image source={{ uri: product.images[0] }} style={styles.productRealImg} />
                ) : (
                  <Text style={{ fontSize: 28 }}>📦</Text>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price?.toLocaleString()} CDF</Text>
                <Text style={styles.productStock}>Stock : {product.stock} unites</Text>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={[styles.toggleBtn, product.isActive && styles.toggleBtnActive]}
                  onPress={() => toggleProduct(product.id, product.isActive)}
                >
                  <Text style={[styles.toggleText, product.isActive && { color: '#fff' }]}>
                    {product.isActive ? 'Actif' : 'Inactif'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteProduct(product.id)}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {products.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>Aucun produit pour l instant</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.addProductBtn}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.addProductGrad}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addProductText}>Ajouter un produit</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  shopInfoCard: { margin: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg },
  shopName: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
  shopAddress: { fontSize: 12, color: colors.muted, marginBottom: spacing.md },
  shopStats: { flexDirection: 'row', justifyContent: 'space-around' },
  shopStat: { alignItems: 'center' },
  shopStatVal: { fontSize: 20, fontWeight: '800', color: colors.accent },
  shopStatLbl: { fontSize: 11, color: colors.muted, marginTop: 2 },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  productItem: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12, marginBottom: 10 },
  productImg: { width: 58, height: 58, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  productRealImg: { width: '100%', height: '100%' },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  productPrice: { fontSize: 14, fontWeight: '800', color: colors.gold },
  productStock: { fontSize: 11, color: colors.muted, marginTop: 2 },
  productActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  toggleBtn: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  toggleBtnActive: { backgroundColor: colors.success, borderColor: colors.success },
  toggleText: { fontSize: 10, fontWeight: '700', color: colors.muted },
  emptyBox: { alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 50, marginBottom: spacing.md },
  emptyText: { color: colors.muted, fontSize: 13 },
  addProductBtn: { margin: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  addProductGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  addProductText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
