// src/screens/merchant/MerchantOrdersScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

const ALL_ORDERS = [
  { id: '#4821', product: 'Robe Ankara x2',  client: 'Mireille K.', amount: 17000, status: 'new',      date: 'Auj. 14:32', phone: '+243 81 234 5678' },
  { id: '#4820', product: 'Chemise Wax x1',  client: 'Jean-Paul M.',amount: 6500,  status: 'delivery', date: 'Auj. 10:15', phone: '+243 82 345 6789' },
  { id: '#4819', product: 'Boubou Femme x1', client: 'Carine B.',   amount: 12000, status: 'done',     date: 'Hier 16:20', phone: '+243 83 456 7890' },
  { id: '#4818', product: 'Robe Ankara x1',  client: 'Sandra M.',   amount: 8500,  status: 'done',     date: 'Hier 09:45', phone: '+243 84 567 8901' },
];

const STATUS = {
  new:      { label: 'Nouveau',       color: colors.bright,  bg: 'rgba(77,110,255,0.2)'  },
  delivery: { label: 'En livraison',  color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  done:     { label: 'Livré ✓',      color: colors.success, bg: 'rgba(0,229,160,0.12)'  },
  cancelled:{ label: 'Annulé',        color: colors.danger,  bg: 'rgba(255,77,109,0.1)'  },
};

const TABS = ['Tous', 'Nouveaux', 'En livraison', 'Livrés'];

export default function MerchantOrdersScreen() {
  const [activeTab, setActiveTab] = useState('Tous');

  const filtered = ALL_ORDERS.filter(o => {
    if (activeTab === 'Tous') return true;
    if (activeTab === 'Nouveaux') return o.status === 'new';
    if (activeTab === 'En livraison') return o.status === 'delivery';
    if (activeTab === 'Livrés') return o.status === 'done';
    return true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{ALL_ORDERS.filter(o => o.status === 'new').length} nouvelles</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const s = STATUS[item.status];
          return (
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderProduct}>{item.product}</Text>
                  <Text style={styles.orderClient}>👤 {item.client}</Text>
                  <Text style={styles.orderPhone}>{item.phone}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Text style={styles.orderAmount}>{item.amount.toLocaleString()} CDF</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                  <Text style={styles.orderDate}>{item.date}</Text>
                </View>
              </View>
              {item.status === 'new' && (
                <TouchableOpacity style={styles.confirmBtn}>
                  <Text style={styles.confirmBtnText}>✓ Confirmer la commande</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: colors.text },
  headerBadge: { backgroundColor: colors.danger, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
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
  orderAmount: { fontSize: 16, fontWeight: '800', color: colors.gold },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  orderDate: { fontSize: 10, color: colors.muted },
  confirmBtn: { marginTop: spacing.md, padding: 10, backgroundColor: 'rgba(0,229,160,0.1)', borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,229,160,0.3)' },
  confirmBtnText: { fontSize: 13, color: colors.success, fontWeight: '700' },
});
