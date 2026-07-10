// src/screens/merchant/DashboardScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { useSelector }     from 'react-redux';
import { colors, radius, spacing } from '../../theme';

const { width } = Dimensions.get('window');

const STATS = [
  { label: 'Revenus (CDF)', value: '342 500', delta: '+12%', emoji: '💰', color: colors.success },
  { label: 'Commandes',     value: '48',       delta: '+5 auj', emoji: '📦', color: colors.bright },
  { label: 'Visiteurs',     value: '1 247',    delta: 'Ce mois', emoji: '👥', color: colors.gold },
  { label: 'Note moyenne',  value: '4.8 ⭐',   delta: '89 avis',  emoji: '⭐', color: colors.gold },
];

const RECENT_ORDERS = [
  { id: '#4821', product: 'Robe Ankara x2',  client: 'Mireille K.', status: 'new',      amount: 17000 },
  { id: '#4820', product: 'Chemise Wax x1',  client: 'Jean-Paul M.', status: 'delivery', amount: 6500  },
  { id: '#4819', product: 'Boubou Femme x1', client: 'Carine B.',    status: 'done',     amount: 12000 },
  { id: '#4818', product: 'Robe Ankara x1',  client: 'Sandra M.',    status: 'done',     amount: 8500  },
];

const CHART_DATA = [
  { day: 'L', h: 40 }, { day: 'M', h: 55 }, { day: 'M', h: 35 },
  { day: 'J', h: 62 }, { day: 'V', h: 48 }, { day: 'S', h: 30 },
  { day: 'A', h: 68, today: true },
];

const STATUS_CONFIG = {
  new:      { label: 'Nouveau',      color: colors.bright,   bg: 'rgba(77,110,255,0.2)'  },
  delivery: { label: 'En livraison', color: colors.gold,     bg: 'rgba(255,184,48,0.15)' },
  done:     { label: 'Livré ✓',     color: colors.success,  bg: 'rgba(0,229,160,0.12)'  },
};

export default function DashboardScreen({ navigation }) {
  const { user }   = useSelector(state => state.auth);
  const { myShop } = useSelector(state => state.shop);
  const shopName   = myShop?.name || 'Ma Boutique';
  const [period, setPeriod] = useState('week');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>Boutique active</Text>
              </View>
              <Text style={styles.shopName}>{shopName}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>3</Text></View>
            </TouchableOpacity>
          </View>

          {/* Abonnement */}
          <View style={styles.subCard}>
            <Ionicons name="shield-checkmark" size={16} color={colors.gold} />
            <Text style={styles.subText}>Plan Pro · Actif jusqu'au 28 juin 2026</Text>
            <TouchableOpacity style={styles.subBtn}>
              <Text style={styles.subBtnText}>Renouveler</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Stats ── */}
        <View style={styles.statsGrid}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statDelta, { color: s.color }]}>↑ {s.delta}</Text>
            </View>
          ))}
        </View>

        {/* ── Graphique ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Ventes — 7 derniers jours</Text>
            <View style={styles.periodRow}>
              {['week','month'].map(p => (
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
          <View style={styles.chartBars}>
            {CHART_DATA.map((d, i) => (
              <View key={i} style={styles.barWrap}>
                <View style={styles.barBg}>
                  <LinearGradient
                    colors={d.today ? [colors.gold, colors.goldSoft] : [colors.accent, colors.bright]}
                    style={[styles.bar, { height: d.h }]}
                  />
                </View>
                <Text style={[styles.barDay, d.today && { color: colors.gold }]}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Actions rapides ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <LinearGradient colors={[colors.accent, colors.bright]} style={styles.actionGrad}>
                <Ionicons name="add" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.actionLabel}>Ajouter{'\n'}produit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionGrad, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <Ionicons name="pricetag" size={22} color={colors.gold} />
              </View>
              <Text style={styles.actionLabel}>Gérer{'\n'}les prix</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionGrad, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <Ionicons name="megaphone" size={22} color={colors.bright} />
              </View>
              <Text style={styles.actionLabel}>Promo{'\n'}et offres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={[styles.actionGrad, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                <Ionicons name="stats-chart" size={22} color={colors.success} />
              </View>
              <Text style={styles.actionLabel}>Analytics{'\n'}détaillés</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Commandes récentes ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Commandes récentes</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Tout voir →</Text></TouchableOpacity>
          </View>
          {RECENT_ORDERS.map(order => {
            const s = STATUS_CONFIG[order.status];
            return (
              <TouchableOpacity key={order.id} style={styles.orderItem}>
                <View style={styles.orderLeft}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderProduct}>{order.product}</Text>
                  <Text style={styles.orderClient}>👤 {order.client}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>{order.amount.toLocaleString()} CDF</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  activeDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  activeBadgeText: { fontSize: 11, color: colors.success, fontWeight: '700' },
  shopName: { fontSize: 20, fontWeight: '800', color: colors.text },
  notifBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.navy },
  notifBadgeText: { fontSize: 9, color: '#fff', fontWeight: '900' },

  subCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,184,48,0.08)', borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: 'rgba(255,184,48,0.2)' },
  subText: { flex: 1, fontSize: 12, color: colors.gold, fontWeight: '500' },
  subBtn:  { backgroundColor: colors.gold, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  subBtnText: { fontSize: 11, color: '#000', fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: 10 },
  statCard:  { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 14 },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statVal:   { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  statDelta: { fontSize: 11, fontWeight: '600', marginTop: 6 },

  chartCard: { marginHorizontal: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  chartTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  periodRow:  { flexDirection: 'row', gap: 6 },
  periodBtn:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  periodBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  periodText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 },
  barWrap:   { flex: 1, alignItems: 'center', gap: 4 },
  barBg:     { height: 70, justifyContent: 'flex-end', width: '100%' },
  bar:       { borderRadius: 5, width: '100%' },
  barDay:    { fontSize: 9, color: colors.muted },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  seeAll: { fontSize: 12, color: colors.accent, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn:  { alignItems: 'center', gap: 6, flex: 1 },
  actionGrad: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actionLabel:{ fontSize: 10, color: colors.muted, textAlign: 'center', lineHeight: 14 },

  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(77,110,255,0.08)' },
  orderLeft: {},
  orderId:   { fontSize: 11, fontWeight: '700', color: colors.accent, marginBottom: 2 },
  orderProduct: { fontSize: 13, fontWeight: '600', color: colors.text },
  orderClient:  { fontSize: 11, color: colors.muted, marginTop: 2 },
  orderRight:   { alignItems: 'flex-end', gap: 6 },
  orderAmount:  { fontSize: 13, fontWeight: '700', color: colors.text },
  statusBadge:  { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:   { fontSize: 10, fontWeight: '700' },
});
