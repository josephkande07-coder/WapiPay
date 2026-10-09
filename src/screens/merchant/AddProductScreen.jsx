import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import * as ImagePicker    from 'expo-image-picker';
import { colors, radius, spacing } from '../../theme';
import { productsAPI } from '../../services/api';

const CATEGORIES = ['Mode','Tech','Alimentaire','Beaute','Maison','Sport','Autres'];

const CLOTHING_SIZES = ['XS','S','M','L','XL','XXL','3XL'];
const SHOE_SIZES = Array.from({ length: 27 }, (_, i) => String(20 + i)); // 20 a 46

const COLOR_PALETTE = [
  { name: 'Noir',   hex: '#111111' },
  { name: 'Blanc',  hex: '#FFFFFF' },
  { name: 'Gris',   hex: '#9E9E9E' },
  { name: 'Rouge',  hex: '#FF4136' },
  { name: 'Bleu',   hex: '#0074D9' },
  { name: 'Vert',   hex: '#2ECC40' },
  { name: 'Jaune',  hex: '#FFDC00' },
  { name: 'Orange', hex: '#FF851B' },
  { name: 'Rose',   hex: '#F012BE' },
  { name: 'Violet', hex: '#6F42C1' },
  { name: 'Marron', hex: '#8B4513' },
  { name: 'Beige',  hex: '#D2B48C' },
];

export default function AddProductScreen({ navigation }) {
  const [name,        setName]        = useState('');
  const [price,       setPrice]       = useState('');
  const [stock,       setStock]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('');
  const [images,      setImages]      = useState([]);
  const [loading,     setLoading]     = useState(false);

  // ═══ NOUVEAU : tailles et couleurs ═══
  const [sizeType,       setSizeType]       = useState('none'); // 'none' | 'clothing' | 'shoes'
  const [selectedSizes,  setSelectedSizes]  = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (colorName) => {
    setSelectedColors(prev => prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]);
  };

  const handleSizeTypeChange = (type) => {
    setSizeType(type);
    setSelectedSizes([]); // on repart de zero si on change de type de taille
  };

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Maximum', 'Tu peux ajouter au maximum 4 photos.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Autorise WapiPay a acceder a ta galerie.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImages(prev => [...prev, { uri: asset.uri, base64: 'data:image/jpeg;base64,' + asset.base64 }]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= 4) {
      Alert.alert('Maximum', 'Tu peux ajouter au maximum 4 photos.');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusee', 'Autorise WapiPay a utiliser la camera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImages(prev => [...prev, { uri: asset.uri, base64: 'data:image/jpeg;base64,' + asset.base64 }]);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Ajouter une photo', 'Choisis une option', [
      { text: 'Prendre une photo', onPress: takePhoto },
      { text: 'Depuis la galerie', onPress: pickImage },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name || !price || !stock || !category) {
      Alert.alert('Champs manquants', 'Nom, prix, stock et categorie sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      await productsAPI.create({
        name,
        description,
        price:    parseFloat(price),
        stock:    parseInt(stock),
        category,
        images:   images.map(img => img.base64),
        sizes:    selectedSizes,
        colors:   selectedColors,
      });
      Alert.alert('Produit ajoute !', '"' + name + '" est maintenant visible dans ta boutique.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e?.error || 'Impossible d ajouter le produit. Reessaie.');
    } finally {
      setLoading(false);
    }
  };

  const currentSizeList = sizeType === 'clothing' ? CLOTHING_SIZES : sizeType === 'shoes' ? SHOE_SIZES : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un produit</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Photos du produit</Text>
          <Text style={styles.sectionSub}>Ajoute jusqu a 4 photos de ton produit (optionnel)</Text>

          <View style={styles.imagesRow}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrap}>
                <Image source={{ uri: img.uri }} style={styles.productImage} />
                <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(index)}>
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 4 && (
              <TouchableOpacity style={styles.addImgBtn} onPress={showImageOptions}>
                <Ionicons name="camera" size={28} color={colors.muted} />
                <Text style={styles.addImgText}>Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Nom du produit *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Robe Ankara Premium"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Prix (CDF) *</Text>
              <TextInput
                style={styles.input}
                placeholder="8500"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Decris ton produit : matiere, coupe, utilisation..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Categorie *</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catText, category === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ═══ NOUVEAU : Tailles ═══ */}
          <Text style={styles.sectionTitle2}>Tailles disponibles (optionnel)</Text>
          <Text style={styles.sectionSub}>Choisis le type de taille pour ce produit</Text>
          <View style={styles.sizeTypeRow}>
            {[
              { key: 'none',     label: 'Aucune' },
              { key: 'clothing', label: 'Vetements' },
              { key: 'shoes',    label: 'Chaussures' },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.sizeTypeChip, sizeType === t.key && styles.sizeTypeChipActive]}
                onPress={() => handleSizeTypeChange(t.key)}
              >
                <Text style={[styles.sizeTypeText, sizeType === t.key && { color: '#fff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentSizeList.length > 0 && (
            <View style={styles.sizesGrid}>
              {currentSizeList.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeCircle, selectedSizes.includes(size) && styles.sizeCircleActive]}
                  onPress={() => toggleSize(size)}
                >
                  <Text style={[styles.sizeCircleText, selectedSizes.includes(size) && { color: '#fff' }]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ═══ NOUVEAU : Couleurs ═══ */}
          <Text style={styles.sectionTitle2}>Couleurs disponibles (optionnel)</Text>
          <Text style={styles.sectionSub}>Selectionne les couleurs que tu as en stock</Text>
          <View style={styles.colorsGrid}>
            {COLOR_PALETTE.map(c => {
              const isSelected = selectedColors.includes(c.name);
              return (
                <TouchableOpacity key={c.name} style={styles.colorItem} onPress={() => toggleColor(c.name)}>
                  <View style={[
                    styles.colorSwatch,
                    { backgroundColor: c.hex },
                    isSelected && styles.colorSwatchActive,
                    c.hex === '#FFFFFF' && styles.colorSwatchWhiteBorder,
                  ]}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={c.hex === '#FFFFFF' || c.hex === '#FFDC00' ? '#000' : '#fff'} />
                    )}
                  </View>
                  <Text style={styles.colorLabel}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
          <LinearGradient colors={[colors.accent, colors.bright]} style={styles.submitGrad}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Publier le produit</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  form: { padding: spacing.lg },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  sectionTitle2: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4, marginTop: spacing.xl },
  sectionSub: { fontSize: 12, color: colors.muted, marginBottom: spacing.md },
  imagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  imageWrap: { width: 90, height: 90, borderRadius: radius.lg, overflow: 'hidden', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  removeImg: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  addImgBtn: { width: 90, height: 90, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.card },
  addImgText: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 14 },
  textarea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  catChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  catText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  sizeTypeRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  sizeTypeChip: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center' },
  sizeTypeChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sizeTypeText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  sizesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  sizeCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  sizeCircleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sizeCircleText: { fontSize: 12, fontWeight: '700', color: colors.text },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: spacing.md },
  colorItem: { alignItems: 'center', gap: 5, width: 56 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: colors.accent, borderWidth: 2.5 },
  colorSwatchWhiteBorder: { borderColor: colors.border },
  colorLabel: { fontSize: 9, color: colors.muted, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.navy, borderTopWidth: 1, borderTopColor: colors.border },
  submitBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  submitGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});