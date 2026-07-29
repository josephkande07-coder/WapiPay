import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

const CONTENT = {
  payment: {
    title: 'Methodes de paiement',
    icon: 'card-outline',
    body: [
      'WapiPay utilise Mobile Money pour tous les paiements : M-Pesa, Airtel Money et Orange Money.',
      'Il n y a pas de carte bancaire a enregistrer : le paiement se fait directement avec ton numero de telephone au moment de chaque commande.',
      'La gestion de methodes de paiement enregistrees (comme sur d autres apps) n est pas encore disponible - elle arrivera dans une prochaine mise a jour.',
    ],
  },
  notifications: {
    title: 'Notifications',
    icon: 'notifications-outline',
    body: [
      'Les reglages fins des notifications (activer/desactiver par type) ne sont pas encore disponibles.',
      'Pour l instant, tu recois automatiquement une alerte a chaque nouvelle commande, paiement, ou avis si tu es marchand.',
      'Cette page sera mise a jour avec de vrais reglages personnalisables prochainement.',
    ],
  },
  help: {
    title: 'Aide & Support',
    icon: 'help-circle-outline',
    body: [
      'Pour toute question sur ta commande, ton paiement ou ta boutique, contacte le support WapiPay.',
      'Email : support@wapipay.cd',
      'Le support en direct dans l app (chat) n est pas encore disponible - il est prevu pour une prochaine version.',
    ],
  },
  security: {
    title: 'Securite',
    icon: 'shield-checkmark-outline',
    body: [
      'Ton PIN est chiffre et jamais stocke en clair, ni sur ton telephone ni sur nos serveurs.',
      'Chaque paiement necessite ton PIN a 6 chiffres.',
      'Les documents d identite des marchands sont verifies avant l activation de leur boutique.',
      'Si tu penses que ton compte est compromis, change ton PIN immediatement depuis Modifier mon PIN.',
    ],
  },
  terms: {
    title: 'Conditions d utilisation',
    icon: 'document-text-outline',
    body: [
      'En utilisant WapiPay, tu acceptes que tes informations (nom, telephone, adresse) soient utilisees uniquement pour le fonctionnement du service : commandes, livraisons et paiements.',
      'Les marchands sont responsables de l exactitude des informations de leurs produits.',
      'Les frais de service (1.5% par commande) et d abonnement boutique sont non remboursables une fois la periode entamee.',
      'Ce document est une version simplifiee. Les conditions completes seront publiees avant le lancement public.',
    ],
  },
};

export default function InfoScreen({ navigation, route }) {
  const type = route?.params?.type || 'help';
  const data = CONTENT[type] || CONTENT.help;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.title}</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name={data.icon} size={40} color={colors.accent} />
        </View>
        {data.body.map((paragraph, i) => (
          <Text key={i} style={styles.paragraph}>{paragraph}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  content: { padding: spacing.lg },
  iconWrap: { alignItems: 'center', marginBottom: spacing.xl },
  paragraph: { fontSize: 14, color: colors.muted, lineHeight: 22, marginBottom: spacing.md },
});
