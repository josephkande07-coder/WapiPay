import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import { colors, radius, spacing } from '../../theme';
import { authAPI } from '../../services/api';

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [fullName,  setFullName]  = useState(user?.fullName || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [loading,   setLoading]   = useState(false);

  const pickAvatar = () => {
    Alert.alert('Photo de profil', 'Choisis une option', [
      { text: 'Prendre une photo', onPress: () => launchPicker('camera') },
      { text: 'Depuis la galerie', onPress: () => launchPicker('gallery') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const launchPicker = async (source) => {
    const permissionFn = source === 'camera'
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await permissionFn();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Autorise WapiPay a acceder a ' + (source === 'camera' ? 'la camera' : 'ta galerie') + '.');
      return;
    }
    const launchFn = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await launchFn({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      setAvatarBase64('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas etre vide.');
      return;
    }
    setLoading(true);
    try {
      const payload = { fullName };
      if (avatarBase64) payload.avatarUrl = avatarBase64;
      const res = await authAPI.updateMe(payload);
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

      <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
        ) : (
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLetter}>{fullName?.[0]?.toUpperCase() || 'U'}</Text>
          </LinearGradient>
        )}
        <View style={styles.avatarEditBadge}>
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={styles.avatarHint}>Changer la photo</Text>

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
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.xl, textAlign: 'center' },
  avatarWrap: { alignSelf: 'center', width: 100, height: 100, marginBottom: 8 },
  avatarImg: { width: 100, height: 100, borderRadius: 30 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 40, fontWeight: '900', color: '#fff' },
  avatarEditBadge: { position: 'absolute', bottom: -4, right: -4, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.navy },
  avatarHint: { textAlign: 'center', fontSize: 12, color: colors.accent, fontWeight: '600', marginBottom: spacing.xl },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 15 },
  disabledInput: { opacity: 0.6 },
  disabledText: { color: colors.muted, fontSize: 15 },
  hint: { fontSize: 11, color: colors.muted, marginTop: 6 },
  saveBtn: { marginTop: spacing.xxl, borderRadius: radius.lg, overflow: 'hidden' },
  saveGrad: { paddingVertical: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
