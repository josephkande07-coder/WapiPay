// src/screens/buyer/CartScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, selectCartTotal, selectCartCount } from '../../store/slices/cartSlice';
import { colors, radius, spacing } from '../../theme';

export default function CartScreen({ navigation }) {
  const dispatch   = useDispatch();
  const items      = useSelector(state => state.cart.items);
  const shopName   = useSelector(state => state.cart.shopName);
  const total      = useSelector(selectCartTotal);
  const count      = useSelector(selectCartCount);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Panier vide</Text>
        <Text style={styles.emptySubtitle}>Explore les boutiques et ajoute des produits !</Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Explorer')}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.exploreBtnGrad}>
            <Text style={styles.exploreBtnText}>Explorer les boutiques</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <Text style={styles.headerTitle}>Mon panier</Text>
        <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>{count} article{count > 1 ? 's' : ''}</Text></View>
      </LinearGradient>

      {/* Boutique */}
      <View style={styles.shopBanner}>
        <Ionicons name="storefront-outline" size={16} color={colors.muted} />
        <Text style={styles.shopBannerText}>Boutique : <Text style={{ color: colors.accent, fontWeight: '700' }}>{shopName}</Text></Text>
      </View>

      {/* Liste des articles */}
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemImg}>
              <Text style={styles.itemEmoji}>{item.emoji || '📦'}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price?.toLocaleString()} CDF</Text>
              <View style={styles.qRow}>
                <TouchableOpacity style={styles.qBtn} onPress={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>
                  <Ionicons name="remove" size={14} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.qVal}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qBtn} onPress={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>
                  <Ionicons name="add" size={14} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString()}</Text>
              <Text style={styles.itemTotalCurrency}>CDF</Text>
              <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Récapitulatif & bouton */}
      <View style={styles.bottomSection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryVal}>{total.toLocaleString()} CDF</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Livraison estimée</Text>
          <Text style={styles.summaryVal}>500 CDF</Text>
        </View>
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }]}>
          <Text style={[styles.summaryLabel, { fontWeight: '800', color: colors.text }]}>Total</Text>
          <Text style={styles.totalAmount}>{(total + 500).toLocaleString()} CDF</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Checkout')} style={styles.checkoutBtn}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.checkoutGrad}>
            <Text style={styles.checkoutText}>Passer la commande →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  emptyContainer: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 80, marginBottom: spacing.lg },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: spacing.xxl },
  exploreBtn: { width: '100%', borderRadius: radius.lg, overflow: 'hidden' },
  exploreBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  exploreBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  headerBadge: { backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  shopBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  shopBannerText: { fontSize: 13, color: colors.muted },
  list: { padding: spacing.lg, gap: 12 },
  cartItem: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12 },
  itemImg: { width: 70, height: 70, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center' },
  itemEmoji: { fontSize: 32 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 4, lineHeight: 18 },
  itemPrice: { fontSize: 12, color: colors.muted, marginBottom: 8 },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qBtn: { width: 28, height: 28, borderRadius: 9, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center' },
  qVal: { fontSize: 15, fontWeight: '700', color: colors.text, minWidth: 20, textAlign: 'center' },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  itemTotal: { fontSize: 16, fontWeight: '800', color: colors.gold },
  itemTotalCurrency: { fontSize: 10, color: colors.muted },
  bottomSection: { padding: spacing.lg, backgroundColor: colors.deep, borderTopWidth: 1, borderTopColor: colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryVal: { fontSize: 13, fontWeight: '600', color: colors.text },
  totalAmount: { fontSize: 22, fontWeight: '900', color: colors.gold },
  checkoutBtn: { marginTop: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  checkoutGrad: { paddingVertical: 16, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
