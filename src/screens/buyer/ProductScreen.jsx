// src/screens/buyer/ProductScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { colors, radius, spacing } from '../../theme';

export default function ProductScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { product, shop } = route.params || {
    product: { id: '1', name: 'Robe Ankara Premium', price: 8500, emoji: '👗', stock: 10 },
    shop: { id: '1', name: 'Mode Kin', commune: 'Gombe' },
  };
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({ product, shopId: shop.id, shopName: shop.name }));
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image produit */}
        <LinearGradient colors={[colors.mid, colors.deep]} style={styles.productImg}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.productEmoji}>{product.emoji}</Text>
        </LinearGradient>

        {/* Infos */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price?.toLocaleString()} CDF</Text>

          {/* Boutique */}
          <TouchableOpacity style={styles.shopRow} onPress={() => navigation.navigate('Shop', { shop })}>
            <View style={styles.shopIcon}><Text>🏪</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.shopLoc}>📍 {shop.commune}, Kinshasa</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </TouchableOpacity>

          {/* Quantité */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantité</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.qBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.qVal}>{quantity}</Text>
              <TouchableOpacity style={styles.qBtn} onPress={() => setQuantity(q => q + 1)}>
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{(product.price * quantity).toLocaleString()} CDF</Text>
          </View>

          {/* Livraison */}
          <View style={styles.deliveryBox}>
            <Ionicons name="bicycle-outline" size={20} color={colors.bright} />
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryTitle}>Livraison disponible</Text>
              <Text style={styles.deliveryDesc}>Le livreur récupère chez {shop.name} · ~1h</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bouton panier fixe */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.cartBtn, added && styles.cartBtnDone]} onPress={handleAddToCart}>
          <LinearGradient
            colors={added ? [colors.success, '#00B87A'] : [colors.accent, colors.bright]}
            style={styles.cartBtnGrad}
          >
            <Ionicons name={added ? 'checkmark' : 'cart'} size={20} color="#fff" />
            <Text style={styles.cartBtnText}>{added ? 'Ajouté au panier !' : 'Ajouter au panier'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  productImg: { height: 260, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', top: 52, left: spacing.lg, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 100 },
  infoSection: { padding: spacing.lg },
  productName: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  productPrice: { fontSize: 28, fontWeight: '900', color: colors.gold, marginBottom: spacing.lg },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, marginBottom: spacing.lg },
  shopIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center' },
  shopName: { fontSize: 14, fontWeight: '700', color: colors.text },
  shopLoc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  quantityLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  qVal: { fontSize: 18, fontWeight: '800', color: colors.text, minWidth: 30, textAlign: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: spacing.lg },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalVal: { fontSize: 22, fontWeight: '900', color: colors.gold },
  deliveryBox: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(77,110,255,0.08)', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  deliveryTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  deliveryDesc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  bottomBar: { padding: spacing.lg, backgroundColor: colors.navy, borderTopWidth: 1, borderTopColor: colors.border },
  cartBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  cartBtnDone: {},
  cartBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
