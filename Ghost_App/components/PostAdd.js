import React, { useState,useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text, Alert, Modal } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import * as SecureStore from 'expo-secure-store';
import { serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

import Ionicons from '@expo/vector-icons/Ionicons';

import stylesInput from '../styles2/input';
import stylesButton from '../styles2/button';
import stylesMedia from '../styles2/media';
import stylesText from '../styles2/text';
import stylesView from '../styles2/view';

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
    
      const pickCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All, // Can be set to Images or Videos if you want only one type
          allowsEditing: true,
          quality: 1, // Adjust this as needed
        });
      
        if (!result.canceled) {
          if (result.assets[0].type.includes('image')) {
            setImageUri(result.assets[0].uri);
            setVideoUri(null); // Reset video if an image is picked
          } else if (result.assets[0].type.includes('video')) {
            setVideoUri(result.assets[0].uri);
            setImageUri(null); // Reset image if a video is picked
          }
        }
      }


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
          text: text.trim() === '' ? null : text,
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
        <Modal transparent animationType="slide">
          <View style={stylesView.ModalBackground}>
          <TouchableOpacity
            style={stylesButton.X_CloseButton}
            onPress={toggleModal} >
            <Ionicons name="close" size={40} color="#FFF" />
          </TouchableOpacity>

          <View style={stylesView.PopOutModal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Image
                source={{ uri: profileImage }}
                style={stylesMedia.ProfilePicture}
              />
              <Text style={stylesText.whiteMedium}>@{username}</Text>
            </View>
  
            <View>
              <TextInput
                style={stylesInput.StandartInputStyle}
                placeholder="Bir şeyler yazın..."
                placeholderTextColor="#FFFFFF"
                value={text}
                onChangeText={setText}
              />
            </View>
  
            {imageUri && (
              <View>
                <Image source={{ uri: imageUri }} style={stylesMedia.Media} />
              </View>
            )}
            
            {videoUri && (
              <View>
                <Video style={stylesMedia.Media}
                  source={{ uri: videoUri }} 
                  isLooping
                  resizeMode="contain"
                  useNativeControls
                />
              </View>
            )}
  
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 20 }}>
              <TouchableOpacity onPress={pickImage} style={stylesButton.GreenCirclePickerButton}>
                <Ionicons name="image-outline" size={30} color="white" />
              </TouchableOpacity>
  
              <TouchableOpacity onPress={pickVideo} style={stylesButton.GreenCirclePickerButton}>
                <Ionicons name="videocam-outline" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={pickCamera} style={stylesButton.GreenCirclePickerButton}>
                <Ionicons name="camera-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={savePost} style={stylesButton.BlueStandartButton}>
                <Text style={stylesText.whiteSmall}>Paylaş</Text>
              </TouchableOpacity>
            </View>
          </View> 
        </Modal>
      );
    };
    
  
   
   
  export default PostAddComponent;
  