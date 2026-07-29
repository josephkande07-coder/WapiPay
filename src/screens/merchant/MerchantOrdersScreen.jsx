import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { ordersAPI } from '../../services/api';

const STATUS = {
  PENDING:     { label: 'En attente',    color: colors.muted,   bg: colors.card },
  CONFIRMED:   { label: 'Confirme',      color: colors.bright,  bg: 'rgba(77,110,255,0.2)' },
  PICKUP:      { label: 'Recuperation',  color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  IN_DELIVERY: { label: 'En livraison',  color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  DELIVERED:   { label: 'Livre',         color: colors.success, bg: 'rgba(0,229,160,0.12)' },
  CANCELLED:   { label: 'Annule',        color: colors.danger,  bg: 'rgba(255,77,109,0.1)' },
};

const TABS = ['Tous', 'En attente', 'En livraison', 'Livres'];

export default function MerchantOrdersScreen() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('Tous');
  const [updatingId,  setUpdatingId]  = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getShopOrders();
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de mettre a jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmOrder = (orderId) => {
    Alert.alert('Confirmer la commande', 'Confirmer cette commande ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () => handleUpdateStatus(orderId, 'CONFIRMED') },
    ]);
  };

  const filtered = orders.filter(o => {
    if (activeTab === 'Tous') return true;
    if (activeTab === 'En attente')   return ['PENDING', 'CONFIRMED'].includes(o.status);
    if (activeTab === 'En livraison') return ['PICKUP', 'IN_DELIVERY'].includes(o.status);
    if (activeTab === 'Livres')       return o.status === 'DELIVERED';
    return true;
  });

  const newCount = orders.filter(o => o.status === 'PENDING').length;

  const getProductName = (order) => {
    if (order.items && order.items.length > 0) {
      const first = order.items[0];
      const name  = first.product?.name || 'Produit';
      return name + (order.items.length > 1 ? ' +' + (order.items.length - 1) : '') + ' x' + first.quantity;
    }
    return 'Commande';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        {newCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{newCount} nouvelle{newCount > 1 ? 's' : ''}</Text>
          </View>
        )}
        <TouchableOpacity onPress={loadOrders} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.text} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>Aucune commande pour l instant</Text>
              <Text style={styles.emptyHint}>Tirez vers le bas pour actualiser</Text>
            </View>
          }
          renderItem={({ item }) => {
            const s = STATUS[item.status] || STATUS.PENDING;
            return (
              <View style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderProduct}>{getProductName(item)}</Text>
                    <Text style={styles.orderClient}>{item.buyer?.fullName}</Text>
                    <Text style={styles.orderPhone}>{item.buyer?.phone}</Text>
                    <Text style={styles.orderAddress}>{item.deliveryAddress}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text style={styles.orderAmount}>
                      {item.totalAmount?.toLocaleString()} CDF
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <Text style={styles.orderDate}>
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>

                {/* Actions selon statut */}
                {item.status === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => confirmOrder(item.id)}
                    disabled={updatingId === item.id}
                  >
                    {updatingId === item.id
                      ? <ActivityIndicator color={colors.success} size="small" />
                      : <Text style={styles.confirmBtnText}>Confirmer la commande</Text>
                    }
                  </TouchableOpacity>
                )}
                {item.status === 'CONFIRMED' && (
                  <TouchableOpacity
                    style={[styles.confirmBtn, { borderColor: 'rgba(255,184,48,0.3)', backgroundColor: 'rgba(255,184,48,0.08)' }]}
                    onPress={() => handleUpdateStatus(item.id, 'IN_DELIVERY')}
                    disabled={updatingId === item.id}
                  >
                    {updatingId === item.id
                      ? <ActivityIndicator color={colors.gold} size="small" />
                      : <Text style={[styles.confirmBtnText, { color: colors.gold }]}>Marquer en livraison</Text>
                    }
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: colors.text },
  headerBadge: { backgroundColor: colors.danger, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  refreshBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: 8, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { padding: spacing.lg, gap: 12 },
  orderCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontSize: 11, fontWeight: '700', color: colors.accent, marginBottom: 3 },
  orderProduct: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  orderClient: { fontSize: 12, color: colors.muted },
  orderPhone: { fontSize: 11, color: colors.muted, marginTop: 2 },
  orderAddress: { fontSize: 11, color: colors.muted, marginTop: 2, maxWidth: 180 },
  orderAmount: { fontSize: 16, fontWeight: '800', color: colors.gold },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  orderDate: { fontSize: 10, color: colors.muted },
  confirmBtn: { marginTop: spacing.md, padding: 10, backgroundColor: 'rgba(0,229,160,0.1)', borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,229,160,0.3)' },
  confirmBtnText: { fontSize: 13, color: colors.success, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: spacing.lg },
  emptyText: { fontSize: 15, color: colors.muted },
  emptyHint: { fontSize: 12, color: colors.muted, marginTop: 8 },
});
