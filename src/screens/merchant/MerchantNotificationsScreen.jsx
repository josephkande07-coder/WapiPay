import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

const NOTIFS = [
  { id: '1', type: 'order',   title: 'Nouvelle commande !',      desc: 'Mireille K. a commande Robe Ankara x2',    time: 'Il y a 5 min',  read: false },
  { id: '2', type: 'payment', title: 'Paiement recu',            desc: '17 000 CDF credites sur ton compte',        time: 'Il y a 12 min', read: false },
  { id: '3', type: 'review',  title: 'Nouvel avis 5 etoiles',    desc: 'Jean-Paul a laisse un tres bon avis',       time: 'Il y a 1h',     read: true  },
  { id: '4', type: 'sub',     title: 'Abonnement renouvele',     desc: 'Ton plan Pro a ete renouvele avec succes',  time: 'Il y a 2h',     read: true  },
  { id: '5', type: 'order',   title: 'Commande livree',          desc: 'La commande #4819 a ete livree',            time: 'Hier',          read: true  },
  { id: '6', type: 'alert',   title: 'Stock faible',             desc: 'Boubou Femme : plus que 2 en stock',        time: 'Hier',          read: true  },
];

const TYPE_CONFIG = {
  order:   { icon: 'cube',           color: colors.accent  },
  payment: { icon: 'cash',           color: colors.success },
  review:  { icon: 'star',           color: colors.gold    },
  sub:     { icon: 'refresh-circle', color: colors.bright  },
  alert:   { icon: 'warning',        color: colors.danger  },
};

export default function MerchantNotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState(NOTIFS);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markBtn}>
            <Text style={styles.markBtnText}>Tout lire</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <FlatList
        data={notifs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const config = TYPE_CONFIG[item.type];
          return (
            <TouchableOpacity
              style={[styles.notifItem, !item.read && styles.notifUnread]}
              onPress={() => markOneRead(item.id)}
            >
              <View style={[styles.notifIcon, { backgroundColor: config.color + '20' }]}>
                <Ionicons name={config.icon} size={22} color={config.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifDesc} numberOfLines={2}>{item.desc}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text },
  markBtn: { backgroundColor: 'rgba(26,58,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  markBtnText: { fontSize: 11, color: colors.accent, fontWeight: '700' },
  list: { padding: spacing.lg, gap: 10 },
  notifItem: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 14 },
  notifUnread: { borderColor: 'rgba(26,58,255,0.3)', backgroundColor: 'rgba(17,32,102,0.8)' },
  notifIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  notifDesc: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  notifTime: { fontSize: 10, color: colors.muted, marginTop: 5 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, alignSelf: 'flex-start', marginTop: 4 },
});
