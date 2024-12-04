import React, { useState, useEffect } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { firestore } from '../firebase/firebaseConfig';
import * as SecureStore from 'expo-secure-store';
import { serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

import PostScreen from './screens/PostScreen';
import SearchScreen from './screens/SearchScreen';
import MessageScreen from './screens/MessageScreen';
import AccountScreen from './screens/AccountScreen';
import EmptyScreen from './screens/EmptyScreen';

import styles from '../styles/tab_nav';

const postName = 'Gönderiler';
const searchName = 'Arama';
const messageName = 'Mesajlar';
const accountName = 'Hesap';
const emptyName = ' ';

const Tab = createBottomTabNavigator();

export default function MainContainer() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);

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
            const userData = userDocSnapshot.data();
            setUsername(userData.username);
            setProfileImage(userData.profilePicture || 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png',); // Varsayılan URL
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const savePost = async () => {
    if ((text.trim() === '' && !imageUri) || !userId) {
      Alert.alert('Hata', 'Metin boş veya kullanıcı kimliği eksik.');
      return;
    }

    let uploadedImageUrl = null;

    if (imageUri) {
      try {
        const storage = getStorage();
        const uniqueFileName = `${userId}_${Date.now()}`;
        const imageRef = ref(storage, `_postFile/${uniqueFileName}`);
        const response = await fetch(imageUri);
        const blob = await response.blob();

        await uploadBytes(imageRef, blob);
        console.log('Fotoğraf başarıyla yüklendi.');

        uploadedImageUrl = await getDownloadURL(imageRef);
        console.log('Fotoğraf URL:', uploadedImageUrl);
      } catch (error) {
        console.error('Fotoğraf yüklenirken hata oluştu:', error);
        Alert.alert('Hata', 'Fotoğraf yüklenirken bir sorun oluştu.');
        return;
      }
    }

    const postData = {
      text,
      userId,
      createdAt: serverTimestamp(),
      imageUri: uploadedImageUrl,
    };

    try {
      await firestore.collection('Posts').add(postData);
      console.log('Gönderi başarıyla kaydedildi:', postData);
      setText('');
      setImageUri(null);
      toggleModal();
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
          tabBarInactiveTintColor: '#555555',
          tabBarStyle: styles.tabBar,
          headerStyle: styles.headerStyle,
          headerTitle: () => (
            <Image
              source={require('../assets/whiteghost.png')}
              style={styles.headerImage}
            />
          ),
          headerTitleAlign: 'center',
        })}
      >
        <Tab.Screen name={postName} component={PostScreen} options={{ headerShown: true }} />
        <Tab.Screen name={searchName} component={SearchScreen} options={{ headerShown: true }} />
        <Tab.Screen
          name={emptyName}
          component={EmptyScreen}  // Yeni ekranı buraya ekliyoruz
          options={{
            tabBarStyle: { display: 'none' },  // Butonu gizlemek için bu satırı ekliyoruz
          }}
        />
        <Tab.Screen name={messageName} component={MessageScreen} options={{ headerShown: true }} />
        <Tab.Screen name={accountName} component={AccountScreen} options={{ headerShown: true }} />
      </Tab.Navigator>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        backdropOpacity={0}
        style={styles.modalStyle}
      >
        <View style={styles.modalContent}>
          <View style={styles.profileInfo}>
            <Image
              source={{
                uri: profileImage 
              }}
              style={styles.profileImage}
            />
            <Text style={styles.username}>@{username}</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Bir şeyler yazın..."
              value={text}
              onChangeText={setText}
            />
          </View>

          {imageUri && (
            <Image
              source={{
                uri: imageUri,
              }}
              style={styles.MainImage}
            />
          )}

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Ionicons name="image" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
              <Ionicons name="camera" size={30} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={savePost}>
            <Text style={styles.sendButtonText}>Gönder</Text>
            <Ionicons name="send" size={18} color="#fff" style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fabButton} onPress={toggleModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
