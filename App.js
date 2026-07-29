import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';
import { loadToken } from './src/services/api';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadToken();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.navy} />
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}