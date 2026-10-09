import React, { useState, useEffect } from 'react';
import {
View, Text, StyleSheet, ScrollView,
TouchableOpacity, ActivityIndicator, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../../theme';
import { shopsAPI, productsAPI } from '../../services/api';

const getTrialStatus = (shop) => {
if (!shop?.trialEndsAt) return null;
const end = new Date(shop.trialEndsAt);
const now = new Date();
const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
if (shop.subscriptionActive) return null;
if (daysLeft < 0) return { expired: true, daysLeft: 0 };
if (daysLeft <= 14) return { expired: false, daysLeft };
return null;
};

export default function MyShopScreen({ navigation }) {
const [products,      setProducts]      = useState([]);
const [shop,          setShop]          = useState(null);
const [loading,       setLoading]       = useState(true);
const [uploadingLogo, setUploadingLogo] = useState(false);

useEffect(() => {
loadShop();
const unsubscribe = navigation.addListener('focus', loadShop);
return unsubscribe;
}, [navigation]);

const loadShop = async () => {
try {
setLoading(true);
const res = await shopsAPI.getMyShop();
setShop(res.shop);
setProducts(res.shop?.products || []);
} catch (e) {
console.log('Erreur boutique:', e);
} finally {
setLoading(false);
}
};

const changeLogo = async () => {
Alert.alert('Photo de la boutique', 'Choisis une option', [
{ text: 'Prendre une photo', onPress: () => pickLogo('camera') },
{ text: 'Depuis la galerie', onPress: () => pickLogo('gallery') },
{ text: 'Annuler', style: 'cancel' },
]);
};

const pickLogo = async (source) => {
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
if (result.canceled || !result.assets[0]) return;

```
setUploadingLogo(true);
try {
  const base64Uri = 'data:image/jpeg;base64,' + result.assets[0].base64;
  const res = await shopsAPI.update(shop.id, { logoUrl: base64Uri });
  setShop(res.shop);
  Alert.alert('Succes', 'Photo de la boutique mise a jour.');
} catch (e) {
  Alert.alert('Erreur', e?.error || 'Impossible de mettre a jour la photo.');
} finally {
  setUploadingLogo(false);
}
```

};

const toggleProduct = async (productId, currentStatus) => {
try {
await productsAPI.update(productId, { isActive: !currentStatus });
setProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: !currentStatus } : p));
} catch (e) {
Alert.alert('Erreur', 'Impossible de modifier le produit.');
}
};

const deleteProduct = (productId) => {
Alert.alert('Supprimer', 'Veux-tu supprimer ce produit ?', [
{ text: 'Annuler', style: 'cancel' },
{
text: 'Supprimer', style: 'destructive',
onPress: async () => {
try {
await productsAPI.delete(productId);
setProducts(prev => prev.filter(p => p.id !== productId));
} catch (e) {
Alert.alert('Erreur', 'Impossible de supprimer.');
}
},
},
]);
};

if (loading) {
return (
<View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}> <ActivityIndicator size="large" color={colors.accent} /> </View>
);
}

return ( <View style={styles.container}> <ScrollView showsVerticalScrollIndicator={false}>
<LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}> <Text style={styles.headerTitle}>Ma boutique</Text>
<TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProduct')}> <Ionicons name="add" size={22} color="#fff" /> </TouchableOpacity> </LinearGradient>

```
    {shop && (
      <View style={styles.shopInfoCard}>
        <TouchableOpacity style={styles.logoWrap} onPress={changeLogo} disabled={uploadingLogo}>
          {shop.logoUrl ? (
            <Image source={{ uri: shop.logoUrl }} style={styles.logoImg} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="storefront" size={32} color={colors.muted} />
            </View>
          )}
          <View style={styles.logoEditBadge}>
            {uploadingLogo
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="camera" size={14} color="#fff" />
            }
          </View>
        </TouchableOpacity>

        <Text style={styles.shopName}>{shop.name}</Text>
        <Text style={styles.shopAddress}>{shop.address}, {shop.commune}</Text>
        <TouchableOpacity onPress={changeLogo} disabled={uploadingLogo}>
          <Text style={styles.changePhotoText}>
            {shop.logoUrl ? 'Changer la photo' : 'Ajouter une photo de boutique'}
          </Text>
        </TouchableOpacity>

        <View style={styles.shopStats}>
          <View style={styles.shopStat}>
            <Text style={styles.shopStatVal}>{products.length}</Text>
            <Text style={styles.shopStatLbl}>Produits</Text>
          </View>
          <View style={styles.shopStat}>
            <Text style={styles.shopStatVal}>{shop.rating}</Text>
            <Text style={styles.shopStatLbl}>Note</Text>
          </View>
          <View style={styles.shopStat}>
            <Text style={styles.shopStatVal}>{shop.totalSales}</Text>
            <Text style={styles.shopStatLbl}>Ventes</Text>
          </View>
        </View>
      </View>
    )}

    {(() => {
      const trial = getTrialStatus(shop);
      if (!trial) return null;
      return (
        <View style={[styles.trialBanner, trial.expired && styles.trialBannerExpired]}>
          <Ionicons
            name={trial.expired ? 'alert-circle' : 'time-outline'}
            size={20}
            color={trial.expired ? colors.danger : colors.gold}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.trialBannerTitle, trial.expired && { color: colors.danger }]}>
              {trial.expired ? 'Essai gratuit termine' : 'Essai gratuit bientot termine'}
            </Text>
            <Text style={styles.trialBannerText}>
              {trial.expired
                ? 'Tu ne peux plus ajouter de nouveaux produits. Contacte le support pour activer ton abonnement.'
                : 'Il te reste ' + trial.daysLeft + ' jour' + (trial.daysLeft > 1 ? 's' : '') + ' avant de devoir activer un abonnement.'}
            </Text>
          </View>
        </View>
      );
    })()}

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mes produits ({products.length})</Text>
      {products.map(product => (
        <View key={product.id} style={styles.productItem}>
          <View style={styles.productImg}>
            {product.images && product.images[0] ? (
              <Image source={{ uri: product.images[0] }} style={styles.productRealImg} />
            ) : (
              <Text style={{ fontSize: 28 }}>📦</Text>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price?.toLocaleString()} CDF</Text>
            <Text style={styles.productStock}>Stock : {product.stock} unites</Text>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.toggleBtn, product.isActive && styles.toggleBtnActive]}
              onPress={() => toggleProduct(product.id, product.isActive)}
            >
              <Text style={[styles.toggleText, product.isActive && { color: '#fff' }]}>
                {product.isActive ? 'Actif' : 'Inactif'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteProduct(product.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {products.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyText}>Aucun produit pour l instant</Text>
        </View>
      )}
    </View>

    <TouchableOpacity style={styles.addProductBtn} onPress={() => navigation.navigate('AddProduct')}>
      <LinearGradient colors={[colors.accent, colors.bright]} style={styles.addProductGrad}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.addProductText}>Ajouter un produit</Text>
      </LinearGradient>
    </TouchableOpacity>
    <View style={{ height: 30 }} />
  </ScrollView>
</View>

);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: colors.navy },
header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
shopInfoCard: { margin: spacing.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center' },
logoWrap: { width: 84, height: 84, borderRadius: 24, marginBottom: spacing.md, position: 'relative' },
logoImg: { width: 84, height: 84, borderRadius: 24 },
logoPlaceholder: { width: 84, height: 84, borderRadius: 24, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
logoEditBadge: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card },
shopName: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
shopAddress: { fontSize: 12, color: colors.muted, marginBottom: spacing.sm },
changePhotoText: { fontSize: 12, color: colors.accent, fontWeight: '600', marginBottom: spacing.md },
shopStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
shopStat: { alignItems: 'center' },
shopStatVal: { fontSize: 20, fontWeight: '800', color: colors.accent },
shopStatLbl: { fontSize: 11, color: colors.muted, marginTop: 2 },
section: { padding: spacing.lg },
sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
productItem: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12, marginBottom: 10 },
productImg: { width: 58, height: 58, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
productRealImg: { width: '100%', height: '100%' },
productInfo: { flex: 1 },
productName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
productPrice: { fontSize: 14, fontWeight: '800', color: colors.gold },
productStock: { fontSize: 11, color: colors.muted, marginTop: 2 },
productActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
toggleBtn: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
toggleBtnActive: { backgroundColor: colors.success, borderColor: colors.success },
toggleText: { fontSize: 10, fontWeight: '700', color: colors.muted },
emptyBox: { alignItems: 'center', padding: spacing.xl },
emptyEmoji: { fontSize: 50, marginBottom: spacing.md },
emptyText: { color: colors.muted, fontSize: 13 },
addProductBtn: { margin: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
addProductGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
addProductText: { color: '#fff', fontSize: 15, fontWeight: '700' },
trialBanner: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,184,48,0.08)', borderWidth: 1, borderColor: 'rgba(255,184,48,0.25)', borderRadius: radius.lg, padding: 14, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
trialBannerExpired: { backgroundColor: 'rgba(255,77,109,0.08)', borderColor: 'rgba(255,77,109,0.25)' },
trialBannerTitle: { fontSize: 13, fontWeight: '700', color: colors.gold, marginBottom: 3 },
trialBannerText: { fontSize: 11, color: colors.muted, lineHeight: 16 },
});
