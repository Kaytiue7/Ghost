import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator,Image } from 'react-native';
import { Video } from 'expo-av';

import * as SecureStore from 'expo-secure-store';

import * as ImagePicker from 'expo-image-picker';

import { firestore } from '../firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';

import stylesInput from '../styles2/input';
import stylesButton from '../styles2/button';
import stylesMedia from '../styles2/media';
import stylesText from '../styles2/text';
import stylesView from '../styles2/view';

import Ionicons from '@expo/vector-icons/Ionicons';

import PostItem from './PostItem';



const CommentModal = ({ CommentToggleModal, postId }) => {
  const [comments, setComments] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewableItems, setViewableItems] = useState([]);


  const [commentText, setCommentText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null); 
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null); 


  useEffect(() => {
      const fetchUserId = async () => {
        const storedUserId = await SecureStore.getItemAsync('userId');
        setUserId(storedUserId);
      };
  
      // kullanıcı veirleir
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
    }, [userId]); 
  
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

    const savePost = async () => {
      if (!((commentText.trim() ||( imageUri || videoUri)) && userId)) {
        Alert.alert('Hata', 'Metin boş veya kullanıcı kimliği eksik.');
        return;
      }
  
      let uploadedImageUrl = null;
      let uploadedVideoUrl = null;
  

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
    const profilePicture = profilePictures[post.userId]; 
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
      <View style={stylesView.CommentModalBackground}>
        <TouchableOpacity onPress={CommentToggleModal} style={{flex: 1, backgroundColor:'transparent'}} activeOpacity={1} />

        <View style={{width: '100%', height: '80%', backgroundColor: '#222', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden'}}>
          <View style={{alignItems: 'center', paddingVertical: 5, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30}}>
            <TouchableOpacity style={{width: 60, height: 6, borderRadius: 3, backgroundColor: '#CCC',}} onPress={CommentToggleModal} />
          </View>

          <View style={{backgroundColor: '#FFF', paddingVertical: 5, alignItems: 'center', justifyContent: 'center',}}>
            <Text style={stylesText.blackLarge}>Yorumlar</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff"/>
          ) : (
            <View style={{flex: 1,  backgroundColor: '#111',  borderWidth:1, borderColor:'#000'}}>
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
          <View style={stylesView.CommentModal}>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginVertical: 5 }}>
            <Image
              source={{
                uri: userData && userData.profilePicture
                  ? userData.profilePicture
                  : 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png',
              }}
              style={stylesMedia.ProfilePictureMini}
/>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Yorum Ekle..."
                placeholderTextColor="#aaa"
                style={stylesInput.BlackInputStyle}
              />
              <TouchableOpacity onPress={savePost} style={stylesButton.BlueCirlePickerButon}>
                <Ionicons name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {imageUri && (
              <View>

                <Image source={{ uri: imageUri }} style={stylesMedia.Media} />
              </View>
            )}

            {videoUri && (
              <View>
                <Video
                  style={stylesMedia.Media}
                  source={{ uri: videoUri }}
                  isLooping
                  resizeMode="contain"
                  useNativeControls
                />
              </View>
            )}

            <View style={{flexDirection:'row',paddingBottom:5,justifyContent:'space-evenly'}}>

              <TouchableOpacity onPress={pickImage} style={stylesButton.GreenCirclePickerButtonMini}>
                <Ionicons name="image-outline" size={25} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={pickVideo} style={stylesButton.GreenCirclePickerButtonMini}>
                <Ionicons name="videocam-outline" size={25} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={pickCamera} style={stylesButton.GreenCirclePickerButtonMini}>
                <Ionicons name="camera-outline" size={25} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;  