import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

const METHODS = [
  { id: 'mpesa',  name: 'M-Pesa (Vodacom)', emoji: '💚' },
  { id: 'airtel', name: 'Airtel Money',      emoji: '🔴' },
  { id: 'orange', name: 'Orange Money',      emoji: '🟠' },
];

export default function WithdrawScreen({ navigation }) {
  const balance   = 342500;
  const [amount,  setAmount]  = useState('');
  const [method,  setMethod]  = useState('mpesa');
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);

  const amountNum = parseInt(amount || '0');
  const fee       = Math.round(amountNum * 0.01);

  const handleWithdraw = async () => {
    if (!amount || amountNum < 1000) {
      Alert.alert('Montant invalide', 'Le retrait minimum est de 1 000 CDF.');
      return;
    }
    if (amountNum > balance) {
      Alert.alert('Solde insuffisant', 'Ton solde est de ' + balance.toLocaleString() + ' CDF.');
      return;
    }
    if (!phone || phone.length < 9) {
      Alert.alert('Numero invalide', 'Entre ton numero Mobile Money.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      Alert.alert('Retrait effectue !', amountNum.toLocaleString() + ' CDF envoyes avec succes.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue. Reessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Retirer mes gains</Text>
        </LinearGradient>

        <LinearGradient colors={[colors.accent, '#0A2FD4']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceAmount}>{balance.toLocaleString()} CDF</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.label}>Montant a retirer (CDF)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 50000"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={styles.quickAmounts}>
            {['10000','50000','100000','200000'].map(amt => (
              <TouchableOpacity key={amt} style={styles.quickBtn} onPress={() => setAmount(amt)}>
                <Text style={styles.quickBtnText}>{parseInt(amt).toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Methode de retrait</Text>
          {METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodItem, method === m.id && styles.methodActive]}
              onPress={() => setMethod(m.id)}
            >
              <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
              <Text style={styles.methodName}>{m.name}</Text>
              <View style={[styles.radio, method === m.id && styles.radioActive]}>
                {method === m.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Numero de telephone</Text>
          <View style={styles.phoneWrap}>
            <Text style={styles.prefix}>+243</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="8X XXX XX XX"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={9}
            />
          </View>

          {amountNum > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant demande</Text>
                <Text style={styles.summaryVal}>{amountNum.toLocaleString()} CDF</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais retrait (1%)</Text>
                <Text style={[styles.summaryVal, { color: colors.danger }]}>-{fee.toLocaleString()} CDF</Text>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }]}>
                <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: '700' }]}>Vous recevrez</Text>
                <Text style={styles.receiveAmount}>{(amountNum - fee).toLocaleString()} CDF</Text>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleWithdraw} disabled={loading} style={styles.submitBtn}>
            <LinearGradient colors={[colors.success, '#00B87A']} style={styles.submitGrad}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>Retirer mes gains</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  balanceCard: { margin: spacing.lg, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center' },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: '#fff' },
  section: { paddingHorizontal: spacing.lg },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 8, marginTop: spacing.lg },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 18, fontWeight: '800' },
  quickAmounts: { flexDirection: 'row', gap: 8, marginTop: 10 },
  quickBtn: { flex: 1, paddingVertical: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, alignItems: 'center' },
  quickBtnText: { fontSize: 11, color: colors.muted, fontWeight: '700' },
  methodItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 10 },
  methodActive: { borderColor: colors.accent, backgroundColor: 'rgba(26,58,255,0.1)' },
  methodName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  phoneWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, height: 52 },
  prefix: { color: colors.text, fontWeight: '700', marginRight: 8 },
  phoneInput: { flex: 1, color: colors.text, fontSize: 15 },
  summaryCard: { marginTop: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryVal: { fontSize: 13, fontWeight: '600', color: colors.text },
  receiveAmount: { fontSize: 18, fontWeight: '900', color: colors.success },
  submitBtn: { marginTop: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  submitGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
