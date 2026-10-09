import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { useDispatch }     from 'react-redux';
import { loginSuccess }    from '../../store/slices/authSlice';
import { colors, radius, spacing } from '../../theme';
import api, { saveToken } from '../../services/api';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [phone,   setPhone]   = useState('');
  const [pin,     setPin]     = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !pin) {
      Alert.alert('Erreur', 'Remplis tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        phone: '+243' + phone,
        pin,
      });
      // ═══ CORRECTION ═══
      // saveToken() (au lieu d ecrire directement dans SecureStore)
      // met a jour EN MEME TEMPS le token garde en memoire dans
      // services/api.js ET le stockage securise. Ecrire seulement
      // dans SecureStore laissait l ancien token actif en memoire
      // jusqu au prochain redemarrage complet de l app, ce qui
      // provoquait des requetes authentifiees avec le mauvais compte
      // apres un changement de compte dans la meme session.
      await saveToken(response.token);
      dispatch(loginSuccess({
        token: response.token,
        user:  response.user,
      }));
   } catch (e) {
      // ═══ CORRECTION ═══
      // Avant, toute erreur sans la forme attendue (ex: le serveur
      // injoignable) affichait silencieusement "Numero ou PIN
      // incorrect", meme quand le vrai probleme etait un souci
      // reseau. Maintenant on distingue clairement les deux cas.
      if (e?.error) {
        Alert.alert('Erreur', e.error);
      } else {
        Alert.alert(
          'Connexion impossible',
          'Impossible de joindre le serveur WapiPay. Verifie ta connexion et l adresse configuree dans .env.'
        );
      }
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
          <Text style={styles.title}>Connexion</Text>
        </View>
        <Text style={styles.subtitle}>Bienvenue sur WapiPay</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Numero de telephone</Text>
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

          <Text style={[styles.label, { marginTop: spacing.lg }]}>PIN WapiPay (6 chiffres)</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed" size={18} color={colors.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="• • • • • •"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              secureTextEntry={!showPin}
              value={pin}
              onChangeText={setPin}
              maxLength={6}
            />
            <TouchableOpacity onPress={() => setShowPin(!showPin)}>
              <Ionicons name={showPin ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPin}>
            <Text style={styles.forgotText}>PIN oublie ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.btnWrap}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.btn}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Se connecter</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerRow}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Pas encore de compte ?{' '}
            <Text style={styles.registerLink}>Creer un compte</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.merchantRow}
          onPress={() => navigation.navigate('MerchantRegister')}
        >
          <Text style={styles.merchantText}>Ouvrir ma boutique sur WapiPay</Text>
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
  forgotPin: { alignSelf: 'flex-end', marginTop: 8 },
  forgotText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  btnWrap: { marginTop: spacing.xxl, borderRadius: radius.lg, overflow: 'hidden', shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btn: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { marginTop: spacing.xl, alignItems: 'center' },
  registerText: { color: colors.muted, fontSize: 13 },
  registerLink: { color: colors.accent, fontWeight: '700' },
  merchantRow: { marginTop: spacing.lg, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  merchantText: { color: colors.gold, fontSize: 13, fontWeight: '600' },
});
