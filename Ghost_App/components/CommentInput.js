import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { firestore } from '../firebase/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Video } from 'expo-av';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';
import styles from '../styles/_commentStyle';

const CommentInput = ({ postId }) => {
  const [commentText, setCommentText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null); // 'image' or 'video'
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null); // State to store user data

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };

    // Fetch user data after getting the userId
    const fetchUserData = async () => {
      if (userId) {
        try {
          const userDocSnapshot = await firestore.collection('Users').doc(userId).get();
          if (userDocSnapshot.exists) {
            setUserData(userDocSnapshot.data());
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      }
    };

    fetchUserId();
    fetchUserData();
  }, [userId]); // Only run fetchUserData when userId changes

  // Function to handle picking an image
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      if (result.assets[0].type.includes('image')) {
        setImageUri(result.assets[0].uri);
        setVideoUri(null);
      } else if (result.assets[0].type.includes('video')) {
        setVideoUri(result.assets[0].uri);
        setImageUri(null);
      }
    }
  };

  // Function to handle comment submission
  const savePost = async () => {
    if (!((commentText.trim() ||( imageUri || videoUri)) && userId)) {
      Alert.alert('Hata', 'Metin boş veya kullanıcı kimliği eksik.');
      return;
    }

    let uploadedImageUrl = null;
    let uploadedVideoUrl = null;

    // Fotoğraf yükleme
    if (imageUri) {
     
        const storage = getStorage();
        const uniqueFileName = `${userId}_${Date.now()}`;
        const imageRef = ref(storage, `_postImageFile/${uniqueFileName}`);
        const response = await fetch(imageUri);
        const blob = await response.blob();

        await uploadBytes(imageRef, blob);
        console.log('Fotoğraf başarıyla yüklendi.');

        uploadedImageUrl = await getDownloadURL(imageRef);
        console.log('Fotoğraf URL:', uploadedImageUrl);
      
      
    }

    // Video yükleme
    if (videoUri) {
      
        const storage = getStorage();
        const uniqueFileName = `${userId}_${Date.now()}`;
        const videoRef = ref(storage, `_postVideoFile/${uniqueFileName}`);
        const response = await fetch(videoUri);
        const blob = await response.blob();

        await uploadBytes(videoRef, blob);
        console.log('Video başarıyla yüklendi.');

        uploadedVideoUrl = await getDownloadURL(videoRef);
        console.log('Video URL:', uploadedVideoUrl);
      
      
    }

    const postData = {
      text: commentText,
      userId: userId,
      createdAt: serverTimestamp(),
      imageUri: uploadedImageUrl,
      videoUri: uploadedVideoUrl,
      replyPostID: postId,
      postType: 'Comment',
    };

   
    try {
        await firestore.collection('Posts').add(postData);
        console.log('Yorum başarıyla kaydedildi:', postData);
        setCommentText('');
        setImageUri(null);
        setVideoUri(null);
      } catch (error) {
        console.error('Gönderi kaydedilirken hata oluştu:', error);
      }
    };

  if (!userData) {
    return null;
  }

  return (
    <View style={styles.commentInputContainer}>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginVertical: 5 }}>
      <Image
          source={{ uri: userData.profilePicture || 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png' }}
          style={styles.profileImage}
        />
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Yorum Ekle..."
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TouchableOpacity onPress={savePost} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.MainImage} />
        </View>
      )}

      {videoUri && (
        <View>
          <Video
            style={styles.MainImage}
            source={{ uri: videoUri }}
            isLooping
            resizeMode="contain"
            useNativeControls
          />
        </View>
      )}

      <View style={styles.mediaPickerContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.mediaPickerButton}>
          <Ionicons name="image-outline" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={pickVideo} style={styles.mediaPickerButton}>
          <Ionicons name="videocam-outline" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={pickCamera} style={styles.mediaPickerButton}>
          <Ionicons name="camera-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentInput;
