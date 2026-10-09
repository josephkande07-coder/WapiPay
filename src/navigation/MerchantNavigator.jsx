import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import { Ionicons }                 from '@expo/vector-icons';
import { colors }                   from '../theme';

import DashboardScreen             from '../screens/merchant/DashboardScreen';
import MyShopScreen                from '../screens/merchant/MyShopScreen';
import AddProductScreen            from '../screens/merchant/AddProductScreen';
import MerchantOrdersScreen        from '../screens/merchant/MerchantOrdersScreen';
import MerchantOrderDetailScreen   from '../screens/merchant/MerchantOrderDetailScreen';
import WithdrawScreen              from '../screens/merchant/WithdrawScreen';
import MerchantNotificationsScreen from '../screens/merchant/MerchantNotificationsScreen';
import ProfileScreen               from '../screens/shared/ProfileScreen';
import EditProfileScreen           from '../screens/shared/EditProfileScreen';
import ChangePinScreen             from '../screens/shared/ChangePinScreen';
import InfoScreen                  from '../screens/shared/InfoScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="Withdraw"      component={WithdrawScreen} />
      <Stack.Screen name="Notifications" component={MerchantNotificationsScreen} />
      <Stack.Screen name="OrderDetail"   component={MerchantOrderDetailScreen} />
    </Stack.Navigator>
  );
}

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyShopMain" component={MyShopScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain"  component={MerchantOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={MerchantOrderDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePin"   component={ChangePinScreen} />
      <Stack.Screen name="Info"        component={InfoScreen} />
    </Stack.Navigator>
  );
}

export default function MerchantNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.overlay,
          borderTopColor:  colors.border,
          borderTopWidth:  1,
          paddingBottom:   8,
          paddingTop:      6,
          height:          62,
        },
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if      (route.name === 'Dashboard')  iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Boutique')   iconName = focused ? 'storefront'  : 'storefront-outline';
          else if (route.name === 'Commandes')  iconName = focused ? 'cube'        : 'cube-outline';
          else if (route.name === 'Parametres') iconName = focused ? 'settings'    : 'settings-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardStack} />
      <Tab.Screen name="Boutique"   component={ShopStack} />
      <Tab.Screen name="Commandes"  component={OrdersStack} />
      <Tab.Screen name="Parametres" component={ProfileStack} />
    </Tab.Navigator>
  );
}