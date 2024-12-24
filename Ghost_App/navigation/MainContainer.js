// MainContainer.js
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../styles/tab_nav';

import PostScreen from './screens/PostScreen';
import SearchScreen from './screens/SearchScreen';
import MessageScreen from './screens/MessageScreen';
import AccountScreen from './screens/AccountScreen';
import EmptyScreen from './screens/EmptyScreen';

import PostAddComponent from '../components/PostAdd';

const postName = 'Gönderiler';
const searchName = 'Arama';
const messageName = 'Mesajlar';
const accountName = 'Hesap';
const emptyName = ' ';

const Tab = createBottomTabNavigator();

export default function MainContainer() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    console.log(isModalVisible);

  };

  return (
    <View style={styles.container}>
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
          tabBarInactiveTintColor: '#555555',
          tabBarStyle: styles.tabBar,
          headerStyle: styles.headerStyle,
          
          headerTitleAlign: 'center',
        })}>
        <Tab.Screen name={postName} component={PostScreen} options={{ headerShown: true }} />
        <Tab.Screen name={searchName} component={SearchScreen} options={{ headerShown: true }} />
        <Tab.Screen
          name={emptyName}
          component={EmptyScreen}
          options={{
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tab.Screen name={messageName} component={MessageScreen} options={{ headerShown: true }} />
        <Tab.Screen name={accountName} component={AccountScreen} options={{ headerShown: true }} />
      </Tab.Navigator>

      {isModalVisible && (
        <PostAddComponent toggleModal={toggleModal} />
      )}

      <TouchableOpacity style={styles.fabButton} onPress={toggleModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
