import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Video } from 'expo-av';

export default function PostItem({ post, username, profilePicture, isFocused }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isFocused) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isFocused]);

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
          <Video
          ref={videoRef}
          style={styles.postVideo}
          source={{ uri: post.videoUri }}
          resizeMode="contain"
          useNativeControls 
          shouldPlay={true} // Başlangıçta otomatik oynatmayı kapalı tutar
        />
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
  postVideo: {
    width: '100%',
    height: 350,
    borderRadius: 20,
    marginBottom: 10,
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
