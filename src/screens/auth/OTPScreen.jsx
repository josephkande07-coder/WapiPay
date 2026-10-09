// src/screens/auth/OTPScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { authAPI } from '../../services/api';

export default function OTPScreen({ navigation, route }) {
  const { phone, fullName } = route.params || {};
  const [otp,     setOtp]     = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer,   setTimer]   = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    if (newOtp.every(d => d !== '')) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code) => {
    setLoading(true);
    try {
      const result = await authAPI.verifyOTP(phone, code);
      navigation.navigate('SetPin', {
        phone: result.phone || phone,
        fullName,
        otpToken: result.otpToken,
      });
    } catch (e) {
      Alert.alert('Code incorrect', e?.error || 'Le code OTP est invalide. Reessaie.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await authAPI.sendOTP(phone);
      setTimer(60);
      Alert.alert('Code envoye', `Un nouveau code a ete envoye au ${phone}`);
    } catch (e) {
      Alert.alert('Erreur', e?.error || 'Impossible de renvoyer le code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <Text style={styles.smsIcon}>📱</Text>
      </View>

      <Text style={styles.title}>Vérification SMS</Text>
      <Text style={styles.subtitle}>
        Code envoyé au{'\n'}
        <Text style={styles.phone}>{phone}</Text>
      </Text>

      {/* Champs OTP */}
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={r => inputs.current[index] = r}
            style={[styles.otpInput, digit && styles.otpInputFilled]}
            value={digit}
            onChangeText={t => handleOtpChange(t.slice(-1), index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Vérification en cours...</Text>
        </View>
      )}

      {/* Renvoyer le code */}
      <TouchableOpacity style={styles.resendRow} onPress={resendOTP} disabled={timer > 0}>
        <Text style={styles.resendText}>
          {timer > 0
            ? `Renvoyer le code dans ${timer}s`
            : <Text style={styles.resendLink}>Renvoyer le code</Text>
          }
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark" size={16} color={colors.success} />
        <Text style={styles.infoText}>Ce code expire dans 10 minutes.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  iconWrap: { alignItems: 'center', marginBottom: spacing.lg },
  smsIcon: { fontSize: 64 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
  phone: { color: colors.accent, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: spacing.xl },
  otpInput: { width: 48, height: 58, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, textAlign: 'center', fontSize: 24, fontWeight: '800', color: colors.text },
  otpInputFilled: { borderColor: colors.accent, backgroundColor: 'rgba(26,58,255,0.1)' },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: spacing.lg },
  loadingText: { color: colors.muted, fontSize: 13 },
  resendRow: { alignItems: 'center', marginBottom: spacing.xl },
  resendText: { color: colors.muted, fontSize: 13 },
  resendLink: { color: colors.accent, fontWeight: '700' },
  infoBox: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(0,229,160,0.08)', borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)' },
  infoText: { flex: 1, fontSize: 12, color: colors.success, lineHeight: 18 },
});
