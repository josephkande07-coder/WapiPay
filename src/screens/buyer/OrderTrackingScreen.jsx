import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { ordersAPI } from '../../services/api';

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PICKUP', 'IN_DELIVERY', 'DELIVERED'];

const STEPS = [
  { status: 'PENDING',     label: 'Commande confirmee', icon: 'checkmark-circle', desc: 'Le marchand a recu ta commande' },
  { status: 'CONFIRMED',   label: 'En preparation',      icon: 'cube',             desc: 'Le marchand prepare ton colis' },
  { status: 'PICKUP',      label: 'Livreur en route',    icon: 'bicycle',          desc: 'Le livreur recupere le colis chez le marchand' },
  { status: 'IN_DELIVERY', label: 'Livraison en cours',  icon: 'navigate',         desc: 'Le livreur arrive chez toi' },
  { status: 'DELIVERED',   label: 'Livre',               icon: 'home',             desc: 'Commande livree avec succes !' },
];

export default function OrderTrackingScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await ordersAPI.getById(orderId);
      setOrder(res.order);
    } catch (e) {
      console.log('Erreur suivi commande:', e);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    // On rafraichit periodiquement pour voir la progression reelle
    // mise a jour par le marchand, sans avoir besoin de websockets.
    const interval = setInterval(loadOrder, 8000);
    return () => clearInterval(interval);
  }, [loadOrder]);

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
        <Text style={{ color: colors.muted, textAlign: 'center' }}>Commande introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.accent }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCancelled  = order.status === 'CANCELLED';
  const currentIndex = STATUS_ORDER.indexOf(order.status);
  const productLabel = order.items?.length
    ? order.items[0].product?.name + ' x' + order.items[0].quantity + (order.items.length > 1 ? ' +' + (order.items.length - 1) : '')
    : 'Commande';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Suivi commande</Text>
          <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="cube-outline" size={18} color={colors.bright} />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryProduct}>{productLabel}</Text>
              <Text style={styles.summaryShop}>{order.shop?.name}</Text>
            </View>
            <Text style={styles.summaryTotal}>{order.totalAmount?.toLocaleString()} CDF</Text>
          </View>
        </View>

        {isCancelled ? (
          <View style={styles.cancelledBox}>
            <Ionicons name="close-circle" size={40} color={colors.danger} />
            <Text style={styles.cancelledTitle}>Commande annulee</Text>
            <Text style={styles.cancelledDesc}>Cette commande a ete annulee.</Text>
          </View>
        ) : (
          <View style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>Progression</Text>
            {STEPS.map((step, index) => {
              const isDone   = index < currentIndex;
              const isActive = index === currentIndex;
              return (
                <View key={step.status} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepDot, isDone && styles.stepDotDone, isActive && styles.stepDotActive]}>
                      {isDone
                        ? <Ionicons name="checkmark" size={14} color="#fff" />
                        : <Ionicons name={step.icon} size={14} color={isActive ? '#000' : colors.muted} />
                      }
                    </View>
                    {index < STEPS.length - 1 && (
                      <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                    )}
                  </View>
                  <View style={[styles.stepContent, isActive && styles.stepContentActive]}>
                    <Text style={[styles.stepLabel, isDone && styles.stepLabelDone, isActive && styles.stepLabelActive]}>
                      {step.label}
                    </Text>
                    {(isDone || isActive) && <Text style={styles.stepDesc}>{step.desc}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.addressCard}>
          <Ionicons name="location" size={18} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>Adresse de livraison</Text>
            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
          </View>
        </View>

        <View style={styles.honestNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
          <Text style={styles.honestNoteText}>
            L assignation d un livreur specifique n est pas encore disponible - le marchand gere la livraison directement pour l instant.
          </Text>
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  orderId: { fontSize: 12, color: colors.accent, fontWeight: '700' },
  summaryCard: { margin: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryProduct: { fontSize: 14, fontWeight: '700', color: colors.text },
  summaryShop: { fontSize: 12, color: colors.muted, marginTop: 2 },
  summaryTotal: { fontSize: 16, fontWeight: '800', color: colors.gold },
  cancelledBox: { alignItems: 'center', padding: spacing.xl, marginHorizontal: spacing.lg, backgroundColor: 'rgba(255,77,109,0.08)', borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(255,77,109,0.2)', marginBottom: spacing.lg },
  cancelledTitle: { fontSize: 16, fontWeight: '700', color: colors.danger, marginTop: spacing.sm },
  cancelledDesc: { fontSize: 12, color: colors.muted, marginTop: 4 },
  stepsSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  stepsTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  stepRow: { flexDirection: 'row', gap: 14, minHeight: 60 },
  stepLeft: { alignItems: 'center', width: 32 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepDotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepDotActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
  stepLineDone: { backgroundColor: colors.accent },
  stepContent: { flex: 1, paddingBottom: spacing.md, paddingTop: 4 },
  stepContentActive: { backgroundColor: 'rgba(255,184,48,0.06)', borderRadius: radius.lg, padding: 10, marginBottom: spacing.sm },
  stepLabel: { fontSize: 13, fontWeight: '600', color: colors.muted },
  stepLabelDone: { color: colors.text },
  stepLabelActive: { color: colors.gold, fontWeight: '800' },
  stepDesc: { fontSize: 11, color: colors.muted, marginTop: 3, lineHeight: 16 },
  addressCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md },
  addressLabel: { fontSize: 11, color: colors.muted, marginBottom: 3 },
  addressText: { fontSize: 13, fontWeight: '600', color: colors.text },
  honestNote: { flexDirection: 'row', gap: 8, marginHorizontal: spacing.lg, padding: spacing.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  honestNoteText: { flex: 1, fontSize: 11, color: colors.muted, lineHeight: 16 },
});
