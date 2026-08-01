import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

// Version avec les VRAIS logos - a utiliser une fois que tu as place
// tes fichiers .png dans WapiPay/assets/logos/
// Noms attendus exactement : mpesa.png, airtel.png, orange.png
const LOGOS = {
  mpesa:        require('../../assets/logos/mpesa.png'),
  airtel_money: require('../../assets/logos/airtel.png'),
  orange_money: require('../../assets/logos/orange.png'),
};

export default function PaymentMethodIcon({ method, size = 44 }) {
  const source = LOGOS[method];
  if (!source) return null;
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.32 }]}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});
