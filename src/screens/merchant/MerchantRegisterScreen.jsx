// src/screens/merchant/MerchantRegisterScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import * as ImagePicker    from 'expo-image-picker';
import { colors, radius, spacing } from '../../theme';

const COMMUNES = [
  'Gombe','Lingwala','Kinshasa','Barumbu','Kalamu',
  'Lemba','Matete','Ndjili','Masina','Kimbanseke',
  'Bumbu','Selembao','Ngaliema','Mont-Ngafula',
];

const STEPS = ['Identité','Boutique','Plan','Paiement'];

export default function MerchantRegisterScreen({ navigation }) {
  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 — Identité
  const [fullName,    setFullName]    = useState('');
  const [idNumber,    setIdNumber]    = useState('');
  const [phone,       setPhone]       = useState('');
  const [idDocUri,    setIdDocUri]    = useState(null);

  // Step 1 — Boutique
  const [shopName,    setShopName]    = useState('');
  const [address,     setAddress]     = useState('');
  const [commune,     setCommune]     = useState('');
  const [description, setDescription]= useState('');
  const [category,    setCategory]    = useState('');

  // Step 2 — Plan
  const [plan, setPlan] = useState('pro');

  const pickIdDocument = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setIdDocUri(result.assets[0].uri);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!fullName || !idNumber || !phone) {
        Alert.alert('Champs manquants', 'Remplis tous les champs obligatoires.');
        return false;
      }
      if (!idDocUri) {
        Alert.alert('Document requis', 'Prends une photo de ta pièce d\'identité.');
        return false;
      }
    }
    if (step === 1) {
      if (!shopName || !address || !commune) {
        Alert.alert('Champs manquants', 'Nom, adresse et commune sont obligatoires.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else submitRegistration();
  };

  const submitRegistration = async () => {
    setLoading(true);
    try {
      // TODO: appel API réel
      await new Promise(r => setTimeout(r, 2000));
      Alert.alert(
        '🎉 Boutique créée !',
        'Votre boutique est en cours de vérification.\nNous activons votre compte sous 24h.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Créer ma boutique</Text>
        </View>

        {/* Étapes */}
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepDot,
                  i < step  && styles.stepDone,
                  i === step && styles.stepActive,
                ]}>
                  {i < step
                    ? <Ionicons name="checkmark" size={14} color="#fff" />
                    : <Text style={[styles.stepNum, i === step && { color: '#000' }]}>{i + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, i === step && { color: colors.gold }]}>{s}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ══ STEP 0 — IDENTITÉ ══ */}
        {step === 0 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>🪪 Identité du commerçant</Text>
            <Text style={styles.sectionSub}>Ces informations sont requises pour la sécurité de la plateforme.</Text>

            <Field label="Nom complet *" placeholder="Ex: Jean-Paul Mwamba" value={fullName} onChangeText={setFullName} />
            <Field label="Numéro CNI / Passeport *" placeholder="Ex: 1234567890" value={idNumber} onChangeText={setIdNumber} keyboardType="default" />
            <Field label="Numéro de téléphone *" placeholder="+243 8X XXX XX XX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <Text style={styles.fieldLabel}>Photo de la pièce d'identité *</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={pickIdDocument}>
              {idDocUri ? (
                <View style={styles.uploadDone}>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                  <Text style={styles.uploadDoneText}>Document ajouté ✓</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Appuyer pour changer</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={36} color={colors.muted} />
                  <Text style={styles.uploadText}>Prendre une photo de votre CNI ou Passeport</Text>
                  <Text style={styles.uploadCta}>📷 Ouvrir l'appareil photo</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={16} color={colors.bright} />
              <Text style={styles.infoText}>Vos données sont chiffrées et ne seront jamais partagées avec des tiers.</Text>
            </View>
          </View>
        )}

        {/* ══ STEP 1 — BOUTIQUE ══ */}
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>🏪 Informations de la boutique</Text>
            <Text style={styles.sectionSub}>L'adresse physique est essentielle pour que les livreurs puissent récupérer vos colis.</Text>

            <Field label="Nom de la boutique *" placeholder="Ex: Mode Kin" value={shopName} onChangeText={setShopName} />
            <Field label="Description" placeholder="Décrivez votre boutique..." value={description} onChangeText={setDescription} multiline />
            <Field label="Adresse complète *" placeholder="Av. du Commerce, N°12, Quartier..." value={address} onChangeText={setAddress} />

            <Text style={styles.fieldLabel}>Commune de Kinshasa *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {COMMUNES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.communeChip, commune === c && styles.communeChipActive]}
                    onPress={() => setCommune(c)}
                  >
                    <Text style={[styles.communeText, commune === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Catégorie principale</Text>
            <View style={styles.catGrid}>
              {['Mode 👗','Tech 📱','Alimentaire 🥩','Beauté 💄','Maison 🏠','Autres 📦'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, category === cat && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.infoBox, { borderColor: 'rgba(0,229,160,0.2)', backgroundColor: 'rgba(0,229,160,0.05)' }]}>
              <Ionicons name="location" size={16} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.success }]}>L'adresse sera visible uniquement par les livreurs WapiPay, jamais par les clients.</Text>
            </View>
          </View>
        )}

        {/* ══ STEP 2 — PLAN ══ */}
        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>💳 Choisir votre abonnement</Text>
            <Text style={styles.sectionSub}>Vous pouvez changer de plan à tout moment.</Text>

            <TouchableOpacity style={[styles.planCard, plan === 'starter' && styles.planActive]} onPress={() => setPlan('starter')}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Starter</Text>
                <View style={[styles.radio, plan === 'starter' && styles.radioActive]}>
                  {plan === 'starter' && <View style={styles.radioDot} />}
                </View>
              </View>
              <Text style={styles.planPrice}>$5<Text style={styles.planPer}>/mois</Text></Text>
              <View style={styles.planFeatures}>
                {['Jusqu\'à 50 produits','Support par email','Statistiques de base','Badge boutique'].map(f => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.muted} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planCard, plan === 'pro' && styles.planActive, styles.planPro]} onPress={() => setPlan('pro')}>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>⭐ RECOMMANDÉ</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.gold }]}>Pro</Text>
                <View style={[styles.radio, plan === 'pro' && styles.radioActive]}>
                  {plan === 'pro' && <View style={styles.radioDot} />}
                </View>
              </View>
              <Text style={[styles.planPrice, { color: colors.gold }]}>$10<Text style={styles.planPer}>/mois</Text></Text>
              <View style={styles.planFeatures}>
                {['Produits illimités','Support prioritaire 24/7','Analytics avancés','Badge vérifié Premium','Mise en avant dans les résultats'].map(f => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.gold} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="card-outline" size={16} color={colors.bright} />
              <Text style={styles.infoText}>Frais d'ouverture uniques : $15 + premier mois. Renouvelable chaque mois via Mobile Money.</Text>
            </View>
          </View>
        )}

        {/* ══ STEP 3 — PAIEMENT ══ */}
        {step === 3 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>💰 Paiement d'activation</Text>
            <Text style={styles.sectionSub}>Votre boutique sera activée sous 24h après vérification.</Text>

            <View style={styles.invoiceCard}>
              <Text style={styles.invoiceTitle}>Récapitulatif</Text>
              <View style={styles.invoiceRow}><Text style={styles.invoiceLabel}>Frais d'ouverture (uniques)</Text><Text style={styles.invoiceVal}>$15</Text></View>
              <View style={styles.invoiceRow}><Text style={styles.invoiceLabel}>Abonnement {plan} (1er mois)</Text><Text style={styles.invoiceVal}>{plan === 'pro' ? '$10' : '$5'}</Text></View>
              <View style={[styles.invoiceRow, { borderBottomWidth: 0, marginTop: 8 }]}>
                <Text style={[styles.invoiceLabel, { fontWeight: '800', color: colors.text }]}>TOTAL</Text>
                <Text style={[styles.invoiceVal, { color: colors.gold, fontSize: 20, fontWeight: '900' }]}>{plan === 'pro' ? '$25' : '$20'}</Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Payer via Mobile Money</Text>
            {[
              { id: 'mpesa', name: 'M-Pesa (Vodacom)', emoji: '💚' },
              { id: 'airtel', name: 'Airtel Money',    emoji: '🔴' },
              { id: 'orange', name: 'Orange Money',    emoji: '🟠' },
            ].map(m => (
              <TouchableOpacity key={m.id} style={styles.methodItem}>
                <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                <Text style={styles.methodName}>{m.name}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bouton suivant */}
        <TouchableOpacity
          style={styles.nextBtnWrap}
          onPress={handleNext}
          disabled={loading}
        >
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.nextBtn}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>
                  {step < STEPS.length - 1 ? `Continuer → (${step + 1}/${STEPS.length})` : '🚀 Créer ma boutique'}
                </Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// Composant champ générique
function Field({ label, placeholder, value, onChangeText, keyboardType = 'default', multiline = false }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 52 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.xl },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },

  stepsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot:  { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepActive:{ backgroundColor: colors.gold, borderColor: colors.gold },
  stepNum:  { fontSize: 12, fontWeight: '700', color: colors.muted },
  stepLabel:{ fontSize: 9, color: colors.muted, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: colors.accent },

  formSection: { gap: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  sectionSub:   { fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: spacing.lg },

  fieldLabel: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 14 },

  uploadBox: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: 8, backgroundColor: 'rgba(17,32,102,0.3)', marginBottom: spacing.md },
  uploadText: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  uploadCta:  { fontSize: 12, color: colors.accent, fontWeight: '700' },
  uploadDone: { alignItems: 'center', gap: 6 },
  uploadDoneText: { color: colors.success, fontWeight: '700', fontSize: 14 },

  infoBox: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(77,110,255,0.08)', borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm, marginBottom: spacing.md },
  infoText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 18 },

  communeChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  communeChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  communeText: { fontSize: 12, color: colors.muted, fontWeight: '600' },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  catChipActive: { backgroundColor: colors.mid, borderColor: colors.accent },
  catText: { fontSize: 12, color: colors.muted, fontWeight: '600' },

  planCard:  { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, position: 'relative' },
  planPro:   { borderColor: 'rgba(255,184,48,0.3)', backgroundColor: 'rgba(255,184,48,0.05)' },
  planActive:{ borderColor: colors.accent },
  planHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName:  { fontSize: 16, fontWeight: '800', color: colors.text },
  planPrice: { fontSize: 28, fontWeight: '900', color: colors.bright, marginBottom: spacing.md },
  planPer:   { fontSize: 14, fontWeight: '400', color: colors.muted },
  planFeatures: { gap: 6 },
  featureRow:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText:{ fontSize: 12, color: colors.muted },
  recommendedBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  recommendedText: { fontSize: 9, fontWeight: '900', color: '#000', letterSpacing: 0.5 },
  radio:     { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive:{ borderColor: colors.accent },
  radioDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },

  invoiceCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  invoiceTitle:{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  invoiceRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(77,110,255,0.08)' },
  invoiceLabel:{ fontSize: 13, color: colors.muted },
  invoiceVal:  { fontSize: 13, fontWeight: '700', color: colors.text },

  methodItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 10 },
  methodName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },

  nextBtnWrap: { marginTop: spacing.xl, borderRadius: radius.lg, overflow: 'hidden', shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  nextBtn:    { paddingVertical: 16, alignItems: 'center' },
  nextBtnText:{ color: '#fff', fontSize: 16, fontWeight: '700' },
});
