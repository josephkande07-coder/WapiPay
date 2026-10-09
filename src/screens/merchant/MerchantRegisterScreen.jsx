import React, { useState, useRef, useEffect } from 'react';
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

// ═══ NOUVEAU : 2 etapes ajoutees (Verification, PIN) entre l identite
// et les infos de boutique, pour que le marchand suive le meme parcours
// de securite que l acheteur (OTP reel + PIN choisi par lui, plus de
// verification contournee ni de PIN 000000 code en dur).
const STEPS = ['Identite','Verification','PIN','Boutique','Plan','Paiement'];
const PIN_LENGTH = 6;

export default function MerchantRegisterScreen({ navigation }) {
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 - Identite
  const [fullName,  setFullName]  = useState('');
  const [idNumber,  setIdNumber]  = useState('');
  const [idType,    setIdType]    = useState('cni');
  const [phone,     setPhone]     = useState('');
  const [idDocUri,  setIdDocUri]  = useState(null);
  const [idDocBase64, setIdDocBase64] = useState(null);

  // Step 1 - Verification OTP
  const [otpDigits,  setOtpDigits]  = useState(['','','','','','']);
  const [otpToken,   setOtpToken]   = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputs = useRef([]);

  // Step 2 - PIN
  const [pin,        setPin]        = useState('');
  const [pinConfirm,  setPinConfirm] = useState('');
  const [pinStep,     setPinStep]    = useState('create'); // 'create' | 'confirm'

  // Step 3 - Boutique
  const [shopName,       setShopName]       = useState('');
  const [address,        setAddress]        = useState('');
  const [commune,        setCommune]        = useState('');
  const [description,    setDescription]    = useState('');
  const [category,       setCategory]       = useState('');
  const [shopLogoUri,    setShopLogoUri]    = useState(null);
  const [shopLogoBase64, setShopLogoBase64] = useState(null);

  // Step 4 - Plan
  const [plan, setPlan] = useState('pro');

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ═══ Piece d identite ═══
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Autorise WapiPay a acceder a ta galerie.');
      return false;
    }
    return true;
  };
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Autorise WapiPay a utiliser la camera.');
      return false;
    }
    return true;
  };
  const pickFromGallery = async () => {
    if (!(await requestPermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setIdDocUri(result.assets[0].uri);
      setIdDocBase64('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };
  const takePhoto = async () => {
    if (!(await requestCameraPermission())) return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0]) {
      setIdDocUri(result.assets[0].uri);
      setIdDocBase64('data:image/jpeg;base64,' + result.assets[0].base64);
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
    const permissionFn = source === 'camera' ? ImagePicker.requestCameraPermissionsAsync : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await permissionFn();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Autorise WapiPay a acceder a ' + (source === 'camera' ? 'la camera' : 'ta galerie') + '.');
      return;
    }
    const launchFn = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await launchFn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0]) {
      setShopLogoUri(result.assets[0].uri);
      setShopLogoBase64('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  // ═══ OTP ═══
  const sendOtpCode = async () => {
    setSendingOtp(true);
    try {
      await api.post('/auth/send-otp', { phone: '+243' + phone });
      setResendTimer(60);
      setOtpDigits(['','','','','','']);
    } catch (e) {
      Alert.alert('Erreur', e?.error || 'Impossible d envoyer le code. Reessaie.');
    } finally {
      setSendingOtp(false);
    }
  };

  useEffect(() => {
    if (step === 1 && !otpToken) sendOtpCode();
  }, [step]);

  const handleOtpChange = (text, index) => {
    const digits = [...otpDigits];
    digits[index] = text;
    setOtpDigits(digits);
    if (text && index < 5) otpInputs.current[index + 1]?.focus();
    if (digits.every(d => d !== '')) verifyOtpCode(digits.join(''));
  };
  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };
  const verifyOtpCode = async (code) => {
    setVerifyingOtp(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone: '+243' + phone, otp: code });
      setOtpToken(res.otpToken);
      setTimeout(() => setStep(2), 300);
    } catch (e) {
      Alert.alert('Code incorrect', e?.error || 'Code OTP invalide. Reessaie.');
      setOtpDigits(['','','','','','']);
      otpInputs.current[0]?.focus();
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ═══ PIN ═══
  const handlePinKey = (key) => {
    if (pinStep === 'create') {
      if (key === 'del') { setPin(p => p.slice(0, -1)); return; }
      if (pin.length >= PIN_LENGTH) return;
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === PIN_LENGTH) setTimeout(() => setPinStep('confirm'), 200);
    } else {
      if (key === 'del') { setPinConfirm(p => p.slice(0, -1)); return; }
      if (pinConfirm.length >= PIN_LENGTH) return;
      const newConfirm = pinConfirm + key;
      setPinConfirm(newConfirm);
      if (newConfirm.length === PIN_LENGTH) {
        if (newConfirm === pin) {
          setTimeout(() => setStep(3), 200);
        } else {
          Alert.alert('PIN incorrect', 'Les deux PIN ne correspondent pas. Reessaie.');
          setPin('');
          setPinConfirm('');
          setPinStep('create');
        }
      }
    }
  };
  const currentPinValue = pinStep === 'create' ? pin : pinConfirm;

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
    if (step === 1 && !otpToken) {
      Alert.alert('Verification requise', 'Entre le code recu par SMS avant de continuer.');
      return false;
    }
    if (step === 2 && (pin.length !== PIN_LENGTH || pin !== pinConfirm)) {
      Alert.alert('PIN requis', 'Cree et confirme ton PIN a 6 chiffres.');
      return false;
    }
    if (step === 3) {
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
      const registerRes = await api.post('/auth/register', {
        phone: '+243' + phone,
        fullName,
        pin,
        otpToken,
      });
      await saveToken(registerRes.token);

      await api.post('/shops', {
        name: shopName, description, category, address, commune,
        idNational: idNumber, plan: plan.toUpperCase(),
        logoUrl: shopLogoBase64, idDocumentUrl: idDocBase64,
      });

      Alert.alert(
        'Boutique creee !',
        'Votre boutique est en cours de verification sous 24h.\n\nConnectez-vous avec votre numero et votre PIN.',
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

        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, i < step && styles.stepDone, i === step && styles.stepActive]}>
                  {i < step
                    ? <Ionicons name="checkmark" size={12} color="#fff" />
                    : <Text style={[styles.stepNum, i === step && { color: '#000' }]}>{i + 1}</Text>
                  }
                </View>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.currentStepLabel}>{STEPS[step]}</Text>

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
                  <TouchableOpacity key={t.id} style={[styles.idTypeChip, idType === t.id && styles.idTypeChipActive]} onPress={() => setIdType(t.id)}>
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
                placeholder="8X XXX XX XX" placeholderTextColor={colors.muted}
                keyboardType="phone-pad" value={phone} onChangeText={setPhone} maxLength={9}
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
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 1 - OTP */}
        {step === 1 && (
          <View style={styles.formSection}>
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <Text style={{ fontSize: 40, marginBottom: spacing.md }}>📱</Text>
              <Text style={styles.sectionTitle}>Verification du telephone</Text>
              <Text style={styles.sectionSub}>
                Code envoye au {'\n'}
                <Text style={{ color: colors.accent, fontWeight: '700' }}>+243{phone}</Text>
              </Text>
            </View>

            <View style={styles.otpRow}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={r => otpInputs.current[index] = r}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={t => handleOtpChange(t.slice(-1), index)}
                  onKeyPress={e => handleOtpKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  editable={!verifyingOtp}
                />
              ))}
            </View>

            {(sendingOtp || verifyingOtp) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.lg }}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {sendingOtp ? 'Envoi du code...' : 'Verification...'}
                </Text>
              </View>
            )}

            <TouchableOpacity style={{ alignItems: 'center' }} onPress={sendOtpCode} disabled={resendTimer > 0 || sendingOtp}>
              <Text style={{ fontSize: 13, color: resendTimer > 0 ? colors.muted : colors.accent, fontWeight: '700' }}>
                {resendTimer > 0 ? 'Renvoyer le code dans ' + resendTimer + 's' : 'Renvoyer le code'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2 - PIN */}
        {step === 2 && (
          <View style={[styles.formSection, { alignItems: 'center' }]}>
            <Ionicons name="lock-closed" size={36} color={colors.accent} style={{ marginBottom: spacing.md }} />
            <Text style={styles.sectionTitle}>{pinStep === 'create' ? 'Creer ton PIN' : 'Confirmer ton PIN'}</Text>
            <Text style={[styles.sectionSub, { textAlign: 'center' }]}>
              {pinStep === 'create' ? 'Choisis un code a 6 chiffres pour securiser ton compte' : 'Retape ton PIN pour confirmer'}
            </Text>

            <View style={styles.pinDotsRow}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <View key={i} style={[styles.pinDot, i < currentPinValue.length && styles.pinDotFilled]} />
              ))}
            </View>

            <View style={styles.numpad}>
              {['1','2','3','4','5','6','7','8','9','','0','del'].map((key, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.numKey, key === '' && styles.numKeyEmpty]}
                  onPress={() => key && handlePinKey(key)}
                  disabled={key === ''}
                >
                  {key === 'del'
                    ? <Ionicons name="backspace-outline" size={20} color={colors.danger} />
                    : <Text style={styles.numKeyText}>{key}</Text>
                  }
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3 - BOUTIQUE */}
        {step === 3 && (
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
                  <TouchableOpacity key={c} style={[styles.idTypeChip, commune === c && styles.idTypeChipActive]} onPress={() => setCommune(c)}>
                    <Text style={[styles.idTypeText, commune === c && { color: '#fff' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Categorie</Text>
            <View style={styles.catGrid}>
              {['Mode','Tech','Alimentaire','Beaute','Maison','Sport','Autres'].map(cat => (
                <TouchableOpacity key={cat} style={[styles.idTypeChip, category === cat && styles.idTypeChipActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.idTypeText, category === cat && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 4 - PLAN */}
        {step === 4 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Choisir votre abonnement</Text>
            <Text style={styles.sectionSub}>Vous pouvez changer de plan a tout moment.</Text>

            <TouchableOpacity style={[styles.planCard, plan === 'starter' && styles.planActive]} onPress={() => setPlan('starter')}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Starter</Text>
                <View style={[styles.radio, plan === 'starter' && styles.radioActive]}>{plan === 'starter' && <View style={styles.radioDot} />}</View>
              </View>
              <Text style={styles.planPrice}>$5<Text style={styles.planPer}>/mois</Text></Text>
              {['Jusqu a 50 produits','Support par email','Stats de base'].map(f => (
                <View key={f} style={styles.featureRow}><Ionicons name="checkmark-circle" size={14} color={colors.muted} /><Text style={styles.featureText}>{f}</Text></View>
              ))}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planCard, plan === 'pro' && styles.planActive, { borderColor: 'rgba(255,184,48,0.3)' }]} onPress={() => setPlan('pro')}>
              <View style={styles.recommendedBadge}><Text style={styles.recommendedText}>RECOMMANDE</Text></View>
              <View style={styles.planHeader}>
                <Text style={[styles.planName, { color: colors.gold }]}>Pro</Text>
                <View style={[styles.radio, plan === 'pro' && styles.radioActive]}>{plan === 'pro' && <View style={styles.radioDot} />}</View>
              </View>
              <Text style={[styles.planPrice, { color: colors.gold }]}>$10<Text style={styles.planPer}>/mois</Text></Text>
              {['Produits illimites','Support prioritaire 24/7','Analytics avances','Badge verifie Premium'].map(f => (
                <View key={f} style={styles.featureRow}><Ionicons name="checkmark-circle" size={14} color={colors.gold} /><Text style={styles.featureText}>{f}</Text></View>
              ))}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5 - PAIEMENT */}
        {step === 5 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Paiement d activation</Text>
            <Text style={styles.sectionSub}>Votre boutique sera activee sous 24h apres verification.</Text>

            <View style={styles.invoiceCard}>
              <Text style={styles.invoiceTitle}>Recapitulatif</Text>
              <View style={styles.invoiceRow}><Text style={styles.invoiceLabel}>Frais d ouverture (uniques)</Text><Text style={styles.invoiceVal}>$15</Text></View>
              <View style={styles.invoiceRow}><Text style={styles.invoiceLabel}>Abonnement {plan} (1er mois)</Text><Text style={styles.invoiceVal}>{plan === 'pro' ? '$10' : '$5'}</Text></View>
              <View style={[styles.invoiceRow, { borderBottomWidth: 0, marginTop: 8 }]}>
                <Text style={[styles.invoiceLabel, { fontWeight: '800', color: colors.text }]}>TOTAL</Text>
                <Text style={[styles.invoiceVal, { color: colors.gold, fontSize: 20 }]}>{plan === 'pro' ? '$25' : '$20'}</Text>
              </View>
            </View>

            <Text style={styles.label}>Payer via Mobile Money</Text>
            {[{ id: 'mpesa', name: 'M-Pesa (Vodacom)' }, { id: 'airtel', name: 'Airtel Money' }, { id: 'orange', name: 'Orange Money' }].map(m => (
              <TouchableOpacity key={m.id} style={styles.methodItem}>
                <Text style={styles.methodName}>{m.name}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step !== 1 && step !== 2 && (
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
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 52 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  stepsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepItem: { alignItems: 'center' },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepNum: { fontSize: 10, fontWeight: '700', color: colors.muted },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border },
  stepLineDone: { backgroundColor: colors.accent },
  currentStepLabel: { fontSize: 11, color: colors.gold, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xl },
  formSection: {},
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 6, textAlign: 'center' },
  sectionSub: { fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: spacing.lg, textAlign: 'center' },
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
  uploadDone: { height: 200, position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  changeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, alignItems: 'center', gap: 4 },
  changeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: spacing.lg },
  otpInput: { width: 42, height: 52, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, textAlign: 'center', fontSize: 20, fontWeight: '800', color: colors.text },
  otpInputFilled: { borderColor: colors.accent, backgroundColor: 'rgba(26,58,255,0.1)' },
  pinDotsRow: { flexDirection: 'row', gap: 14, marginVertical: spacing.xl },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  pinDotFilled: { backgroundColor: colors.accent, borderColor: colors.accent },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: '80%', gap: 12 },
  numKey: { width: '28%', height: 54, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  numKeyEmpty: { backgroundColor: 'transparent', borderWidth: 0 },
  numKeyText: { fontSize: 20, fontWeight: '700', color: colors.text },
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
