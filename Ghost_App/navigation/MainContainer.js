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
import { Video } from 'expo-av'; // expo-av'den Video bileşenini import ediyoruz

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
  const [videoUri, setVideoUri] = useState(null); // Yeni state video URI'si için
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
      setVideoUri(null); // Video seçildiğinde fotoğrafı sıfırla
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setImageUri(null); // Video seçildiğinde fotoğrafı sıfırla
    }
  };

  const savePost = async () => {
    if ((text.trim() === '' && !imageUri && !videoUri) || !userId) {
      Alert.alert('Hata', 'Metin boş veya kullanıcı kimliği eksik.');
      return;
    }

    let uploadedImageUrl = null;
    let uploadedVideoUrl = null;

    // Fotoğraf yükleme
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

    // Video yükleme
    if (videoUri) {
      try {
        const storage = getStorage();
        const uniqueFileName = `${userId}_${Date.now()}`;
        const videoRef = ref(storage, `_postFile/${uniqueFileName}`);
        const response = await fetch(videoUri);
        const blob = await response.blob();

        await uploadBytes(videoRef, blob);
        console.log('Video başarıyla yüklendi.');

        uploadedVideoUrl = await getDownloadURL(videoRef);
        console.log('Video URL:', uploadedVideoUrl);
      } catch (error) {
        console.error('Video yüklenirken hata oluştu:', error);
        Alert.alert('Hata', 'Video yüklenirken bir sorun oluştu.');
        return;
      }
    }

    const postData = {
      text,
      userId,
      createdAt: serverTimestamp(),
      imageUri: uploadedImageUrl,
      videoUri: uploadedVideoUrl, // Video URL'sini kaydediyoruz
    };

    try {
      await firestore.collection('Posts').add(postData);
      console.log('Gönderi başarıyla kaydedildi:', postData);
      setText('');
      setImageUri(null);
      setVideoUri(null); // Video ve fotoğraf sıfırlanıyor
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
        })}>
        <Tab.Screen name={postName} component={PostScreen} options={{ headerShown: true }} />
        <Tab.Screen name={searchName} component={SearchScreen} options={{ headerShown: true }} />
        <Tab.Screen name={emptyName} component={EmptyScreen} options={{ tabBarStyle: { display: 'none' } }} />
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
              source={{ uri: profileImage }}
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
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.MainImage} />
            </View>
          )}
          
          {videoUri && (
            <View>
              <Video style={styles.MainImage}
                source={{ uri: videoUri }} // Seçilen video URI'si
                isLooping
                resizeMode="contain"
                useNativeControls
              />
            </View>
          )}

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
              <Ionicons name="image-outline" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickVideo} style={styles.imagePickerButton}>
              <Ionicons name="videocam-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={savePost} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Paylaş</Text>
            </TouchableOpacity>
        </View>
      </Modal>
      <TouchableOpacity style={styles.fabButton} onPress={toggleModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
