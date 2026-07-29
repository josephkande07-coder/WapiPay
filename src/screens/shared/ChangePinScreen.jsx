import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { authAPI } from '../../services/api';

export default function ChangePinScreen({ navigation }) {
  const [oldPin,   setOldPin]   = useState('');
  const [newPin,   setNewPin]   = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (oldPin.length !== 6 || newPin.length !== 6 || confirm.length !== 6) {
      Alert.alert('Erreur', 'Chaque PIN doit contenir 6 chiffres.');
      return;
    }
    if (newPin !== confirm) {
      Alert.alert('Erreur', 'Le nouveau PIN et sa confirmation ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePin(oldPin, newPin);
      Alert.alert('Succes', 'PIN modifie avec succes.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Erreur', e?.error || 'Impossible de changer le PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Changer mon PIN</Text>
      <Text style={styles.subtitle}>Ton PIN securise l acces a ton compte et tes paiements.</Text>

      <Text style={styles.label}>PIN actuel</Text>
      <TextInput
        style={styles.input}
        value={oldPin}
        onChangeText={setOldPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        placeholder="• • • • • •"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Nouveau PIN</Text>
      <TextInput
        style={styles.input}
        value={newPin}
        onChangeText={setNewPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        placeholder="• • • • • •"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Confirmer le nouveau PIN</Text>
      <TextInput
        style={styles.input}
        value={confirm}
        onChangeText={setConfirm}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        placeholder="• • • • • •"
        placeholderTextColor={colors.muted}
      />

      <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.saveBtn}>
        <LinearGradient colors={[colors.accent, colors.bright]} style={styles.saveGrad}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Confirmer le changement</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.muted, marginBottom: spacing.xl, lineHeight: 20 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 15, letterSpacing: 4 },
  saveBtn: { marginTop: spacing.xxl, borderRadius: radius.lg, overflow: 'hidden' },
  saveGrad: { paddingVertical: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
