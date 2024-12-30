import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, RefreshControlComponent, Alert } from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as SecureStore from 'expo-secure-store';
import { firestore } from '../firebase/firebaseConfig';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Permissions from "expo-permissions";
import Toast from 'react-native-toast-message'; 

import PostReplyComponent from './PostReplyAdd';
import PostReplyItemComponent from './PostReplyItem';
import PostModelComponent from './CommentModal';

import { useNavigation } from '@react-navigation/native';
import { serverTimestamp } from '@firebase/firestore';


import stylesInput from '../styles2/input';
import stylesButton from '../styles2/button';
import stylesMedia from '../styles2/media';
import stylesText from '../styles2/text';
import stylesView from '../styles2/view';

export default function PostItem({ post, username, profilePicture }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [likesCount, setLikesCount] = useState(0); 
  const [saveCount, setSaveCount] = useState(0);
  const [replysCount, setReplysCount] = useState(0);
  const [commentCount,setCommentCount]= useState(0);
  const [liked, setLiked] = useState(false); 
  const [saved,setSaved] = useState(false);
  const hideControlsTimeout = useRef(null);
  const isFocused = useIsFocused();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);

  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const [userId, setUserId] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
  
    fetchUserId();
  }, []);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Medya kütüphanesine erişim izni verilmedi!');
      }
    };
    getPermissions();
  }, []);

  // Firestore'dan beğeni sayısını çekmek
  useEffect(() => {
    const fetchLikesCount = async () => {
      const postLikesRef = firestore
        .collection('Posts')
        .doc(post.id)
        .collection('UsersLiked');
      
      const snapshot = await postLikesRef.get();
      setLikesCount(snapshot.size); // Snapshot'taki belge sayısını al
    };

    const fetchReplyCount = async () => {
      const postLikesRef = firestore
        .collection('Posts')
        .where("postType","==","Reply")
        .where("replyPostID","==",post.id);
      
      const snapshot = await postLikesRef.get();
      setReplysCount(snapshot.size); 
    };
    const fetchCommmentCount = async () => {
      const postLikesRef = firestore
        .collection('Posts')
        .where("postType","==","Comment")
        .where("replyPostID","==",post.id);
      
      const snapshot = await postLikesRef.get();
      setCommentCount(snapshot.size); 
    };

    const checkIfLiked = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      if (!storedUserId) return;
      
      const postLikesRef = firestore
        .collection('Posts')
        .doc(post.id)
        .collection('UsersLiked');
        
      const querySnapshot = await postLikesRef
        .where('userId', '==', storedUserId)
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        setLiked(true); // Kullanıcı beğenmişse liked state'ini true yap
      }
    };

    fetchLikesCount(); 
    checkIfLiked(); 
    fetchReplyCount();
    fetchCommmentCount();

  }, [isFocused, post.id]);

  // Sayfa odaktan çıkarsa videoyu durdur
  useEffect(() => {
    if (!isFocused && videoRef.current) {
      videoRef.current.pauseAsync();
      setIsPlaying(false);
    }

    if (showControls) {
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 5000);
    } else {
      clearTimeout(hideControlsTimeout.current);
    }

    return () => {
      clearTimeout(hideControlsTimeout.current);
    };
  }, [isFocused, showControls]);



  const toggleModal = () => {
    setIsReplyModalVisible(!isReplyModalVisible);
    console.log(isReplyModalVisible);

  };
  const CommentToggleModal = () => {
    setIsCommentModalVisible(!isCommentModalVisible);
    console.log("isCommentModalVisible",isCommentModalVisible);
  };

  const handleLike = async () => {
    try {
      const storedUserId = await SecureStore.getItemAsync('userId'); // Kullanıcı ID'sini alın.
      if (!storedUserId) {
        console.log('Kullanıcı ID bulunamadı.');
        return;
      }
  
      const postLikesRef = firestore
        .collection('Posts')
        .doc(post.id)
        .collection('UsersLiked');
  
      const querySnapshot = await postLikesRef
        .where('userId', '==', storedUserId)
        .limit(1)
        .get();
  
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        await postLikesRef.doc(docId).delete();
        console.log(`Post ${post.id} için kullanıcı ${storedUserId} beğenisi kaldırıldı.`);
        setLikesCount(likesCount - 1); // Beğeni sayısını güncelle
        setLiked(false); // Beğeni kaldırıldı
      } else {
        await postLikesRef.add({
          postId: post.id,
          userId: storedUserId,
          createdAt: serverTimestamp(),
        });
        console.log(`Post ${post.id} için kullanıcı ${storedUserId} beğenisi eklendi.`);
        setLikesCount(likesCount + 1); // Beğeni sayısını güncelle
        setLiked(true); // Kullanıcı beğendi
      }
    } catch (error) {
      console.error('Beğeni işlemi sırasında hata oluştu:', error);
    }
  };

  const handleSave = async () => {
  try{
    const storedUserId = await SecureStore.getItemAsync('userId');
    if (!storedUserId) {
      console.log('Kullanıcı ID bulunamadı.');
      return;
    }
    const postSaveRef = firestore.collection('Posts')
    .doc(post.id)
    .collection('UsersSaved');

    const querySnapshot = await postSaveRef
    .where('userId', '==', storedUserId)
    .limit(1)
    .get();

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      await postSaveRef.doc(docId).delete();
      console.log(`Post ${post.id} için kullanıcı ${storedUserId} kaydedilenlerden kaldırıldı.`);
      setSaveCount(saveCount - 1); // Kaydetme sayısını güncelle
      setSaved(false); // Kaydetme kaldırıldı
    }else{
      await postSaveRef.add({
        postId: post.id,
        userId: storedUserId,
        createdAt: serverTimestamp(),
      });
        console.log(`Post ${post.id} için kullanıcı ${storedUserId} kaydedilenlerine eklendi.`);
        setSaveCount(saveCount + 1); // Kaydetme sayısını güncelle
        setSaved(true); // Kullanıcı kaydetti
      }
    } catch (error) {
      console.error('Kaydetme işlemi sırasında hata oluştu:', error);
    }
  };
  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
  
      const fileUri = post.videoUri || post.imageUri;
  
      console.log(fileUri);
      if (!fileUri) {
        console.log('İndirilecek bir dosya bulunamadı.');
        return;
      }
  
      const fileExtension = fileUri.includes('_postVideoFile') ? '.mp4' : '.jpg';
      const timestamp = new Date().getTime();
      const uniqueFileName = `downloaded_${timestamp}${fileExtension}`;
  
      const ghostFolderUri = FileSystem.documentDirectory + 'Ghost/';
      const folderInfo = await FileSystem.getInfoAsync(ghostFolderUri);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(ghostFolderUri);
      }
  
      const fullPath = ghostFolderUri + uniqueFileName;
      // Dosyayı indir
      const downloadResumable = FileSystem.createDownloadResumable(fileUri, fullPath);
      const { uri } = await downloadResumable.downloadAsync();
  
      // Medya kütüphanesine kaydet
      const asset = await MediaLibrary.createAssetAsync(uri);
  
      const albumName = 'Ghost';
      let album = await MediaLibrary.getAlbumAsync(albumName);
  
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }
  
     
    } catch (error) {
      console.error('İndirme işlemi sırasında bir hata oluştu:', error);
  
      
    }
  };
  

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.presentFullscreenPlayer();
    }
  };

  const handleSliderValueChange = async (value) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };
  

  const createdAt = post.createdAt?.seconds
    ? new Date(post.createdAt.seconds * 1000).toLocaleString()
    : 'Bilinmeyen Tarih';

  return (
    <View style={{flex:1}}>  
      <ScrollView
        scrollEventThrottle={16}>
            <View style={{flexDirection: 'row', padding: 10, borderBlockColor:'rgba(255, 255, 255, 0.6)', borderBottomWidth:0.5,}}>
            <TouchableOpacity onPress={() => navigation.navigate(userId === post.userId ? 'Hesap' : 'ForeingAccount', { foreingUserId: post.userId })
            }>
              <Image source={{ uri: profilePicture }} style={stylesMedia.ProfilePictureMax} />
            </TouchableOpacity>
            
            <View style={{flex:1}}>
              <View style={{flexDirection: 'row',  justifyContent: 'space-between',alignItems:'center', marginBottom: 5}}>
              <TouchableOpacity>
                <Text style={[stylesText.whiteMedium,{fontFamily: 'WorkSans-SemiBold',}]} onPress={() => navigation.navigate(userId === post.userId ? 'Hesap' : 'ForeingAccount', { foreingUserId: post.userId })}>@{username}</Text>
              </TouchableOpacity>
                <Text style={stylesText.whiteDarkVerySmall}>{createdAt}</Text>
              </View>

              {post.text && <Text style={[stylesText.whiteSmall, { marginBottom: 10, fontFamily: 'WorkSans-Regular', }]}>{post.text}</Text>}


              {post.imageUri && (
                <>
                  <TouchableOpacity
                    onPress={() => setIsImageModalVisible(true)}>
                    <Image source={{ uri: post.imageUri }} style={stylesMedia.MediaMax}></Image>
                    <TouchableOpacity onPress={handleDownload} style={{ position: 'absolute' ,top: '10%', left: '95%', transform: [{ translateX: -25 }, { translateY: -25 }], zIndex: 2,}}>
                      <Ionicons name="download" size={30} color="#FFF" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  <Modal
                    visible={isImageModalVisible}
                    transparent={true}
                    onRequestClose={() => setIsImageModalVisible(false)}
                  >
                    <View style={stylesView.Modal} onPress={() => setIsImageModalVisible(false)}>
                      <ImageViewer 
                        imageUrls={[{ url: post.imageUri }]}
                        style={stylesMedia.MediaModal}
                      />
                      <TouchableOpacity
                        style={stylesButton.X_CloseButton}
                        onPress={() => setIsImageModalVisible(false)}>
                        <Ionicons name="close" size={40} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </Modal>
                </>
              )}

              {post.videoUri && (
                <>
                  <TouchableOpacity
                    style={{backgroundColor: '#000', borderRadius: 20, marginBottom: 10, position: 'relative'}}
                    onPress={() => setShowControls(!showControls)}
                    activeOpacity={1}
                  >
                    <Video
                      ref={videoRef}
                      style={stylesMedia.MediaMax}
                      source={{ uri: post.videoUri }}
                      resizeMode="contain"
                      shouldPlay={isPlaying} // Video oynatma durumu
                      isMuted={isMuted}
                      onPress={handleFullscreen}
                      onPlaybackStatusUpdate={(status) => {
                        setVideoDuration(status.durationMillis);
                        setCurrentTime(status.positionMillis);

                        if (status.didJustFinish) {
                          videoRef.current.setPositionAsync(0);
                          videoRef.current.playAsync(); 
                        }
                      }}
                    />
                    {showControls && (
                      <>
                        <TouchableOpacity onPress={handleDownload} style={{ position: 'absolute' ,top: '10%', left: '95%', transform: [{ translateX: -25 }, { translateY: -25 }], zIndex: 2,}}>
                          <Ionicons name="download" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handlePlayPause}
                          style={{position: 'absolute', top: '50%', alignSelf: 'center', transform: [{ translateX: 0 }, { translateY: -25 }], zIndex: 2,}}
                        >
                          <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={50}
                            color="#FFF"
                          />
                        </TouchableOpacity>
                        <View style={{position: 'absolute', bottom: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10,}}>
                          <TouchableOpacity onPress={handleMute}>
                            <Ionicons
                              name={isMuted ? 'volume-mute' : 'volume-high'}
                              size={20}
                              color="#FFF"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              handlePlayPause();
                              setIsVideoModalVisible(true);
                            }}
                          >
                            <Ionicons name="expand" size={20} color="#FFF" />
                          </TouchableOpacity>
                        </View>

                        <Slider
                          style={{position: 'absolute', bottom: 40, width: '100%', height: 20,}}
                          value={currentTime}
                          minimumValue={0}
                          maximumValue={videoDuration}
                          onSlidingComplete={handleSliderValueChange}
                          minimumTrackTintColor="#FFF"
                          maximumTrackTintColor="#888"
                        />
                      </>
                    )}

                    <Modal
                      visible={isVideoModalVisible}
                      transparent={true}
                      onRequestClose={() => setIsVideoModalVisible(false)}
                    >
                      <View style={stylesView.Modal}>
                        <Video
                          style={stylesMedia.MediaModal}
                          source={{ uri: post.videoUri }}
                          resizeMode="contain"
                          shouldPlay={true} 
                          useNativeControls 
                          onPlaybackStatusUpdate={(status) => {
                            setVideoDuration(status.durationMillis);
                            setCurrentTime(status.positionMillis);
                          }}
                        />
                        <TouchableOpacity
                          style={stylesButton.X_CloseButton}
                          onPress={() => {
                            handlePlayPause();
                            setIsVideoModalVisible(false);
                          }}>
                          <Ionicons name="close" size={40} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </Modal>
                  </TouchableOpacity>
                </>
              )}
              {post.replyPostID && post.postType === "Reply" && (
                <PostReplyItemComponent replyPostID={post.replyPostID} />
              )}

              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10,}}>
                <View style={{flexDirection: 'row', gap: 15,}}>
                  <View style={{flexDirection: 'row', gap: 10,}}>
                    <TouchableOpacity onPress={handleLike}>
                      <Ionicons
                        name={liked ? 'heart' : 'heart-outline'}
                        size={24}
                        color={liked ? '#cc001a' : '#FFF'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={[stylesText.whiteMedium, { verticalAlign: 'bottom',fontSize: 20,}]}>{likesCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', gap: 10,}}>
                    <TouchableOpacity onPress={toggleModal}>
                      <Ionicons name="arrow-redo-outline" size={26} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={[stylesText.whiteMedium, { verticalAlign: 'bottom',fontSize: 20,}]}>{replysCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', gap: 10,}}>
                    <TouchableOpacity onPress={CommentToggleModal}>
                      <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={[stylesText.whiteMedium, { verticalAlign: 'bottom',fontSize: 20,}]}>{commentCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', gap: 10,}}>
                    <TouchableOpacity onPress={handleSave}>
                      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={[stylesText.whiteMedium, { verticalAlign: 'bottom',fontSize: 20,}]}>{saveCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', gap: 10,}}>
                    <TouchableOpacity>
                      <Ionicons name="share-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={{flexDirection: 'row', gap: 10,}}>
                    <TouchableOpacity>
                      <Ionicons name="ellipsis-horizontal-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                  
                </View>
              </View>
            </View>
          </View>
        </ScrollView>


      {isReplyModalVisible && (
        <PostReplyComponent toggleModal={toggleModal} postId={post.id}/>
      )}
      {isCommentModalVisible && (
        <PostModelComponent CommentToggleModal={CommentToggleModal} postId={post.id}/>
      )}
      
    
    </View>
  );
}


