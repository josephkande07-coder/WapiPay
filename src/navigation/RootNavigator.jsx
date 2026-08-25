import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { removeToken } from '../services/api';
import { colors, radius, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import SplashScreen      from '../screens/auth/SplashScreen';
import LoginScreen       from '../screens/auth/LoginScreen';
import RegisterScreen    from '../screens/auth/RegisterScreen';
import OTPScreen         from '../screens/auth/OTPScreen';
import SetPinScreen      from '../screens/auth/SetPinScreen';
import MerchantRegister  from '../screens/merchant/MerchantRegisterScreen';

import BuyerNavigator    from './BuyerNavigator';
import MerchantNavigator from './MerchantNavigator';

const Stack = createStackNavigator();

// ═══ NOUVEAU ═══
// Un compte ADMIN n a rien a faire dans l app mobile - c est le panel
// web (WapiPay-Admin) qui est fait pour ca. Avant, un role ADMIN
// tombait silencieusement dans l interface acheteur (seul MERCHANT
// etait teste). Ce petit ecran evite la confusion en le disant
// clairement, avec un bouton pour se deconnecter.
function AdminNotSupportedScreen() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    await removeToken();
    dispatch(logout());
  };
  return (
    <LinearGradient colors={[colors.deep, colors.navy]} style={styles.container}>
      <Ionicons name="desktop-outline" size={60} color={colors.accent} />
      <Text style={styles.title}>Compte administrateur</Text>
      <Text style={styles.text}>
        Les comptes admin ne sont pas geres depuis l application mobile.
        {'\n\n'}Connecte-toi plutot depuis le panel web WapiPay-Admin, sur ton ordinateur.
      </Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se deconnecter</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

export default function RootNavigator() {
  const { isLoggedIn, role } = useSelector(state => state.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Splash"    component={SplashScreen} />
          <Stack.Screen name="Login"     component={LoginScreen} />
          <Stack.Screen name="Register"  component={RegisterScreen} />
          <Stack.Screen name="OTP"       component={OTPScreen} />
          <Stack.Screen name="SetPin"    component={SetPinScreen} />
          <Stack.Screen name="MerchantRegister" component={MerchantRegister} />
        </>
      ) : role === 'ADMIN' ? (
        <Stack.Screen name="AdminNotSupported" component={AdminNotSupportedScreen} />
      ) : role === 'MERCHANT' ? (
        <Stack.Screen name="MerchantApp" component={MerchantNavigator} />
      ) : (
        <Stack.Screen name="BuyerApp"    component={BuyerNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  text: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  logoutBtn: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
