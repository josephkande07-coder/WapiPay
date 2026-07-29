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

export default function AddProductScreen({ navigation }) {
  const [name,        setName]        = useState('');
  const [price,       setPrice]       = useState('');
  const [stock,       setStock]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('');
  const [images,      setImages]      = useState([]);
  const [loading,     setLoading]     = useState(false);

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
      setImages(prev => [...prev, {
        uri:    asset.uri,
        base64: 'data:image/jpeg;base64,' + asset.base64,
      }]);
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
      setImages(prev => [...prev, {
        uri:    asset.uri,
        base64: 'data:image/jpeg;base64,' + asset.base64,
      }]);
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
      // Appel reel au backend
      await productsAPI.create({
        name,
        description,
        price:    parseFloat(price),
        stock:    parseInt(stock),
        category,
        images:   images.map(img => img.base64),
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
            placeholder="Decris ton produit : taille, couleur, matiere..."
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
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.navy, borderTopWidth: 1, borderTopColor: colors.border },
  submitBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  submitGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
