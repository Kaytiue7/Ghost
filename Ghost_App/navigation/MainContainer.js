import React, { useState, useEffect } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { firestore } from '../firebase/firebaseConfig';
import * as SecureStore from 'expo-secure-store';
import { serverTimestamp } from 'firebase/firestore';

import PostScreen from './screens/PostScreen';
import SearchScreen from './screens/SearchScreen';
import MessageScreen from './screens/MessageScreen';
import AccountScreen from './screens/AccountScreen';

import styles from '../styles/tab_nav'; // Styles dosyasını import edin

const postName = 'Gönderiler';
const searchName = 'Arama';
const messageName = 'Mesajlar';
const accountName = 'Hesap';

const Tab = createBottomTabNavigator();

export default function MainContainer() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [text, setText] = useState(''); // Metin giriş değeri
  const [username, setUsername] = useState(''); // Kullanıcı adı
  const [userId, setUserId] = useState(null); // Kullanıcı ID

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        setUserId(storedUserId);
        if (storedUserId) {
          const userDocRef = firestore.collection('Users').doc(storedUserId);
          const userDocSnapshot = await userDocRef.get();

          if (userDocSnapshot.exists) {
            setUsername(userDocSnapshot.data().username);
          } else {
            console.log('Kullanıcı bilgisi bulunamadı.');
          }
        }
      } catch (error) {
        console.error('Kullanıcı verileri alınırken bir hata oluştu:', error);
      }
    };

    fetchData();
  }, []);

  const savePost = async () => {
    if (text.trim() === '' || !userId) {
      console.log('Metin boş veya kullanıcı kimliği eksik.');
      return;
    }

    const postData = {
      text,
      userId,
      createdAt: serverTimestamp(),
    };

    try {
      await firestore.collection('Posts').add(postData);
      console.log('Gönderi başarıyla kaydedildi:', postData);
      setText(''); // Giriş alanını temizle
    } catch (error) {
      console.error('Gönderi kaydedilirken hata oluştu:', error);
    }
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
          tabBarInactiveTintColor: '#B0BEC5',
          tabBarStyle: styles.tabBar,
          headerStyle: styles.headerStyle,
          headerTitle: () => (
            <Image
              source={require('../assets/icon.png')}
              style={styles.headerImage}
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

      {/* Modal (Pop-up) */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        backdropColor="black"
        backdropOpacity={0.7}
        style={styles.modalStyle}
      >
        <View style={styles.modalContent}>
          <View style={styles.profileInfo}>
            <Image style={styles.profileImage} />
            <Text style={styles.username}>{username}</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Bir şeyler yazın..."
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity style={styles.saveButton} onPress={savePost}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fabButton} onPress={toggleModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
