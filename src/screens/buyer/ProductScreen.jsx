import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { colors, radius, spacing } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { product, shop } = route.params || {
    product: { id: '1', name: 'Produit', price: 0, images: [], stock: 0 },
    shop: { id: '1', name: 'Boutique', commune: '' },
  };
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // ═══ CORRECTION ═══
  // Cet ecran attendait encore product.emoji, un champ qui n existe
  // plus depuis qu on est connecte au vrai backend (les produits ont
  // maintenant un tableau product.images avec de vraies photos).
  // On affiche maintenant un vrai carrousel photo, avec un repli
  // propre si le produit n a aucune photo.
  const images = product.images && product.images.length > 0 ? product.images : [];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({ product, shopId: shop.id, shopName: shop.name }));
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImage(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carrousel photos */}
        <View style={styles.imageSection}>
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {images.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.productImage} />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={styles.dotsRow}>
                  {images.map((_, index) => (
                    <View key={index} style={[styles.dot, index === activeImage && styles.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <LinearGradient colors={[colors.mid, colors.deep]} style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={60} color={colors.muted} />
              <Text style={styles.placeholderText}>Aucune photo</Text>
            </LinearGradient>
          )}
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Infos */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price?.toLocaleString()} CDF</Text>

          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          {/* Boutique */}
          <TouchableOpacity style={styles.shopRow} onPress={() => navigation.navigate('Shop', { shop })}>
            <View style={styles.shopIcon}>
              {shop.logoUrl ? (
                <Image source={{ uri: shop.logoUrl }} style={styles.shopLogoImg} />
              ) : (
                <Text>🏪</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.shopLoc}>{shop.commune}, Kinshasa</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </TouchableOpacity>

          {/* Quantite */}
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantite</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.qBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.qVal}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qBtn}
                onPress={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
              >
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.stockText}>{product.stock} en stock</Text>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{(product.price * quantity).toLocaleString()} CDF</Text>
          </View>

          {/* Livraison */}
          <View style={styles.deliveryBox}>
            <Ionicons name="bicycle-outline" size={20} color={colors.bright} />
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryTitle}>Livraison disponible</Text>
              <Text style={styles.deliveryDesc}>Le livreur recupere chez {shop.name} - ~1h</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bouton panier fixe */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleAddToCart} style={styles.cartBtn}>
          <LinearGradient
            colors={added ? [colors.success, '#00B87A'] : [colors.accent, colors.bright]}
            style={styles.cartBtnGrad}
          >
            <Ionicons name={added ? 'checkmark' : 'cart'} size={20} color="#fff" />
            <Text style={styles.cartBtnText}>{added ? 'Ajoute au panier !' : 'Ajouter au panier'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  imageSection: { position: 'relative' },
  productImage: { width: SCREEN_WIDTH, height: 320 },
  imagePlaceholder: { width: SCREEN_WIDTH, height: 320, alignItems: 'center', justifyContent: 'center', gap: 10 },
  placeholderText: { fontSize: 13, color: colors.muted },
  dotsRow: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 20 },
  back: { position: 'absolute', top: 52, left: spacing.lg, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  infoSection: { padding: spacing.lg },
  productName: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  productPrice: { fontSize: 28, fontWeight: '900', color: colors.gold, marginBottom: spacing.md },
  description: { fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: spacing.lg },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, marginBottom: spacing.lg },
  shopIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  shopLogoImg: { width: '100%', height: '100%' },
  shopName: { fontSize: 14, fontWeight: '700', color: colors.text },
  shopLoc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  qVal: { fontSize: 18, fontWeight: '800', color: colors.text, minWidth: 30, textAlign: 'center' },
  stockText: { fontSize: 11, color: colors.muted, marginTop: 6, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, marginBottom: spacing.lg },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalVal: { fontSize: 22, fontWeight: '900', color: colors.gold },
  deliveryBox: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(77,110,255,0.08)', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border },
  deliveryTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  deliveryDesc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  bottomBar: { padding: spacing.lg, backgroundColor: colors.navy, borderTopWidth: 1, borderTopColor: colors.border },
  cartBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  cartBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
