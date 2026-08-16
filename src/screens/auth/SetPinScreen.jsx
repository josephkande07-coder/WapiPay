import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { useDispatch }     from 'react-redux';
import { loginSuccess }    from '../../store/slices/authSlice';
import { colors, radius, spacing } from '../../theme';
import api, { saveToken } from '../../services/api';

const PIN_LENGTH = 6;

export default function SetPinScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { phone, fullName } = route.params || {};
  const [pin,        setPin]        = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [step,       setStep]       = useState('create');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKey = async (key) => {
    if (step === 'create') {
      if (key === 'del') { setPin(p => p.slice(0, -1)); return; }
      if (pin.length >= PIN_LENGTH) return;
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => setStep('confirm'), 300);
      }
    } else {
      if (key === 'del') { setPinConfirm(p => p.slice(0, -1)); return; }
      if (pinConfirm.length >= PIN_LENGTH) return;
      const newConfirm = pinConfirm + key;
      setPinConfirm(newConfirm);
      if (newConfirm.length === PIN_LENGTH) {
        if (newConfirm === pin) {
          try {
            const response = await api.post('/auth/register', {
              phone,
              fullName,
              pin: newConfirm,
            });
            // ═══ CORRECTION : saveToken() au lieu de SecureStore direct ═══
            await saveToken(response.token);
            dispatch(loginSuccess({
              token: response.token,
              user:  response.user,
            }));
          } catch (e) {
            Alert.alert('Erreur', e?.error || 'Inscription echouee. Reessaie.');
            setPinConfirm('');
            setPin('');
            setStep('create');
          }
        } else {
          shake();
          Alert.alert('PIN incorrect', 'Les deux PIN ne correspondent pas. Reessaie.');
          setPinConfirm('');
          setPin('');
          setStep('create');
        }
      }
    }
  };

  const currentPin = step === 'create' ? pin : pinConfirm;

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <LinearGradient colors={[colors.accent, colors.bright]} style={styles.iconBox}>
          <Ionicons name="lock-closed" size={36} color="#fff" />
        </LinearGradient>
      </View>

      <Text style={styles.title}>
        {step === 'create' ? 'Creer votre PIN' : 'Confirmer votre PIN'}
      </Text>
      <Text style={styles.subtitle}>
        {step === 'create'
          ? 'Choisissez un code PIN a 6 chiffres\npour securiser votre compte'
          : 'Retapez votre PIN pour confirmer'
        }
      </Text>

      <Animated.View style={[styles.pinDots, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.pinDot, i < currentPin.length && styles.pinDotFilled]} />
        ))}
      </Animated.View>

      <View style={styles.numpad}>
        {['1','2','3','4','5','6','7','8','9','','0','del'].map((key, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.numKey, key === '' && styles.numKeyEmpty]}
            onPress={() => key && handleKey(key)}
            disabled={key === ''}
          >
            {key === 'del'
              ? <Ionicons name="backspace-outline" size={24} color={colors.danger} />
              : <Text style={styles.numKeyText}>{key}</Text>
            }
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.secNote}>
        <Ionicons name="shield-checkmark" size={14} color={colors.success} />
        <Text style={styles.secNoteText}>PIN chiffre et securise sur votre appareil</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: 60, alignItems: 'center' },
  back: { alignSelf: 'flex-start', width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  iconWrap: { marginBottom: spacing.xl },
  iconBox: { width: 80, height: 80, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
  pinDots: { flexDirection: 'row', gap: 16, marginBottom: spacing.xxl },
  pinDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  pinDotFilled: { backgroundColor: colors.accent, borderColor: colors.accent },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: '85%', gap: 14 },
  numKey: { width: '28%', height: 62, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  numKeyEmpty: { backgroundColor: 'transparent', borderWidth: 0 },
  numKeyText: { fontSize: 24, fontWeight: '700', color: colors.text },
  secNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xl },
  secNoteText: { fontSize: 12, color: colors.muted },
});
