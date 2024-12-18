import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator,Image } from 'react-native';
import { firestore } from '../firebase/firebaseConfig'; // Firebase config

import * as SecureStore from 'expo-secure-store';

import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Video } from 'expo-av';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';
import CommentInput from './CommentInput';
import PostItem from './PostItem';
import styles from '../styles/_commentStyle';

const CommentModal = ({ CommentToggleModal, postId }) => {
  const [comments, setComments] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewableItems, setViewableItems] = useState([]);


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


  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.item.id));
  });

  useEffect(() => {
    const unsubscribePosts = firestore
      .collection('Posts')
      .onSnapshot((snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Firestore'dan gelen veriyi filtrele
        const filteredComments = postsData.filter(
          (post) => post.replyPostID === postId && post.postType === 'Comment'
        );

        setComments(filteredComments);
        setLoading(false);
      });

    const unsubscribeUsers = firestore
      .collection('Users')
      .onSnapshot((snapshot) => {
        const usernamesData = {};
        const profilePicturesData = {};
        snapshot.docs.forEach((doc) => {
          const userData = doc.data();
          usernamesData[doc.id] = userData.username;
          profilePicturesData[doc.id] = userData.profilePicture;
        });
        setUsernames(usernamesData);
        setProfilePictures(profilePicturesData);
      });

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, [postId]);

  const renderPost = ({ item: post }) => {
    const username = usernames[post.userId];
    const profilePicture = profilePictures[post.userId]; // `post.id` yerine `post.userId` kullanılıyor.
    const isFocused = viewableItems.includes(post.id);

    return (
      <PostItem
        post={post}
        username={username}
        profilePicture={profilePicture}
        isFocused={isFocused}
      />
    );
  };

  return (
    <Modal transparent animationType="slide" visible={true}>
      <View style={styles.modalBackground}>
        <TouchableOpacity onPress={CommentToggleModal} style={styles.overlay} activeOpacity={1} />

        <View style={styles.modalContent}>
          <View style={styles.dragHandleContainer}>
            <TouchableOpacity style={styles.dragHandle} onPress={CommentToggleModal} />
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Yorumlar</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
          ) : (
            <View style={styles.commentList}>
              <FlatList
                data={comments}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={{
                  itemVisiblePercentThreshold: 69, // Görünürlük eşiği
                }}
              />
            </View>
                )}
          <View style={styles.commentInputContainer}>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginVertical: 5 }}>
            <Image
              source={{
                uri: userData && userData.profilePicture
                  ? userData.profilePicture
                  : 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png',
              }}
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
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;
