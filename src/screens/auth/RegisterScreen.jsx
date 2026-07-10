// src/screens/auth/RegisterScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phone,    setPhone]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleRegister = async () => {
    if (!fullName || !phone) {
      Alert.alert('Erreur', 'Remplis tous les champs.');
      return;
    }
    if (phone.length < 9) {
      Alert.alert('Erreur', 'Numéro de téléphone invalide.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      navigation.navigate('OTP', { phone: '+243' + phone, fullName });
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.logoMini}>
            <Text style={styles.logoW}>W</Text>
          </LinearGradient>
          <Text style={styles.title}>Créer un compte</Text>
        </View>
        <Text style={styles.subtitle}>Rejoins WapiPay et commence à acheter 🛒</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nom complet</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Jean-Paul Mwamba"
              placeholderTextColor={colors.muted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Numéro de téléphone</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.prefix}>+243</Text>
            <TextInput
              style={styles.input}
              placeholder="8X XXX XX XX"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={9}
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color={colors.bright} />
            <Text style={styles.infoText}>
              Un code OTP sera envoyé par SMS pour vérifier ton numéro.
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.btnWrap}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.btn}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Recevoir le code SMS →</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Déjà un compte ?{' '}
            <Text style={styles.loginLink}>Se connecter</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.merchantRow} onPress={() => navigation.navigate('MerchantRegister')}>
          <Text style={styles.merchantText}>🏪 Ouvrir ma boutique sur WapiPay</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  logoMini: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoW: { fontSize: 24, fontWeight: '900', color: '#fff' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: spacing.xxl },
  form: { gap: 4 },
  label: { fontSize: 12, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, height: 52 },
  prefix: { color: colors.text, fontWeight: '700', marginRight: 8 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '500' },
  infoBox: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(77,110,255,0.08)', borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.border, marginTop: spacing.lg },
  infoText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 18 },
  btnWrap: { marginTop: spacing.xxl, borderRadius: radius.lg, overflow: 'hidden', shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { marginTop: spacing.xl, alignItems: 'center' },
  loginText: { color: colors.muted, fontSize: 13 },
  loginLink: { color: colors.accent, fontWeight: '700' },
  merchantRow: { marginTop: spacing.lg, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  merchantText: { color: colors.gold, fontSize: 13, fontWeight: '600' },
});
