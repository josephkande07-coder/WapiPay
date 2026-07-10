// src/screens/auth/SplashScreen.jsx
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, fonts } from '../../theme';

const { height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoScale  = useRef(new Animated.Value(0)).current;
  const logoOpacity= useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(btnOpacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={styles.container}>
      {/* Cercles décoratifs */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Logo animé */}
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <LinearGradient colors={[colors.accent, colors.bright]} style={styles.logoBox}>
          <Text style={styles.logoW}>W</Text>
        </LinearGradient>
        <Text style={styles.brandName}>WapiPay</Text>
        <Text style={styles.brandTag}>
          La marketplace de confiance{'\n'}pour Kinshasa & l'Afrique
        </Text>
      </Animated.View>

      {/* Boutons */}
      <Animated.View style={[styles.btnWrap, { opacity: btnOpacity }]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.btnGradient}>
            <Text style={styles.btnText}>Créer un compte</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>Se connecter</Text>
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          🔒 Paiements sécurisés via Mobile Money{'\n'}
          <Text style={styles.operators}>M-Pesa · Airtel Money · Orange Money</Text>
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: spacing.xl,
  },
  circle1: {
    position: 'absolute', top: -80, left: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(26,58,255,0.10)',
  },
  circle2: {
    position: 'absolute', bottom: -60, right: -60,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(107,143,255,0.08)',
  },
  logoWrap: {
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: 40,
  },
  logoBox: {
    width: 110, height: 110,
    borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  logoW: {
    fontSize: 64, fontWeight: '900',
    color: '#fff', lineHeight: 70,
  },
  brandName: {
    fontSize: 34, fontWeight: '800',
    color: colors.text, letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  brandTag: {
    fontSize: 14, color: colors.muted,
    textAlign: 'center', lineHeight: 22,
  },
  btnWrap: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  btnPrimary: {
    width: '100%', borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16,
    elevation: 10,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff', fontSize: 16,
    fontWeight: '700', letterSpacing: 0.4,
  },
  btnOutline: {
    width: '100%', borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: colors.glow, fontSize: 16, fontWeight: '600',
  },
  securityNote: {
    fontSize: 12, color: colors.muted,
    textAlign: 'center', lineHeight: 20,
    marginTop: spacing.sm,
  },
  operators: {
    color: 'rgba(255,255,255,0.25)',
  },
});
