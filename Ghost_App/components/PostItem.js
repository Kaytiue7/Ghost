import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, ScrollView, RefreshControlComponent, Alert } from 'react-native';
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

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
  
    fetchUserId();
  }, []);

  const toggleModal = () => {
    setIsReplyModalVisible(!isReplyModalVisible);
    console.log(isReplyModalVisible);

  };
  const CommentToggleModal = () => {
    setIsCommentModalVisible(!isCommentModalVisible);
    console.log("isCommentModalVisible",isCommentModalVisible);
  }
  const navigation = useNavigation();


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

  handleSave = async () => {
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
    <View style={styles.container}>  
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}>
            <View style={styles.postContainer}>
            <TouchableOpacity
              style={styles.profileImage}
              onPress={() => navigation.navigate(userId === post.userId ? 'Hesap' : 'ForeingAccount', { foreingUserId: post.userId })
            }>

                <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            </TouchableOpacity>
            
            <View style={styles.postContent}>
              <View style={styles.usernameContainer}>
              <TouchableOpacity>
                <Text style={styles.username}>@{username}</Text>
              </TouchableOpacity>
                
                <Text style={styles.timestamp}>{createdAt}</Text>
              </View>

              {post.text && <Text style={styles.postText}>{post.text}</Text>}

              {post.imageUri && (
                <>
                  <TouchableOpacity
                    onPress={() => setIsImageModalVisible(true)}>
                    <Image source={{ uri: post.imageUri }} style={styles.postImage}></Image>
                    <TouchableOpacity onPress={handleDownload} style={styles.handleDownloadButton}>
                          <Ionicons name="download" size={30} color="#FFF" />
                        </TouchableOpacity>
                  </TouchableOpacity>
                  <Modal
                    visible={isImageModalVisible}
                    transparent={true}
                    onRequestClose={() => setIsImageModalVisible(false)}
                  >
                    <View style={styles.modalContainer} onPress={() => setIsImageModalVisible(false)}>
                      <ImageViewer 
                        imageUrls={[{ url: post.imageUri }]}
                        style={styles.modalImage}
                      />
                      <TouchableOpacity
                        style={styles.modalCloseButton}
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
                    style={styles.videoWrapper}
                    onPress={() => setShowControls(!showControls)}
                    activeOpacity={1}
                  >
                    <Video
                      ref={videoRef}
                      style={styles.postVideo}
                      source={{ uri: post.videoUri }}
                      resizeMode="contain"
                      shouldPlay={isPlaying} // Video oynatma durumu
                      isMuted={isMuted}
                      onPress={handleFullscreen}
                      onPlaybackStatusUpdate={(status) => {
                        setVideoDuration(status.durationMillis);
                        setCurrentTime(status.positionMillis);

                        if (status.didJustFinish) {
                          videoRef.current.setPositionAsync(0); // Videoyu başa sar
                          videoRef.current.playAsync(); // Yeniden oynat
                        }
                      }}
                    />
                    {showControls && (
                      <>
                        <TouchableOpacity onPress={handleDownload} style={styles.handleDownloadButton}>
                          <Ionicons name="download" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handlePlayPause}
                          style={styles.playPauseButton}
                        >
                          <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={50}
                            color="#FFF"
                          />
                        </TouchableOpacity>
                        <View style={styles.bottomControls}>
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
                          style={styles.slider}
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
                      <View style={styles.modalContainer}>
                        <Video
                          style={styles.modalVideo}
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
                          style={styles.modalCloseButton}
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
                <PostReplyItemComponent replyPostID={post.replyPostID

                } />
              )}

              <View style={styles.footer}>
                <View style={styles.iconContainer}>
                  <View style={styles.iconAndTextContainer}>
                    <TouchableOpacity onPress={handleLike}>
                      <Ionicons
                        name={liked ? 'heart' : 'heart-outline'}
                        size={24}
                        color={liked ? '#cc001a' : '#FFF'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.iconText}>{likesCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.iconAndTextContainer}>
                    <TouchableOpacity onPress={toggleModal}>
                      <Ionicons name="arrow-redo-outline" size={26} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.iconText}>{replysCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.iconAndTextContainer}>
                    <TouchableOpacity onPress={CommentToggleModal}>
                      <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.iconText}>{commentCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.iconAndTextContainer}>
                    <TouchableOpacity onPress={handleSave}>
                      <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.iconText}>{saveCount}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.iconAndTextContainer}>
                    <TouchableOpacity>
                      <Ionicons name="share-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.iconAndTextContainer}>
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBlockColor:'rgba(255, 255, 255, 0.6)',
    borderBottomWidth:0.5,

  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  postContent: {
    flex: 1,
  },
  usernameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  postText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 350,
    borderRadius: 20,
    marginBottom: 10,
  },
  videoWrapper: {
    backgroundColor: '#000',
    borderRadius: 20,
    marginBottom: 10,
    position: 'relative',
  },
  postVideo: {
    width: '100%',
    borderRadius: 20,
    height: 350,
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 2,
  },
  handleDownloadButton: {
    position: 'absolute',
    top: '10%',
    left: '95%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 2,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  slider: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  iconAndTextContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  iconText: {
    color: '#FFF',
    fontSize: 20,
    verticalAlign: 'bottom',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Yarı şeffaf bir arka plan
    },







});