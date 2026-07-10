// src/screens/merchant/MyShopScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

const DEMO_PRODUCTS = [
  { id: '1', name: 'Robe Ankara Premium', price: 8500,  stock: 10, emoji: '👗', active: true },
  { id: '2', name: 'Boubou Femme',        price: 12000, stock: 5,  emoji: '👘', active: true },
  { id: '3', name: 'Chemise Wax',         price: 6500,  stock: 8,  emoji: '👔', active: false },
];

export default function MyShopScreen({ navigation }) {
  const [products, setProducts] = useState(DEMO_PRODUCTS);

  const toggleProduct = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <Text style={styles.headerTitle}>Ma boutique</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes produits ({products.length})</Text>
          {products.map(product => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productImg}>
                <Text style={{ fontSize: 28 }}>{product.emoji}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price.toLocaleString()} CDF</Text>
                <Text style={styles.productStock}>Stock : {product.stock} unités</Text>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={[styles.toggleBtn, product.active && styles.toggleBtnActive]}
                  onPress={() => toggleProduct(product.id)}
                >
                  <Text style={[styles.toggleText, product.active && { color: '#fff' }]}>
                    {product.active ? 'Actif' : 'Inactif'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="create-outline" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addProductBtn}>
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
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  productItem: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12, marginBottom: 10 },
  productImg: { width: 58, height: 58, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  productPrice: { fontSize: 14, fontWeight: '800', color: colors.gold },
  productStock: { fontSize: 11, color: colors.muted, marginTop: 2 },
  productActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  toggleBtn: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  toggleBtnActive: { backgroundColor: colors.success, borderColor: colors.success },
  toggleText: { fontSize: 10, fontWeight: '700', color: colors.muted },
  addProductBtn: { margin: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  addProductGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  addProductText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
