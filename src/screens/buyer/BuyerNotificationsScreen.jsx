import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { ordersAPI } from '../../services/api';

// Meme principe que cote marchand : pas de vrai systeme de notifications
// push pour l instant, donc on construit un vrai fil d evenements a partir
// des commandes reelles de l acheteur (aucune donnee inventee).
const EVENT_CONFIG = {
  PENDING:     { icon: 'time-outline',       color: colors.muted,   title: 'Commande en attente' },
  CONFIRMED:   { icon: 'checkmark-circle',   color: colors.bright,  title: 'Paiement confirme' },
  PICKUP:      { icon: 'bag-check',          color: colors.gold,    title: 'Colis en recuperation' },
  IN_DELIVERY: { icon: 'bicycle',            color: colors.gold,    title: 'Commande en livraison' },
  DELIVERED:   { icon: 'checkmark-done',     color: colors.success, title: 'Commande livree' },
  CANCELLED:   { icon: 'close-circle',       color: colors.danger,  title: 'Commande annulee' },
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1)   return 'A l instant';
  if (mins < 60)  return 'Il y a ' + mins + ' min';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return 'Il y a ' + hours + 'h';
  const days = Math.floor(hours / 24);
  return 'Il y a ' + days + 'j';
}

export default function BuyerNotificationsScreen({ navigation }) {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds,    setReadIds]    = useState([]);

  useEffect(() => {
    loadOrders();
    const unsubscribe = navigation.addListener('focus', loadOrders);
    return unsubscribe;
  }, [navigation]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getMyOrders();
      const sorted = (res.orders || []).slice().sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch (e) {
      console.log('Erreur notifications acheteur:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  const markAllRead = () => setReadIds(orders.map(o => o.id));
  const unreadCount = orders.filter(o => !readIds.includes(o.id)).length;

  const getProductLabel = (order) => {
    if (!order.items || order.items.length === 0) return 'Commande';
    const first = order.items[0];
    return (first.product?.name || 'Produit') + ' x' + first.quantity;
  };

  // ═══ REDIRECTION ═══
  // Taper sur une notification ouvre le vrai suivi de CETTE commande.
  const handlePress = (order) => {
    setReadIds(prev => [...prev, order.id]);
    navigation.navigate('OrderTracking', { orderId: order.id });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markBtn}>
            <Text style={styles.markBtnText}>Tout lire</Text>
          </TouchableOpacity>
        )}
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
            const config = EVENT_CONFIG[item.status] || EVENT_CONFIG.PENDING;
            const isRead = readIds.includes(item.id);
            return (
              <TouchableOpacity
                style={[styles.notifItem, !isRead && styles.notifUnread]}
                onPress={() => handlePress(item)}
              >
                <View style={[styles.notifIcon, { backgroundColor: config.color + '20' }]}>
                  <Ionicons name={config.icon} size={22} color={config.color} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{config.title}</Text>
                  <Text style={styles.notifDesc} numberOfLines={2}>
                    {getProductLabel(item)} - {item.shop?.name}
                  </Text>
                  <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                {!isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>Aucune notification pour l instant</Text>
              <Text style={styles.emptyHint}>Elles apparaitront a chaque etape de tes commandes</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text },
  markBtn: { backgroundColor: 'rgba(26,58,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  markBtnText: { fontSize: 11, color: colors.accent, fontWeight: '700' },
  list: { padding: spacing.lg, gap: 10 },
  notifItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 14 },
  notifUnread: { borderColor: 'rgba(26,58,255,0.3)', backgroundColor: 'rgba(17,32,102,0.8)' },
  notifIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  notifDesc: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  notifTime: { fontSize: 10, color: colors.muted, marginTop: 5 },
  unreadDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  emptyBox: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 50, marginBottom: spacing.md },
  emptyText: { fontSize: 15, color: colors.muted },
  emptyHint: { fontSize: 12, color: colors.muted, marginTop: 6, textAlign: 'center', paddingHorizontal: spacing.xl },
});
