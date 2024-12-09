import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function PostItem({ post, username, profilePicture }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const hideControlsTimeout = useRef(null);
  const isFocused = useIsFocused();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [videoPosition, setVideoPosition] = useState(null); // Video'nun görünürlük kontrolü için

  useEffect(() => {
    // Sayfa odaktan çıkarsa videoyu durdur
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

  // Videoyu durdurma ve oynatma
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

  const handleDownload = () => {
    //YAPI lacak
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
                <Image source={{ uri: post.imageUri }} style={styles.postImage} />
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
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="arrow-redo-outline" size={26} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="share-outline" size={24} color="#FFF" />
              </TouchableOpacity>
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
});
