// src/navigation/RootNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import SplashScreen      from '../screens/auth/SplashScreen';
import LoginScreen       from '../screens/auth/LoginScreen';
import RegisterScreen    from '../screens/auth/RegisterScreen';
import OTPScreen         from '../screens/auth/OTPScreen';
import MerchantRegister  from '../screens/merchant/MerchantRegisterScreen';
import SetPinScreen from '../screens/auth/SetPinScreen';

import BuyerNavigator    from './BuyerNavigator';
import MerchantNavigator from './MerchantNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { isLoggedIn, role } = useSelector(state => state.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        // Écrans d'authentification
        <>
          <Stack.Screen name="Splash"    component={SplashScreen} />
          <Stack.Screen name="Login"     component={LoginScreen} />
          <Stack.Screen name="Register"  component={RegisterScreen} />
          <Stack.Screen name="OTP"       component={OTPScreen} />
          <Stack.Screen name="SetPin" component={SetPinScreen} />
          <Stack.Screen name="MerchantRegister" component={MerchantRegister} />
        </>
      ) : role === 'MERCHANT' ? (
        <Stack.Screen name="MerchantApp" component={MerchantNavigator} />
      ) : (
        <Stack.Screen name="BuyerApp"    component={BuyerNavigator} />
      )}
    </Stack.Navigator>
  );
}
