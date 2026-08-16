import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { useDispatch }     from 'react-redux';
import { addToCart }       from '../../store/slices/cartSlice';
import { colors, radius, spacing } from '../../theme';
import { shopsAPI } from '../../services/api';

export default function ShopScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { shop: shopParam } = route.params || {};
  const [shop,     setShop]     = useState(shopParam);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [added,    setAdded]    = useState({});

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      setLoading(true);
      const res = await shopsAPI.getById(shopParam.id);
      setShop(res.shop);
      setProducts(res.shop?.products || []);
    } catch (e) {
      console.log('Erreur boutique:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, shopId: shop.id, shopName: shop.name }));
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {shop?.logoUrl ? (
            <Image source={{ uri: shop.logoUrl }} style={styles.heroImg} />
          ) : (
            <LinearGradient colors={[colors.mid, colors.deep]} style={styles.heroImg} />
          )}
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.heroInfo}>
            {shop?.kycStatus === 'VERIFIED' && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Boutique verifiee</Text>
              </View>
            )}
            <Text style={styles.shopName}>{shop?.name}</Text>
            <Text style={styles.shopLoc}>{shop?.address}, {shop?.commune}, Kinshasa</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statVal}>{shop?.rating || 0}</Text><Text style={styles.statLbl}>Note</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statVal}>{products.length}</Text><Text style={styles.statLbl}>Produits</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statVal}>{shop?.totalSales || 0}</Text><Text style={styles.statLbl}>Ventes</Text></View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tous les produits</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} />
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>Aucun produit pour l instant</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map(product => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('Product', { product, shop })}
              >
                <View style={styles.productImgWrap}>
                  {product.images && product.images[0] ? (
                    <Image source={{ uri: product.images[0] }} style={styles.productImg} />
                  ) : (
                    <LinearGradient colors={[colors.mid, colors.deep]} style={styles.productImgPlaceholder}>
                      <Text style={styles.productEmoji}>📦</Text>
                    </LinearGradient>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price?.toLocaleString()} CDF</Text>
                  <Text style={styles.productStock}>Stock : {product.stock}</Text>
                  <TouchableOpacity
                    style={[styles.addBtn, added[product.id] && styles.addBtnDone]}
                    onPress={() => handleAddToCart(product)}
                  >
                    <Text style={styles.addBtnText}>{added[product.id] ? 'Ajoute !' : '+ Panier'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Avis recents - montre a l acheteur que les boutiques sont vraiment notees */}
        {shop?.reviews && shop.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avis clients</Text>
            {shop.reviews.slice(0, 5).map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewAuthor}>{review.buyer?.fullName}</Text>
                  <Text style={styles.reviewStars}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  hero: { height: 180, justifyContent: 'flex-end', position: 'relative' },
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,15,44,0.55)' },
  back: { position: 'absolute', top: 52, left: spacing.lg, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  heroInfo: { padding: spacing.lg },
  verifiedBadge: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: colors.success, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#000' },
  shopName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  shopLoc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '700', color: colors.bright },
  statLbl: { fontSize: 10, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  sectionHeader: { padding: spacing.lg, paddingBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 12 },
  productCard: { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden' },
  productImgWrap: { height: 100 },
  productImg: { width: '100%', height: '100%' },
  productImgPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  productEmoji: { fontSize: 38 },
  productInfo: { padding: 10 },
  productName: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 4, lineHeight: 16 },
  productPrice: { fontSize: 14, fontWeight: '800', color: colors.gold },
  productStock: { fontSize: 10, color: colors.muted, marginTop: 2 },
  addBtn: { marginTop: 8, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center' },
  addBtnDone: { backgroundColor: colors.success },
  addBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: spacing.md },
  emptyText: { color: colors.muted, fontSize: 13 },
  section: { padding: spacing.lg },
  reviewCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewAuthor: { fontSize: 13, fontWeight: '700', color: colors.text },
  reviewStars: { fontSize: 11 },
  reviewComment: { fontSize: 12, color: colors.muted, lineHeight: 18 },
});
