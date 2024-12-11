import React, { useState,useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { firestore } from '../firebase/firebaseConfig';
import * as SecureStore from 'expo-secure-store';
import { serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

import Ionicons from '@expo/vector-icons/Ionicons';

import styles from '../styles/_uploadPostStyle';

const PostAddComponent = ({ toggleModal }) => {
    const [text, setText] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [videoUri, setVideoUri] = useState(null); 
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [userId, setUserId] = useState(null);


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
          setVideoUri(null); 
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
          setImageUri(null); 
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
            const imageRef = ref(storage, `_postImageFile/${uniqueFileName}`);
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
            const videoRef = ref(storage, `_postVideoFile/${uniqueFileName}`);
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
          videoUri: uploadedVideoUrl, 
        };
    
        try {
          await firestore.collection('Posts').add(postData);
          console.log('Gönderi başarıyla kaydedildi:', postData);
          setText('');
          setImageUri(null);
          setVideoUri(null); 
          toggleModal();
        } catch (error) {
          console.error('Gönderi kaydedilirken hata oluştu:', error);
        }
    };

    return (
      <Modal animationType="slide">
        <View style={styles.modalBackground}>
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
                source={{ uri: videoUri }} 
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
        </View>
  
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={toggleModal} // Close modal on press
        >
          <Ionicons name="close" size={40} color="#FFF" />
        </TouchableOpacity>
      </Modal>
    );
  };
  

 
 
export default PostAddComponent;
