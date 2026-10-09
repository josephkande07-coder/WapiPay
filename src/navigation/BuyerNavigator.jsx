import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import { Ionicons }                 from '@expo/vector-icons';
import { useSelector }              from 'react-redux';
import { colors }                   from '../theme';
import { selectCartCount }          from '../store/slices/cartSlice';

import HomeScreen               from '../screens/buyer/HomeScreen';
import SearchScreen             from '../screens/buyer/SearchScreen';
import ShopScreen               from '../screens/buyer/ShopScreen';
import ProductScreen            from '../screens/buyer/ProductScreen';
import CartScreen               from '../screens/buyer/CartScreen';
import CheckoutScreen           from '../screens/buyer/CheckoutScreen';
import PaymentScreen            from '../screens/buyer/PaymentScreen';
import OrdersScreen             from '../screens/buyer/OrdersScreen';
import OrderTrackingScreen      from '../screens/buyer/OrderTrackingScreen';
import ReviewScreen             from '../screens/buyer/ReviewScreen';
import ProfileScreen            from '../screens/shared/ProfileScreen';
import EditProfileScreen        from '../screens/shared/EditProfileScreen';
import ChangePinScreen          from '../screens/shared/ChangePinScreen';
import InfoScreen               from '../screens/shared/InfoScreen';
import BuyerNotificationsScreen from '../screens/buyer/BuyerNotificationsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Shop"     component={ShopScreen} />
      <Stack.Screen name="Product"  component={ProductScreen} />
    </Stack.Navigator>
  );
}

// ═══ NOUVEAU ═══
// L onglet Explorer n avait pas son propre stack : SearchScreen etait
// une Tab.Screen "nue", sans aucun moyen d aller vers Shop ou Product
// depuis un resultat de recherche. Meme logique que HomeStack.
function ExplorerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="Shop"       component={ShopScreen} />
      <Stack.Screen name="Product"    component={ProductScreen} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Payment"  component={PaymentScreen} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain"    component={OrdersScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="Review"        component={ReviewScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain"   component={ProfileScreen} />
      <Stack.Screen name="EditProfile"   component={EditProfileScreen} />
      <Stack.Screen name="ChangePin"     component={ChangePinScreen} />
      <Stack.Screen name="Info"          component={InfoScreen} />
      <Stack.Screen name="Notifications" component={BuyerNotificationsScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="Review"        component={ReviewScreen} />
    </Stack.Navigator>
  );
}

export default function BuyerNavigator() {
  const cartCount = useSelector(selectCartCount);

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
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if      (route.name === 'Accueil')   iconName = focused ? 'home'   : 'home-outline';
          else if (route.name === 'Explorer')  iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Panier')    iconName = focused ? 'cart'   : 'cart-outline';
          else if (route.name === 'Commandes') iconName = focused ? 'cube'   : 'cube-outline';
          else if (route.name === 'Profil')    iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil"   component={HomeStack} />
      <Tab.Screen name="Explorer"  component={ExplorerStack} />
      <Tab.Screen
        name="Panier"
        component={CartStack}
        options={{
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, color: '#fff', fontSize: 10 },
        }}
      />
      <Tab.Screen name="Commandes" component={OrdersStack} />
      <Tab.Screen name="Profil"    component={ProfileStack} />
    </Tab.Navigator>
  );
}