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


export default function PostItem({ post, username, profilePicture }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false); //bu true olursa video otomaitk başlar
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [likesCount, setLikesCount] = useState(0); // Beğeni sayısını tutan state
  const [liked, setLiked] = useState(false); // Kullanıcının beğenip beğenmediğini kontrol eden state
  const hideControlsTimeout = useRef(null);
  const isFocused = useIsFocused();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  

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

    fetchLikesCount(); // Beğeni sayısını al
    checkIfLiked(); // Beğeni yapılıp yapılmadığını kontrol et

  }, [isFocused, post.id]);

  // Beğeni butonuna tıklama fonksiyonu
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
        });
        console.log(`Post ${post.id} için kullanıcı ${storedUserId} beğenisi eklendi.`);
        setLikesCount(likesCount + 1); // Beğeni sayısını güncelle
        setLiked(true); // Kullanıcı beğendi
      }
    } catch (error) {
      console.error('Beğeni işlemi sırasında hata oluştu:', error);
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
      // Medya kütüphanesi izinlerini sorgulama
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Medya kütüphanesine erişim izni verilmedi!');
        return;
      }
  
      // Videonun URI'sini alıyoruz
      const videoUri = post.videoUri;
  
      // Dosyayı geçici bir konuma indiriyoruz
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUri,
        FileSystem.documentDirectory + 'downloaded_video.mp4'
      );
  
      // İndirme işlemini başlatıyoruz
      const { uri } = await downloadResumable.downloadAsync();
  
      // İndirilen dosyayı medya kütüphanesine kaydediyoruz
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Downloaded Videos', asset, false); // 'Downloaded Videos' albümüne kaydediyoruz
  
      alert('İndirme başarılı!');
    } catch (error) {
      console.error('İndirme işlemi sırasında bir hata oluştu:', error);
      alert('Bir hata oluştu!');
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
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      scrollEventThrottle={16}
    >
      <View style={styles.postContainer}>
        <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        <View style={styles.postContent}>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>@{username}</Text>
            <Text style={styles.timestamp}>{createdAt}</Text>
          </View>

          {post.text && <Text style={styles.postText}>{post.text}</Text>}

          {post.imageUri && (
            <>
              <TouchableOpacity
                onPress={() => setIsImageModalVisible(true)}
              >
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
                <TouchableOpacity>
                  <Ionicons name="arrow-redo-outline" size={26} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.iconText}>0</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconAndTextContainer}>
                <TouchableOpacity>
                  <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.iconText}>0</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconAndTextContainer}>
                <TouchableOpacity>
                  <Ionicons name="bookmark-outline" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.iconText}>0</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconAndTextContainer}>
                <TouchableOpacity>
                  <Ionicons name="share-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  postContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 3,
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