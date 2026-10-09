import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { ordersAPI } from '../../services/api';

const STATUS_CONFIG = {
  PENDING:     { label: 'En attente',    color: colors.bright,  bg: 'rgba(77,110,255,0.2)' },
  CONFIRMED:   { label: 'Confirme',      color: colors.bright,  bg: 'rgba(77,110,255,0.2)' },
  PICKUP:      { label: 'Recuperation',  color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  IN_DELIVERY: { label: 'En livraison',  color: colors.gold,    bg: 'rgba(255,184,48,0.15)' },
  DELIVERED:   { label: 'Livre',         color: colors.success, bg: 'rgba(0,229,160,0.12)' },
  CANCELLED:   { label: 'Annule',        color: colors.danger,  bg: 'rgba(255,77,109,0.1)' },
};

const NEXT_ACTION = {
  PENDING:     { next: 'CONFIRMED',   label: 'Confirmer la commande' },
  CONFIRMED:   { next: 'PICKUP',      label: 'Marquer en recuperation' },
  PICKUP:      { next: 'IN_DELIVERY', label: 'Marquer en livraison' },
  IN_DELIVERY: { next: 'DELIVERED',   label: 'Marquer comme livre' },
};

const cleanPhoneForWhatsApp = (phone) => (phone || '').replace(/\D/g, '');

export default function MerchantOrderDetailScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating,   setUpdating]   = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getById(orderId);
      setOrder(res.order);
    } catch (e) {
      console.log('Erreur commande:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  }, [orderId]);

  const handleAdvanceStatus = async () => {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setUpdating(true);
    try {
      await ordersAPI.updateStatus(order.id, action.next);
      await loadOrder();
    } catch (e) {
      Alert.alert('Erreur', e?.error || 'Impossible de mettre a jour le statut.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Annuler la commande', 'Es-tu sur de vouloir annuler cette commande ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler', style: 'destructive',
        onPress: async () => {
          setUpdating(true);
          try {
            await ordersAPI.updateStatus(order.id, 'CANCELLED');
            await loadOrder();
          } catch (e) {
            Alert.alert('Erreur', e?.error || 'Impossible d annuler.');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const callBuyer = () => {
    if (order?.buyer?.phone) {
      Linking.openURL('tel:' + order.buyer.phone);
    }
  };

  const messageBuyer = async () => {
    const number = cleanPhoneForWhatsApp(order?.buyer?.phone);
    if (!number) {
      Alert.alert('Erreur', 'Numero de l acheteur introuvable.');
      return;
    }
    const productLabel = order.items?.[0]?.product?.name || 'votre commande';
    const message = 'Bonjour ' + (order.buyer?.fullName || '') + ', je vous contacte au sujet de votre commande #' + order.id.slice(-6).toUpperCase() + ' (' + productLabel + ').';
    const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp indisponible', 'WhatsApp ne semble pas installe sur cet appareil.');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d ouvrir WhatsApp.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: spacing.xl }]}>
        <Text style={{ color: colors.muted }}>Commande introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const nextAction = NEXT_ACTION[order.status];
  const canCancel = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Commande #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.headerDate}>
            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
      >
        {/* Acheteur */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acheteur</Text>
          <View style={styles.buyerRow}>
            <View style={styles.buyerAvatar}>
              {order.buyer?.avatarUrl ? (
                <Image source={{ uri: order.buyer.avatarUrl }} style={styles.buyerAvatarImg} />
              ) : (
                <Text style={styles.buyerAvatarText}>{order.buyer?.fullName?.[0]?.toUpperCase() || 'A'}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.buyerName}>{order.buyer?.fullName}</Text>
              <Text style={styles.buyerPhone}>{order.buyer?.phone}</Text>
            </View>
            <View style={styles.contactBtns}>
              <TouchableOpacity style={styles.callBtn} onPress={callBuyer}>
                <Ionicons name="call" size={18} color={colors.success} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.whatsappBtn} onPress={messageBuyer}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Adresse */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adresse de livraison</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={16} color={colors.danger} />
            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Articles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Articles ({order.items?.length || 0})</Text>
          {order.items?.map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product?.name}</Text>
                <Text style={styles.itemQty}>Quantite : {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.subtotal?.toLocaleString()} CDF</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemQty}>Livraison</Text>
            <Text style={styles.itemPrice}>{order.deliveryFee?.toLocaleString()} CDF</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemQty}>Frais service</Text>
            <Text style={styles.itemPrice}>{order.platformFee?.toLocaleString()} CDF</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: 6 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.totalAmount?.toLocaleString()} CDF</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actions</Text>
          {nextAction && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleAdvanceStatus} disabled={updating}>
              {updating
                ? <ActivityIndicator color={colors.success} size="small" />
                : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                    <Text style={styles.actionBtnText}>{nextAction.label}</Text>
                  </>
                )
              }
            </TouchableOpacity>
          )}
          {order.status === 'DELIVERED' && (
            <View style={styles.doneRow}>
              <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
              <Text style={styles.doneText}>Commande livree avec succes</Text>
            </View>
          )}
          {order.status === 'CANCELLED' && (
            <View style={styles.doneRow}>
              <Ionicons name="close-circle" size={20} color={colors.danger} />
              <Text style={[styles.doneText, { color: colors.danger }]}>Commande annulee</Text>
            </View>
          )}
          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={updating}>
              <Text style={styles.cancelBtnText}>Annuler la commande</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  headerDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  card: { margin: spacing.lg, marginBottom: 0, marginTop: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  buyerAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  buyerAvatarImg: { width: 44, height: 44, borderRadius: 14 },
  buyerAvatarText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  buyerName: { fontSize: 14, fontWeight: '700', color: colors.text },
  buyerPhone: { fontSize: 12, color: colors.muted, marginTop: 2 },
  contactBtns: { flexDirection: 'row', gap: 8 },
  callBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,229,160,0.15)', alignItems: 'center', justifyContent: 'center' },
  whatsappBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(37,211,102,0.15)', alignItems: 'center', justifyContent: 'center' },
  addressRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  addressText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  itemName: { fontSize: 13, fontWeight: '600', color: colors.text },
  itemQty: { fontSize: 11, color: colors.muted, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  totalLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: colors.gold },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(0,229,160,0.1)', borderWidth: 1, borderColor: 'rgba(0,229,160,0.3)', borderRadius: radius.lg, paddingVertical: 12, marginBottom: 10 },
  actionBtnText: { fontSize: 13, color: colors.success, fontWeight: '700' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  doneText: { fontSize: 13, color: colors.success, fontWeight: '600' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 12, color: colors.danger, fontWeight: '600' },
});