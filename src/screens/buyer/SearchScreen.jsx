// src/screens/buyer/SearchScreen.jsx

import React, { useState } from 'react';

import {

View, Text, StyleSheet, TextInput,

TouchableOpacity, ScrollView,

} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '../../theme';



const CATEGORIES = [

{ name: 'Mode', emoji: '👗' },

{ name: 'Électronique',emoji: '📱' },

{ name: 'Alimentation',emoji: '🥩' },

{ name: 'Beauté', emoji: '💄' },

{ name: 'Maison', emoji: '🏠' },

{ name: 'Sport', emoji: '⚽' },

];



const RESULTS = [

{ id: '1', name: 'Robe Ankara Premium', price: 8500, shop: 'Mode Kin', emoji: '👗' },

{ id: '2', name: 'Samsung Galaxy A14', price: 95000, shop: 'TechHub KIN', emoji: '📱' },

{ id: '3', name: 'Panier de légumes', price: 1200, shop: 'Marché Bio', emoji: '🥦' },

{ id: '4', name: 'Rouge à lèvres', price: 2500, shop: 'Beauté RDC', emoji: '💄' },

];



export default function SearchScreen({ navigation }) {

const [search, setSearch] = useState('');

const [activeCategory, setActiveCategory] = useState(null);



const filtered = RESULTS.filter(p =>

p.name.toLowerCase().includes(search.toLowerCase())

);



return (

<View style={styles.container}>

<LinearGradient colors={[colors.deep, colors.navy]} style={styles.header}>

<Text style={styles.headerTitle}>Explorer</Text>

<View style={styles.searchBar}>

<Ionicons name="search" size={18} color={colors.muted} />

<TextInput

style={styles.searchInput}

placeholder="Chercher un produit ou une boutique..."

placeholderTextColor={colors.muted}

value={search}

onChangeText={setSearch}

autoFocus

/>

{search.length > 0 && (

<TouchableOpacity onPress={() => setSearch('')}>

<Ionicons name="close-circle" size={18} color={colors.muted} />

</TouchableOpacity>

)}

</View>

</LinearGradient>



<ScrollView showsVerticalScrollIndicator={false}>

{/* Catégories */}

<Text style={styles.sectionTitle}>Catégories</Text>

<View style={styles.catGrid}>

{CATEGORIES.map((cat, i) => (

<TouchableOpacity

key={i}

style={[styles.catCard, activeCategory === cat.name && styles.catCardActive]}

onPress={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}

>

<Text style={styles.catEmoji}>{cat.emoji}</Text>

<Text style={[styles.catName, activeCategory === cat.name && { color: '#fff' }]}>

{cat.name}

</Text>

</TouchableOpacity>

))}

</View>



{/* Résultats */}

<Text style={styles.sectionTitle}>

{search ? `Résultats pour "${search}"` : 'Produits populaires'}

</Text>

{filtered.map(product => (

<TouchableOpacity key={product.id} style={styles.resultItem}>

<View style={styles.resultImg}>

<Text style={{ fontSize: 28 }}>{product.emoji}</Text>

</View>

<View style={styles.resultInfo}>

<Text style={styles.resultName}>{product.name}</Text>

<Text style={styles.resultShop}>🏪 {product.shop}</Text>

</View>

<Text style={styles.resultPrice}>{product.price.toLocaleString()} CDF</Text>

</TouchableOpacity>

))}



{filtered.length === 0 && (

<View style={styles.noResult}>

<Text style={styles.noResultEmoji}>🔍</Text>

<Text style={styles.noResultText}>Aucun résultat pour "{search}"</Text>

</View>

)}

<View style={{ height: 30 }} />

</ScrollView>

</View>

);

}



const styles = StyleSheet.create({

container: { flex: 1, backgroundColor: colors.navy },

header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },

headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },

searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, height: 48, gap: 10 },

searchInput: { flex: 1, color: colors.text, fontSize: 14 },

sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, padding: spacing.lg, paddingBottom: spacing.md },

catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: 10 },

catCard: { width: '30%', alignItems: 'center', padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl },

catCardActive: { backgroundColor: colors.accent, borderColor: colors.accent },

catEmoji: { fontSize: 28, marginBottom: 6 },

catName: { fontSize: 11, color: colors.muted, fontWeight: '600', textAlign: 'center' },

resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.lg, marginBottom: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12 },

resultImg: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.mid, alignItems: 'center', justifyContent: 'center' },

resultInfo: { flex: 1 },

resultName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },

resultShop: { fontSize: 11, color: colors.muted },

resultPrice: { fontSize: 14, fontWeight: '800', color: colors.gold },

noResult: { alignItems: 'center', paddingTop: 40 },

noResultEmoji: { fontSize: 50, marginBottom: spacing.md },

noResultText: { fontSize: 14, color: colors.muted },

});

