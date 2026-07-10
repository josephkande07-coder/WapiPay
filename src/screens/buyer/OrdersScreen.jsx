// src/screens/buyer/OrdersScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../theme';

const DEMO_ORDERS = [
  { id: '#4821', shop: 'Mode Kin', product: 'Robe Ankara x2', total: 17000, status: 'delivery', date: 'Aujourd\'hui 14:32', emoji: '👗' },
  { id: '#4819', shop: 'TechHub KIN', product: 'Samsung A14 x1', total: 95000, status: 'done', date: 'Hier 10:15', emoji: '📱' },
  { id: '#4810', shop: 'Marché Bio', product: 'Légumes x3', total: 3600, status: 'done', date: 'Lun 08:45', emoji: '🥦' },
];

const STATUS = {
  pending:  { label: 'En attente',    color: colors.muted,   bg: colors.card },
  delivery: { label: 'En livraison',  color: colors.gold,    bg: 'rgba(255,184,48,0.12)' },
  done:     { label: 'Livré ✓',      color: colors.success, bg: 'rgba(0,229,160,0.1)' },
  cancelled:{ label: 'Annulé',        color: colors.danger,  bg: 'rgba(255,77,109,0.1)' },
};

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <Text style={styles.headerTitle}>Mes commandes</Text>
      </LinearGradient>
      <FlatList
        data={DEMO_ORDERS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const s = STATUS[item.status];
          return (
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View style={styles.orderEmoji}><Text style={{ fontSize: 28 }}>{item.emoji}</Text></View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderShop}>{item.shop}</Text>
                  <Text style={styles.orderProduct} numberOfLines={1}>{item.product}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.orderTotal}>{item.total.toLocaleString()}</Text>
                  <Text style={styles.orderCurrency}>CDF</Text>
                </View>
              </View>
              <View style={styles.orderBottom}>
                <Text style={styles.orderDate}>{item.date}</Text>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>Aucune commande pour l'instant</Text>
          </View>
        }
      />
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
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: spacing.lg },
  emptyText: { fontSize: 15, color: colors.muted },
});
