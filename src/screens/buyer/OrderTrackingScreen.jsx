import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

const STEPS = [
  { id: 1, label: 'Commande confirmee',  icon: 'checkmark-circle', desc: 'Le marchand a recu ta commande' },
  { id: 2, label: 'En preparation',      icon: 'cube',             desc: 'Le marchand prepare ton colis' },
  { id: 3, label: 'Livreur en route',    icon: 'bicycle',          desc: 'Le livreur est en chemin vers la boutique' },
  { id: 4, label: 'Colis recupere',      icon: 'bag-check',        desc: 'Le livreur a pris ton colis' },
  { id: 5, label: 'Livraison en cours',  icon: 'navigate',         desc: 'Le livreur arrive chez toi' },
  { id: 6, label: 'Livre',              icon: 'home',             desc: 'Commande livree avec succes !' },
];

export default function OrderTrackingScreen({ navigation, route }) {
  const { order } = route.params || {
    order: { id: '#4821', product: 'Robe Ankara x2', shop: 'Mode Kin', total: 17000 }
  };
  const [currentStep, setCurrentStep] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(s => s < 6 ? s + 1 : s);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Suivi commande</Text>
          <Text style={styles.orderId}>{order.id}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="cube-outline" size={18} color={colors.bright} />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryProduct}>{order.product}</Text>
              <Text style={styles.summaryShop}>{order.shop}</Text>
            </View>
            <Text style={styles.summaryTotal}>{order.total ? order.total.toLocaleString() : '0'} CDF</Text>
          </View>
        </View>

        {currentStep >= 3 && (
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryAvatar}>
              <Text style={{ fontSize: 28 }}>🛵</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryLabel}>Votre livreur</Text>
              <Text style={styles.deliveryName}>Patrick M.</Text>
              <Text style={styles.deliveryRating}>4.9 etoiles - 234 livraisons</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.stepsSection}>
          <Text style={styles.stepsTitle}>Progression</Text>
          {STEPS.map((step, index) => {
            const isDone    = step.id < currentStep;
            const isActive  = step.id === currentStep;
            return (
              <View key={step.id} style={styles.stepRow}>
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
                  {(isDone || isActive) && (
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.supportBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.bright} />
          <Text style={styles.supportText}>Contacter le support WapiPay</Text>
        </TouchableOpacity>
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
  deliveryCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: 'rgba(0,229,160,0.08)', borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)', borderRadius: radius.xl, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  deliveryAvatar: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  deliveryLabel: { fontSize: 11, color: colors.muted },
  deliveryName: { fontSize: 15, fontWeight: '700', color: colors.text },
  deliveryRating: { fontSize: 11, color: colors.success, marginTop: 2 },
  callBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,229,160,0.15)', alignItems: 'center', justifyContent: 'center' },
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
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  supportText: { fontSize: 13, color: colors.bright, fontWeight: '600' },
});
