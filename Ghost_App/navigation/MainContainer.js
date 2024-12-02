import * as React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PostScreen from './screens/PostScreen';
import SearchScreen from './screens/SearchScreen';
import MessageScreen from './screens/MessageScreen';
import AccountScreen from './screens/AccountScreen';

const postName = 'Post';
const searchName = 'Search';
const messageName = 'Message';
const accountName = 'Account';

const Tab = createBottomTabNavigator();

export default function MainContainer() {
  return (
    <Tab.Navigator
      initialRouteName={postName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === postName) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (rn === searchName) {
            iconName = focused ? 'search' : 'search-outline';
          } else if (rn === messageName) {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (rn === accountName) {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#808080',
        tabBarStyle: { backgroundColor: '#fff' },
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTitle: () => (
          <Image
            source={require('../assets/icon.png')}
            style={{ width: 120, height: 50, resizeMode: 'contain' }}
          />
        ),
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name={postName} component={PostScreen} options={{ headerShown: true }} />
      <Tab.Screen name={searchName} component={SearchScreen} options={{ headerShown: true }} />
      <Tab.Screen name={messageName} component={MessageScreen} options={{ headerShown: true }} />
      <Tab.Screen name={accountName} component={AccountScreen} options={{ headerShown: true }} />
    </Tab.Navigator>
  );
}
