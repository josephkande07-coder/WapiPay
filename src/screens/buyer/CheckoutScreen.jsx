// src/screens/buyer/CheckoutScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectCartTotal } from '../../store/slices/cartSlice';
import { colors, radius, spacing } from '../../theme';

export default function CheckoutScreen({ navigation }) {
  const total    = useSelector(selectCartTotal);
  const items    = useSelector(state => state.cart.items);
  const shopName = useSelector(state => state.cart.shopName);
  const [address, setAddress] = useState('');
  const [commune, setCommune] = useState('');
  const [note,    setNote]    = useState('');

  const platformFee  = Math.round(total * 0.015);
  const deliveryFee  = 500;
  const grandTotal   = total + deliveryFee + platformFee;

  const handleConfirm = () => {
    if (!address || !commune) {
      alert('Indique ton adresse de livraison !');
      return;
    }
    navigation.navigate('Payment', {
      order: { total: grandTotal, deliveryFee, platformFee, items, address, commune, shopName },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmation</Text>
        </LinearGradient>

        {/* Adresse livraison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Adresse de livraison</Text>
          <TextInput style={styles.input} placeholder="Adresse complète (av., n°, quartier...)" placeholderTextColor={colors.muted} value={address} onChangeText={setAddress} />
          <TextInput style={[styles.input, { marginTop: 10 }]} placeholder="Commune (ex: Gombe, Lingwala...)" placeholderTextColor={colors.muted} value={commune} onChangeText={setCommune} />
          <TextInput style={[styles.input, { marginTop: 10, height: 70 }]} placeholder="Note pour le livreur (optionnel)" placeholderTextColor={colors.muted} value={note} onChangeText={setNote} multiline />
        </View>

        {/* Récapitulatif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Récapitulatif ({items.length} article{items.length > 1 ? 's' : ''})</Text>
          {items.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>{(item.price * item.quantity).toLocaleString()} CDF</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.orderItem}><Text style={styles.orderItemName}>Livraison</Text><Text style={styles.orderItemPrice}>{deliveryFee} CDF</Text></View>
          <View style={styles.orderItem}><Text style={styles.orderItemName}>Frais service (1.5%)</Text><Text style={styles.orderItemPrice}>{platformFee} CDF</Text></View>
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <Text style={[styles.orderItemName, { fontWeight: '800', color: colors.text }]}>TOTAL</Text>
            <Text style={styles.grandTotal}>{grandTotal.toLocaleString()} CDF</Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleConfirm} style={styles.payBtn}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.payBtnGrad}>
            <Ionicons name="lock-closed" size={18} color="#fff" />
            <Text style={styles.payBtnText}>Payer {grandTotal.toLocaleString()} CDF</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  section: { margin: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  input: { backgroundColor: colors.deep, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 13 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  orderItemName: { fontSize: 13, color: colors.muted },
  orderItemPrice: { fontSize: 13, fontWeight: '600', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  grandTotal: { fontSize: 20, fontWeight: '900', color: colors.gold },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.navy, borderTopWidth: 1, borderTopColor: colors.border },
  payBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  payBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
