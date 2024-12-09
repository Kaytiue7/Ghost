import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';

export default function PostItem({ post, username, profilePicture }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const hideControlsTimeout = useRef(null);
  const isFocused = useIsFocused(); // Sekme odağını algılamak için

  useEffect(() => {
    // Sayfa odaktan çıkarsa videoyu durdur
    if (!isFocused && videoRef.current) {
      videoRef.current.pauseAsync();
      setIsPlaying(false);
    }

    // Video kontrol gizleme
    if (showControls) {
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 5000);
    } else {
      // Eğer kontrol gizlendiyse, zamanlayıcıyı temizle
      clearTimeout(hideControlsTimeout.current);
    }

    return () => {
      // component unmount edildiğinde zamanlayıcıyı temizle
      clearTimeout(hideControlsTimeout.current);
    };
  }, [isFocused, showControls]);

  //Videoyu durdurma ve oynatma
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

  //Tam Ekrana Alma Kodu
  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.presentFullscreenPlayer();
    }
  };

  //Slider kontrol kodu
  const handleSliderValueChange = async (value) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const createdAt = post.createdAt?.seconds
    ? new Date(post.createdAt.seconds * 1000).toLocaleString()
    : 'Bilinmeyen Tarih';

  return (
    <View style={styles.postContainer}>
      <Image source={{ uri: profilePicture }} style={styles.profileImage} />
      <View style={styles.postContent}>
        <View style={styles.usernameContainer}>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.timestamp}>{createdAt}</Text>
        </View>

        {post.text && <Text style={styles.postText}>{post.text}</Text>}

        {post.imageUri && (
          <Image source={{ uri: post.imageUri }} style={styles.postImage} />
        )}

        {post.videoUri && (
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
              shouldPlay
              isMuted={isMuted}
              onPress={handleFullscreen}
              onPlaybackStatusUpdate={(status) => {
                setVideoDuration(status.durationMillis);
                setCurrentTime(status.positionMillis);
              }}
            />
            {showControls && (
              <>
                {/* Oynat/Durdur Butonu */}
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

                {/* Alt Kontroller */}
                <View style={styles.bottomControls}>
                  <TouchableOpacity onPress={handleDownload}>
                    <Ionicons name="download" size={20} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleMute}>
                    <Ionicons
                      name={isMuted ? 'volume-mute' : 'volume-high'}
                      size={20}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                 
                  <TouchableOpacity onPress={handleFullscreen}>
                    <Ionicons name="expand" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                {/* Zaman Çubuğu */}
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
          </TouchableOpacity>
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
});
