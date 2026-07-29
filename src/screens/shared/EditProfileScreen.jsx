import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import { colors, radius, spacing } from '../../theme';
import { authAPI } from '../../services/api';

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [loading,  setLoading]  = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas etre vide.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.updateMe({ fullName });
      dispatch(updateUser(res.user));
      Alert.alert('Succes', 'Profil mis a jour.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Erreur', e?.error || 'Impossible de mettre a jour le profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Modifier mon profil</Text>

      <Text style={styles.label}>Nom complet</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Ton nom complet"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Numero de telephone</Text>
      <View style={[styles.input, styles.disabledInput]}>
        <Text style={styles.disabledText}>{user?.phone}</Text>
      </View>
      <Text style={styles.hint}>Le numero de telephone ne peut pas etre modifie.</Text>

      <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
        <LinearGradient colors={[colors.accent, colors.bright]} style={styles.saveGrad}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Enregistrer</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.xl },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 15 },
  disabledInput: { opacity: 0.6 },
  disabledText: { color: colors.muted, fontSize: 15 },
  hint: { fontSize: 11, color: colors.muted, marginTop: 6 },
  saveBtn: { marginTop: spacing.xxl, borderRadius: radius.lg, overflow: 'hidden' },
  saveGrad: { paddingVertical: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
