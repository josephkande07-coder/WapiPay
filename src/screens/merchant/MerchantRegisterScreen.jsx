import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert,
  ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import * as ImagePicker    from 'expo-image-picker';
import { colors, radius, spacing } from '../../theme';
import api, { saveToken } from '../../services/api';

const COMMUNES = [
  'Gombe','Lingwala','Kinshasa','Barumbu','Kalamu',
  'Lemba','Matete','Ndjili','Masina','Kimbanseke',
  'Bumbu','Selembao','Ngaliema','Mont-Ngafula',
];

const ID_TYPES = [
  { id: 'cni',       label: 'Carte Nationale d Identite' },
  { id: 'passeport', label: 'Passeport' },
  { id: 'permis',    label: 'Permis de conduire' },
  { id: 'titre',     label: 'Titre de sejour' },
  { id: 'electeur',  label: 'Carte d electeur' },
];

const STEPS = ['Identite','Boutique','Plan','Paiement'];

export default function MerchantRegisterScreen({ navigation }) {
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 - Identite
  const [fullName,  setFullName]  = useState('');
  const [idNumber,  setIdNumber]  = useState('');
  const [idType,    setIdType]    = useState('cni');
  const [phone,     setPhone]     = useState('');
  const [idDocUri,  setIdDocUri]  = useState(null);

  // Step 1 - Boutique
  const [shopName,       setShopName]       = useState('');
  const [address,        setAddress]        = useState('');
  const [commune,        setCommune]        = useState('');
  const [description,    setDescription]    = useState('');
  const [category,       setCategory]       = useState('');
  const [shopLogoUri,    setShopLogoUri]    = useState(null);
  const [shopLogoBase64, setShopLogoBase64] = useState(null);

  // Step 2 - Plan
  const [plan, setPlan] = useState('pro');

  // ═══ Permissions et selection - piece d identite ═══
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Va dans les parametres de ton telephone et autorise WapiPay a acceder a ta galerie.');
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Va dans les parametres de ton telephone et autorise WapiPay a utiliser la camera.');
      return false;
    }
    return true;
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!result.canceled && result.assets[0]) {
        setIdDocUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d ouvrir la galerie.');
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
      });
      if (!result.canceled && result.assets[0]) {
        setIdDocUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d ouvrir la camera.');
    }
  };

  const showImageOptions = () => {
    Alert.alert('Ajouter une photo', 'Choisis une option', [
      { text: 'Prendre une photo', onPress: takePhoto },
      { text: 'Depuis la galerie', onPress: pickFromGallery },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  // ═══ Photo de la boutique ═══
  const pickShopLogo = () => {
    Alert.alert('Photo de la boutique', 'Choisis une option', [
      { text: 'Prendre une photo', onPress: () => launchShopLogoPicker('camera') },
      { text: 'Depuis la galerie', onPress: () => launchShopLogoPicker('gallery') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const launchShopLogoPicker = async (source) => {
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
      setShopLogoUri(result.assets[0].uri);
      setShopLogoBase64('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!fullName || !idNumber || !phone) {
        Alert.alert('Champs manquants', 'Remplis tous les champs obligatoires.');
        return false;
      }
      if (!idDocUri) {
        Alert.alert('Document requis', 'Ajoute une photo de ta piece d identite.');
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
      // ═══ ETAPE 1 : creer le compte utilisateur ═══
      // On ne peut pas creer une boutique (POST /shops) sans etre
      // authentifie - il faut donc d abord un vrai compte + un token.
      // PIN temporaire : le marchand doit le changer ensuite depuis
      // Profil > Changer mon PIN (message affiche a la fin).
      const registerRes = await api.post('/auth/register', {
        phone:    '+243' + phone,
        fullName: fullName,
        pin:      '000000',
      });

      // ═══ ETAPE 2 : sauvegarder le token correctement ═══
      // saveToken() met a jour EN MEME TEMPS le token garde en memoire
      // dans services/api.js et le stockage securise, pour que la
      // requete suivante (creation de boutique) soit bien authentifiee.
      await saveToken(registerRes.token);

      // ═══ ETAPE 3 : creer la boutique, maintenant authentifie ═══
      await api.post('/shops', {
        name:        shopName,
        description,
        category,
        address,
        commune,
        idNational:  idNumber,
        plan:        plan.toUpperCase(),
        logoUrl:     shopLogoBase64,
      });

      Alert.alert(
        'Boutique creee !',
        'Votre boutique est en cours de verification sous 24h.\n\nConnectez-vous avec votre numero et le PIN temporaire : 000000\n\nPensez a le changer dans Profil > Changer mon PIN !',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      Alert.alert('Erreur', e?.error || 'Une erreur est survenue. Reessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Creer ma boutique</Text>
        </View>

        {/* Indicateur etapes */}
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, i < step && styles.stepDone, i === step && styles.stepActive]}>
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

        {/* STEP 0 - IDENTITE */}
        {step === 0 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Identite du commercant</Text>
            <Text style={styles.sectionSub}>Ces informations sont requises pour la securite.</Text>

            <Text style={styles.label}>Nom complet *</Text>
            <TextInput style={styles.input} placeholder="Ex: Jean-Paul Mwamba" placeholderTextColor={colors.muted} value={fullName} onChangeText={setFullName} />

            <Text style={styles.label}>Type de piece d identite *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {ID_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.idTypeChip, idType === t.id && styles.idTypeChipActive]}
                    onPress={() => setIdType(t.id)}
                  >
                    <Text style={[styles.idTypeText, idType === t.id && { color: '#fff' }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Numero du document *</Text>
            <TextInput style={styles.input} placeholder="Ex: 1234567890" placeholderTextColor={colors.muted} value={idNumber} onChangeText={setIdNumber} />

            <Text style={styles.label}>Numero de telephone *</Text>
            <View style={styles.phoneWrap}>
              <Text style={styles.prefix}>+243</Text>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                placeholder="8X XXX XX XX"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={9}
              />
            </View>

            <Text style={styles.label}>Photo de la piece d identite *</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={showImageOptions}>
              {idDocUri ? (
                <View style={styles.uploadDone}>
                  <Image source={{ uri: idDocUri }} style={styles.previewImg} />
                  <View style={styles.changeOverlay}>
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.changeText}>Changer</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadEmpty}>
                  <Ionicons name="camera-outline" size={40} color={colors.muted} />
                  <Text style={styles.uploadText}>Appuyer pour ajouter une photo</Text>
                  <View style={styles.uploadBtns}>
                    <View style={styles.uploadBtnItem}>
                      <Ionicons name="camera" size={16} color={colors.accent} />
                      <Text style={styles.uploadBtnText}>Camera</Text>
                    </View>
                    <View style={styles.uploadBtnItem}>
                      <Ionicons name="image" size={16} color={colors.bright} />
                      <Text style={styles.uploadBtnText}>Galerie</Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={styles.infoText}>Tes donnees sont chiffrees et ne seront jamais partagees avec des tiers.</Text>
            </View>
          </View>
        )}

        {/* STEP 1 - BOUTIQUE */}
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informations de la boutique</Text>
            <Text style={styles.sectionSub}>L adresse physique permet aux livreurs de recuperer vos colis.</Text>

            <Text style={styles.label}>Photo de la boutique (optionnel)</Text>
            <TouchableOpacity style={styles.logoPickerBox} onPress={pickShopLogo}>
              {shopLogoUri ? (
                <Image source={{ uri: shopLogoUri }} style={styles.logoPickerImg} />
              ) : (
                <View style={styles.logoPickerEmpty}>
                  <Ionicons name="camera-outline" size={28} color={colors.muted} />
                  <Text style={styles.logoPickerText}>Ajouter une photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Nom de la boutique *</Text>
            <TextInput style={styles.input} placeholder="Ex: Mode Kin" placeholderTextColor={colors.muted} value={shopName} onChangeText={setShopName} />

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Decrivez votre boutique..." placeholderTextColor={colors.muted} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.label}>Adresse complete *</Text>
            <TextInput style={styles.input} placeholder="Av., Quartier, N..." placeholderTextColor={colors.muted} value={address} onChangeText={setAddress} />

            <Text style={styles.label}>Commune *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {COMMUNES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.idTypeChip, commune === c && styles.idTypeChipActive]}
                    onPress={() => setCommune(c)}
                  >
                    <Text style={[styles.idTypeText, commune === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Categorie</Text>
            <View style={styles.catGrid}>
              {['Mode','Tech','Alimentaire','Beaute','Maison','Sport','Autres'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.idTypeChip, category === cat && styles.idTypeChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.idTypeText, category === cat && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 2 - PLAN */}
        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Choisir votre abonnement</Text>
            <Text style={styles.sectionSub}>Vous pouvez changer de plan a tout moment.</Text>

            <TouchableOpacity style={[styles.planCard, plan === 'starter' && styles.planActive]} onPress={() => setPlan('starter')}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Starter</Text>
                <View style={[styles.radio, plan === 'starter' && styles.radioActive]}>
                  {plan === 'starter' && <View style={styles.radioDot} />}
                </View>
              </View>
              <Text style={styles.planPrice}>$5<Text style={styles.planPer}>/mois</Text></Text>
              {['Jusqu a 50 produits','Support par email','Stats de base'].map(f => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.muted} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planCard, plan === 'pro' && styles.planActive, { borderColor: 'rgba(255,184,48,0.3)' }]} onPress={() => setPlan('pro')}>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>RECOMMANDE</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.gold }]}>Pro</Text>
                <View style={[styles.radio, plan === 'pro' && styles.radioActive]}>
                  {plan === 'pro' && <View style={styles.radioDot} />}
                </View>
              </View>
              <Text style={[styles.planPrice, { color: colors.gold }]}>$10<Text style={styles.planPer}>/mois</Text></Text>
              {['Produits illimites','Support prioritaire 24/7','Analytics avances','Badge verifie Premium'].map(f => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.gold} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3 - PAIEMENT */}
        {step === 3 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Paiement d activation</Text>
            <Text style={styles.sectionSub}>Votre boutique sera activee sous 24h apres verification.</Text>

            <View style={styles.invoiceCard}>
              <Text style={styles.invoiceTitle}>Recapitulatif</Text>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Frais d ouverture (uniques)</Text>
                <Text style={styles.invoiceVal}>$15</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Abonnement {plan} (1er mois)</Text>
                <Text style={styles.invoiceVal}>{plan === 'pro' ? '$10' : '$5'}</Text>
              </View>
              <View style={[styles.invoiceRow, { borderBottomWidth: 0, marginTop: 8 }]}>
                <Text style={[styles.invoiceLabel, { fontWeight: '800', color: colors.text }]}>TOTAL</Text>
                <Text style={[styles.invoiceVal, { color: colors.gold, fontSize: 20 }]}>{plan === 'pro' ? '$25' : '$20'}</Text>
              </View>
            </View>

            <Text style={styles.label}>Payer via Mobile Money</Text>
            {[
              { id: 'mpesa',  name: 'M-Pesa (Vodacom)' },
              { id: 'airtel', name: 'Airtel Money' },
              { id: 'orange', name: 'Orange Money' },
            ].map(m => (
              <TouchableOpacity key={m.id} style={styles.methodItem}>
                <Text style={styles.methodName}>{m.name}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.nextBtnWrap} onPress={handleNext} disabled={loading}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.nextBtn}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>
                  {step < STEPS.length - 1 ? 'Continuer (' + (step + 1) + '/' + STEPS.length + ')' : 'Creer ma boutique'}
                </Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 52 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.xl },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  stepsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepNum: { fontSize: 12, fontWeight: '700', color: colors.muted },
  stepLabel: { fontSize: 9, color: colors.muted, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 14 },
  stepLineDone: { backgroundColor: colors.accent },
  formSection: {},
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6 },
  sectionSub: { fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: spacing.lg },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 13 },
  phoneWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, height: 52 },
  prefix: { color: colors.text, fontWeight: '700', marginRight: 8 },
  idTypeChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  idTypeChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  idTypeText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  uploadBox: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md, backgroundColor: 'rgba(17,32,102,0.3)' },
  uploadEmpty: { padding: spacing.xl, alignItems: 'center', gap: 8 },
  uploadText: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  uploadBtns: { flexDirection: 'row', gap: 20, marginTop: 8 },
  uploadBtnItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  uploadBtnText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  uploadDone: { height: 200, position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  changeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, alignItems: 'center', gap: 4 },
  changeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  infoBox: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(0,229,160,0.08)', borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)', marginTop: spacing.sm },
  infoText: { flex: 1, fontSize: 12, color: colors.success, lineHeight: 18 },
  logoPickerBox: { width: 90, height: 90, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  logoPickerImg: { width: '100%', height: '100%' },
  logoPickerEmpty: { width: '100%', height: '100%', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  logoPickerText: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  planCard: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, position: 'relative' },
  planActive: { borderColor: colors.accent },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName: { fontSize: 16, fontWeight: '800', color: colors.text },
  planPrice: { fontSize: 28, fontWeight: '900', color: colors.bright, marginBottom: spacing.md },
  planPer: { fontSize: 14, fontWeight: '400', color: colors.muted },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  featureText: { fontSize: 12, color: colors.muted },
  recommendedBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  recommendedText: { fontSize: 9, fontWeight: '900', color: '#000' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  invoiceCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  invoiceTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(77,110,255,0.08)' },
  invoiceLabel: { fontSize: 13, color: colors.muted },
  invoiceVal: { fontSize: 13, fontWeight: '700', color: colors.text },
  methodItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 10 },
  methodName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  nextBtnWrap: { marginTop: spacing.xl, borderRadius: radius.lg, overflow: 'hidden' },
  nextBtn: { paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
