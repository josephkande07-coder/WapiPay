import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { colors, radius, spacing } from '../../theme';
import { removeToken } from '../../services/api';

const MENU_ITEMS = [
  { icon: 'person-outline',        label: 'Modifier mon profil',     color: colors.bright, route: 'EditProfile' },
  { icon: 'lock-closed-outline',   label: 'Changer mon PIN',          color: colors.bright, route: 'ChangePin' },
  { icon: 'card-outline',          label: 'Mes methodes de paiement', color: colors.bright, route: 'Info', params: { type: 'payment' } },
  { icon: 'notifications-outline', label: 'Notifications',            color: colors.bright, route: 'Notifications' },
  { icon: 'help-circle-outline',   label: 'Aide & Support',           color: colors.bright, route: 'Info', params: { type: 'help' } },
  { icon: 'shield-checkmark-outline', label: 'Securite',              color: colors.success, route: 'Info', params: { type: 'security' } },
  { icon: 'document-text-outline', label: 'Conditions d utilisation', color: colors.muted,   route: 'Info', params: { type: 'terms' } },
];

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, role } = useSelector(state => state.auth);

  const handleLogout = () => {
    Alert.alert('Deconnexion', 'Es-tu sur de vouloir te deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Deconnexion',
        style: 'destructive',
        onPress: async () => {
          await removeToken();
          dispatch(logout());
        },
      },
    ]);
  };

  const handleMenuPress = (item) => {
    if (item.route === 'Notifications' && role === 'MERCHANT') {
      const parent = navigation.getParent();
      if (parent) parent.navigate('Dashboard', { screen: 'Notifications' });
      return;
    }
    navigation.navigate(item.route, item.params);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
          {/* ═══ NOUVEAU : le rond photo est maintenant cliquable ═══ */}
          <TouchableOpacity style={styles.avatarWrap} onPress={() => navigation.navigate('EditProfile')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <LinearGradient colors={[colors.accent, colors.bright]} style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() || 'U'}</Text>
              </LinearGradient>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.fullName || 'Utilisateur'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+243 ...'}</Text>
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={14} color={colors.success} />
            <Text style={styles.verifiedText}>Compte {user?.isVerified ? 'verifie' : 'non verifie'}</Text>
          </View>
        </LinearGradient>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Se deconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>WapiPay v1.0.0 - Kinshasa, RDC</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: spacing.xl },
  avatarWrap: { marginBottom: spacing.md, width: 90, height: 90, position: 'relative' },
  avatarImg: { width: 90, height: 90, borderRadius: 30 },
  avatar: { width: 90, height: 90, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  avatarEditBadge: { position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.navy },
  userName: { fontSize: 22, fontWeight: '800', color: colors.text },
  userPhone: { fontSize: 14, color: colors.muted, marginTop: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: 'rgba(0,229,160,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  verifiedText: { fontSize: 12, color: colors.success, fontWeight: '600' },
  menuSection: { margin: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(77,110,255,0.08)' },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: spacing.lg, padding: spacing.md, backgroundColor: 'rgba(255,77,109,0.08)', borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(255,77,109,0.2)' },
  logoutText: { fontSize: 15, color: colors.danger, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 11, color: colors.muted, marginBottom: spacing.md },
});