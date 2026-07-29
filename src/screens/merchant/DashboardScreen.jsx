import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { shopsAPI, ordersAPI } from '../../services/api';

const STATUS_CONFIG = {
  PENDING:     { label: 'Nouveau',      color: colors.bright,  bg: 'rgba(77,110,255,0.2)' },
  CONFIRMED:   { label: 'Confirme',     color: colors.bright,  bg: 'rgba(77,110,255,0.2)' },
  PICKUP:      { label: 'Recuperation', color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  IN_DELIVERY: { label: 'En livraison', color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  DELIVERED:   { label: 'Livre',        color: colors.success, bg: 'rgba(0,229,160,0.12)' },
  CANCELLED:   { label: 'Annule',       color: colors.danger,  bg: 'rgba(255,77,109,0.1)' },
};

export default function DashboardScreen({ navigation }) {
  const [shop,        setShop]        = useState(null);
  const [orders,      setOrders]      = useState([]);
  const [chartData,   setChartData]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [period,      setPeriod]      = useState('week');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadStats(period);
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopRes, ordersRes] = await Promise.all([
        shopsAPI.getMyShop(),
        ordersAPI.getShopOrders(),
      ]);
      setShop(shopRes.shop);
      setOrders(ordersRes.orders || []);
      await loadStats(period);
    } catch (e) {
      console.log('Erreur dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (p) => {
    try {
      const res = await ordersAPI.getShopStats(p);
      setChartData(res.data || []);
    } catch (e) {
      console.log('Erreur stats:', e);
      setChartData([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [period]);

  const totalRevenu = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0);
  const newOrders   = orders.filter(o => o.status === 'PENDING').length;
  const maxChartVal = Math.max(...chartData.map(d => d.total), 1);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
      >
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.activeBadge}>
                <View style={[styles.activeDot, { backgroundColor: shop?.isActive ? colors.success : colors.danger }]} />
                <Text style={[styles.activeBadgeText, { color: shop?.isActive ? colors.success : colors.danger }]}>
                  {shop?.isActive ? 'Boutique active' : 'Boutique inactive'}
                </Text>
              </View>
              <Text style={styles.shopName}>{shop?.name || 'Ma Boutique'}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {newOrders > 0 && (
                <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{newOrders}</Text></View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.subCard}>
            <Ionicons name="shield-checkmark" size={16} color={colors.gold} />
            <Text style={styles.subText}>Plan {shop?.plan} - {shop?.subscriptionActive ? 'Actif' : 'Inactif'}</Text>
            <TouchableOpacity style={styles.subBtn} onPress={() => navigation.navigate('Withdraw')}>
              <Text style={styles.subBtnText}>Retirer</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statVal}>{totalRevenu.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Revenus (CDF)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📦</Text>
            <Text style={styles.statVal}>{orders.length}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statVal}>{shop?.rating || 0}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🛍️</Text>
            <Text style={styles.statVal}>{shop?.totalSales || 0}</Text>
            <Text style={styles.statLabel}>Ventes totales</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {period === 'week' ? 'Ventes livrees - 7 derniers jours' : 'Ventes livrees - 4 dernieres semaines'}
            </Text>
            <View style={styles.periodRow}>
              {['week', 'month'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                    {p === 'week' ? 'Semaine' : 'Mois'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {chartData.length === 0 ? (
            <Text style={styles.chartEmpty}>Aucune vente livree sur cette periode</Text>
          ) : (
            <View style={styles.chartBars}>
              {chartData.map((d, i) => {
                const height = Math.max(4, (d.total / maxChartVal) * 70);
                const isToday = i === chartData.length - 1;
                return (
                  <View key={i} style={styles.barWrap}>
                    <View style={styles.barBg}>
                      <LinearGradient
                        colors={isToday ? [colors.gold, colors.goldSoft] : [colors.accent, colors.bright]}
                        style={[styles.bar, { height }]}
                      />
                    </View>
                    <Text style={[styles.barDay, isToday && { color: colors.gold }]}>{d.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Commandes recentes</Text>
          </View>
          {orders.slice(0, 5).map(order => {
            const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            return (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderLeft}>
                  <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderProduct}>{order.items?.[0]?.product?.name || 'Produit'}</Text>
                  <Text style={styles.orderClient}>{order.buyer?.fullName}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>{order.totalAmount?.toLocaleString()} CDF</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
          {orders.length === 0 && (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>Aucune commande pour l instant</Text></View>
          )}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeBadgeText: { fontSize: 11, fontWeight: '700' },
  shopName: { fontSize: 20, fontWeight: '800', color: colors.text },
  notifBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.navy },
  notifBadgeText: { fontSize: 9, color: '#fff', fontWeight: '900' },
  subCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,184,48,0.08)', borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: 'rgba(255,184,48,0.2)' },
  subText: { flex: 1, fontSize: 12, color: colors.gold, fontWeight: '500' },
  subBtn: { backgroundColor: colors.gold, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  subBtnText: { fontSize: 11, color: '#000', fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: 10 },
  statCard: { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 14 },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  chartCard: { marginHorizontal: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  chartHeader: { marginBottom: spacing.lg },
  chartTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 10 },
  periodRow: { flexDirection: 'row', gap: 6 },
  periodBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  periodBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  periodText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 },
  chartEmpty: { fontSize: 12, color: colors.muted, textAlign: 'center', paddingVertical: 20 },
  barWrap: { flex: 1, alignItems: 'center', gap: 4 },
  barBg: { height: 70, justifyContent: 'flex-end', width: '100%' },
  bar: { borderRadius: 5, width: '100%' },
  barDay: { fontSize: 9, color: colors.muted },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(77,110,255,0.08)' },
  orderLeft: {},
  orderId: { fontSize: 11, fontWeight: '700', color: colors.accent, marginBottom: 2 },
  orderProduct: { fontSize: 13, fontWeight: '600', color: colors.text },
  orderClient: { fontSize: 11, color: colors.muted, marginTop: 2 },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  orderAmount: { fontSize: 13, fontWeight: '700', color: colors.text },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  emptyBox: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.muted, fontSize: 13 },
});
