import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart }       from '../../store/slices/cartSlice';
import { colors, radius, spacing } from '../../theme';
import { paymentsAPI } from '../../services/api';
import PaymentMethodIcon from '../../components/PaymentMethodIcon';

const PAYMENT_METHODS = [
  { id: 'mpesa',        name: 'M-Pesa',       desc: 'Vodacom M-Pesa' },
  { id: 'airtel_money', name: 'Airtel Money', desc: 'Airtel DRC' },
  { id: 'orange_money', name: 'Orange Money', desc: 'Orange RDC' },
];

const PIN_LENGTH = 6;

export default function PaymentScreen({ navigation, route }) {
  const dispatch  = useDispatch();
  const { user }  = useSelector(state => state.auth);
  const { order } = route.params || { order: { total: 9128, deliveryFee: 500, platformFee: 128 } };

  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [pin,            setPin]            = useState('');
  const [step,           setStep]           = useState('method');
  const [loading,        setLoading]        = useState(false);

  const shakeAnim    = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handlePinKey = (key) => {
    if (key === 'del') { setPin(p => p.slice(0, -1)); return; }
    if (pin.length >= PIN_LENGTH) return;
    const newPin = pin + key;
    setPin(newPin);
    if (newPin.length === PIN_LENGTH) submitPayment(newPin);
  };

  const submitPayment = async (finalPin) => {
    setLoading(true);
    setStep('processing');
    try {
      await paymentsAPI.initiate({
        orderId:       order.id,
        paymentMethod: selectedMethod,
        phoneNumber:   user?.phone || '+243000000000',
        pin:           finalPin,
      });
      setStep('success');
      dispatch(clearCart());
      Animated.spring(successScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
    } catch (e) {
      setPin('');
      setStep('pin');
      shake();
      Alert.alert('Paiement echoue', e?.error || 'PIN incorrect ou solde insuffisant.');
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('Accueil', { screen: 'HomeMain' });
    else navigation.navigate('HomeMain');
  };

  const goToOrders = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('Commandes', { screen: 'OrdersMain' });
    else navigation.navigate('OrdersMain');
  };

  if (step === 'success') {
    return (
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.successContainer}>
        <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
          <LinearGradient colors={['#00E5A0', '#00B87A']} style={styles.successGradient}>
            <Ionicons name="checkmark" size={60} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.successTitle}>Paiement reussi !</Text>
        <Text style={styles.successAmount}>{order.total?.toLocaleString()} CDF</Text>
        <Text style={styles.successSub}>
          Votre commande a ete confirmee.{'\n'}Le marchand prepare votre colis.
        </Text>
        <TouchableOpacity style={styles.successBtn} onPress={goToOrders}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.btnGrad}>
            <Text style={styles.btnText}>Suivre ma commande</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToHome} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Retour a l accueil</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (step === 'processing') {
    return (
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.successContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.successTitle, { marginTop: 24 }]}>Traitement en cours...</Text>
        <Text style={styles.successSub}>Verification du paiement en cours.{'\n'}Ne quittez pas cet ecran.</Text>
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={styles.securityText}>Connexion securisee SSL 256-bit</Text>
        </View>
      </LinearGradient>
    );
  }

  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paiement securise</Text>
          <View style={styles.secBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.success} />
            <Text style={styles.secBadgeText}>Securise</Text>
          </View>
        </LinearGradient>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resume de la commande</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryVal}>{(order.total - order.deliveryFee - order.platformFee)?.toLocaleString()} CDF</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryVal}>{order.deliveryFee || 500} CDF</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frais service (1.5%)</Text>
            <Text style={styles.summaryVal}>{order.platformFee || 128} CDF</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>{(order.total || 9128).toLocaleString()} CDF</Text>
          </View>
        </View>

        {step === 'method' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mode de paiement</Text>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodItem, selectedMethod === m.id && styles.methodActive]}
                onPress={() => setSelectedMethod(m.id)}
              >
                <PaymentMethodIcon method={m.id} size={44} />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{m.name}</Text>
                  <Text style={styles.methodDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]}>
                  {selectedMethod === m.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.continueBtn} onPress={() => setStep('pin')}>
              <LinearGradient colors={[colors.accent, colors.bright]} style={styles.btnGrad}>
                <Text style={styles.btnText}>Continuer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 'pin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PIN WapiPay</Text>
            <Text style={styles.pinSubtitle}>
              Entrez votre code PIN a 6 chiffres pour confirmer le paiement via {method?.name}
            </Text>
            <Animated.View style={[styles.pinDots, { transform: [{ translateX: shakeAnim }] }]}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <View key={i} style={[styles.pinDot, i < pin.length && styles.pinDotFilled]} />
              ))}
            </Animated.View>
            <View style={styles.numpad}>
              {['1','2','3','4','5','6','7','8','9','','0','del'].map((key, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.numKey, key === '' && styles.numKeyEmpty]}
                  onPress={() => key && handlePinKey(key)}
                  disabled={key === '' || loading}
                >
                  {key === 'del'
                    ? <Ionicons name="backspace-outline" size={22} color={colors.danger} />
                    : <Text style={styles.numKeyText}>{key}</Text>
                  }
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={{ alignItems: 'center', marginTop: spacing.md }} onPress={() => setStep('method')}>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Changer de methode</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.secRow}>
          <View style={styles.secItem}><Ionicons name="shield-checkmark" size={14} color={colors.success} /><Text style={styles.secItemText}>SSL 256-bit</Text></View>
          <View style={styles.secItem}><Ionicons name="phone-portrait" size={14} color={colors.success} /><Text style={styles.secItemText}>2FA SMS</Text></View>
          <View style={styles.secItem}><Ionicons name="eye-off" size={14} color={colors.success} /><Text style={styles.secItemText}>PIN chiffre</Text></View>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: 12 },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text },
  secBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,229,160,0.12)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  secBadgeText: { fontSize: 10, color: colors.success, fontWeight: '700' },
  summaryCard: { margin: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(77,110,255,0.08)' },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryVal: { fontSize: 13, fontWeight: '600', color: colors.text },
  totalRow: { borderBottomWidth: 0, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  totalAmount: { fontSize: 20, fontWeight: '900', color: colors.gold },
  section: { paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 14 },
  methodItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 10 },
  methodActive: { borderColor: colors.accent, backgroundColor: 'rgba(26,58,255,0.10)' },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 14, fontWeight: '700', color: colors.text },
  methodDesc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  continueBtn: { marginTop: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pinSubtitle: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
  pinDots: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: spacing.xl },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  pinDotFilled: { backgroundColor: colors.accent, borderColor: colors.accent },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 30, gap: 12 },
  numKey: { width: '28%', height: 58, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  numKeyEmpty: { backgroundColor: 'transparent', borderWidth: 0 },
  numKeyText: { fontSize: 22, fontWeight: '700', color: colors.text },
  secRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  secItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  secItemText: { fontSize: 11, color: colors.muted },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  successCircle: { width: 130, height: 130, borderRadius: 65, overflow: 'hidden', marginBottom: spacing.xl },
  successGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' },
  successAmount: { fontSize: 36, fontWeight: '900', color: colors.gold, marginBottom: 12 },
  successSub: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
  successBtn: { width: '100%', borderRadius: radius.lg, overflow: 'hidden' },
  securityNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xl, backgroundColor: 'rgba(0,229,160,0.08)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  securityText: { color: colors.success, fontSize: 12, fontWeight: '600' },
});
