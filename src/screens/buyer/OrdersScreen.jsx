import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { ordersAPI } from '../../services/api';

const STATUS = {
  PENDING:     { label: 'En attente',    color: colors.muted,   bg: colors.card },
  CONFIRMED:   { label: 'Confirmee',     color: colors.bright,  bg: 'rgba(77,110,255,0.2)' },
  PICKUP:      { label: 'Recuperation',  color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  IN_DELIVERY: { label: 'En livraison',  color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  DELIVERED:   { label: 'Livre',         color: colors.success, bg: 'rgba(0,229,160,0.1)' },
  CANCELLED:   { label: 'Annule',        color: colors.danger,  bg: 'rgba(255,77,109,0.1)' },
};

export default function OrdersScreen({ navigation }) {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
    const unsubscribe = navigation.addListener('focus', loadOrders);
    return unsubscribe;
  }, [navigation]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getMyOrders();
      setOrders(res.orders || []);
    } catch (e) {
      console.log('Erreur commandes:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  const getProductLabel = (order) => {
    if (!order.items || order.items.length === 0) return 'Commande';
    const first = order.items[0];
    const name  = first.product?.name || 'Produit';
    const extra = order.items.length > 1 ? ' +' + (order.items.length - 1) : '';
    return name + ' x' + first.quantity + extra;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <Text style={styles.headerTitle}>Mes commandes</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
          renderItem={({ item }) => {
            const s = STATUS[item.status] || STATUS.PENDING;
            const canReview = item.status === 'DELIVERED' && !item.review;
            return (
              <View style={styles.orderCard}>
                <TouchableOpacity onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}>
                  <View style={styles.orderTop}>
                    <View style={styles.orderEmoji}><Text style={{ fontSize: 24 }}>📦</Text></View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                      <Text style={styles.orderShop}>{item.shop?.name}</Text>
                      <Text style={styles.orderProduct} numberOfLines={1}>{getProductLabel(item)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.orderTotal}>{item.totalAmount?.toLocaleString()}</Text>
                      <Text style={styles.orderCurrency}>CDF</Text>
                    </View>
                  </View>
                  <View style={styles.orderBottom}>
                    <Text style={styles.orderDate}>
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Acces direct pour noter, sans passer par le suivi de commande */}
                {canReview && (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => navigation.navigate('Review', {
                      order: { id: item.id, shop: item.shop?.name, product: getProductLabel(item) },
                    })}
                  >
                    <Ionicons name="star-outline" size={16} color={colors.gold} />
                    <Text style={styles.reviewBtnText}>Noter cette commande</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'DELIVERED' && item.review && (
                  <View style={styles.reviewedRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={styles.reviewedText}>Deja note - {'⭐'.repeat(item.review.rating)}</Text>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>Aucune commande pour l instant</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  list: { padding: spacing.lg, gap: 12 },
  orderCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md },
  orderTop: { flexDirection: 'row', gap: 12, marginBottom: spacing.sm },
  orderEmoji: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1 },
  orderId: { fontSize: 11, fontWeight: '700', color: colors.accent },
  orderShop: { fontSize: 13, fontWeight: '700', color: colors.text },
  orderProduct: { fontSize: 11, color: colors.muted, marginTop: 2 },
  orderTotal: { fontSize: 16, fontWeight: '800', color: colors.gold },
  orderCurrency: { fontSize: 10, color: colors.muted },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(77,110,255,0.08)' },
  orderDate: { fontSize: 11, color: colors.muted },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.sm, paddingVertical: 9, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,184,48,0.3)', backgroundColor: 'rgba(255,184,48,0.08)' },
  reviewBtnText: { fontSize: 12, color: colors.gold, fontWeight: '700' },
  reviewedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  reviewedText: { fontSize: 11, color: colors.success },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: spacing.lg },
  emptyText: { fontSize: 15, color: colors.muted },
});
