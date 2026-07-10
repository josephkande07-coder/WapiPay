import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export default function ReviewScreen({ navigation, route }) {
  const { order } = route.params || {
    order: { id: '#4819', shop: 'Mode Kin', product: 'Robe Ankara x1' }
  };
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const LABELS = ['', 'Tres mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent !'];

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Donne une note a ta commande.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      Alert.alert('Merci !', 'Ton avis a ete publie et aide les autres acheteurs.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Evalue ta commande</Text>
      <Text style={styles.subtitle}>{order.product} - {order.shop}</Text>

      <View style={styles.starsRow}>
        {[1,2,3,4,5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={48}
              color={star <= rating ? colors.gold : colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>

      {rating > 0 && (
        <Text style={styles.ratingLabel}>{LABELS[rating]}</Text>
      )}

      <Text style={styles.label}>Ton commentaire (optionnel)</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Decris ton experience : qualite du produit, livraison..."
        placeholderTextColor={colors.muted}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={5}
      />

      <View style={styles.tagsRow}>
        {['Conforme a la description','Livraison rapide','Bon emballage','Vendeur serieux'].map(tag => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, comment.includes(tag) && styles.tagActive]}
            onPress={() => setComment(c =>
              c.includes(tag) ? c.replace(tag, '').trim() : (c + ' ' + tag).trim()
            )}
          >
            <Text style={[styles.tagText, comment.includes(tag) && { color: '#fff' }]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
        <LinearGradient colors={[colors.accent, colors.bright]} style={styles.submitGrad}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Publier mon avis</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: 60 },
  back: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: spacing.xl },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.md },
  ratingLabel: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.gold, marginBottom: spacing.xl },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 8, marginTop: spacing.lg },
  textarea: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: 14, color: colors.text, fontSize: 14, textAlignVertical: 'top', height: 120, marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.xl },
  tag: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20 },
  tagActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tagText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  submitBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  submitGrad: { paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
