import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import * as SecureStore from 'expo-secure-store'; // SecureStore ekledik

export default function ModernPostsScreen() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePicture] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  // Kullanıcı ID'sini al
  const getUserId = async () => {
    const userId = await SecureStore.getItemAsync('userId');
    return userId;
  };

  useEffect(() => {
    const unsubscribe = firestore
      .collection('Posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const postsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setPosts(postsData);
  
          postsData.forEach(async (post) => {
            if (post.userId) {
              const userDocRef = firestore.collection('Users').doc(post.userId);
              const userDocSnapshot = await userDocRef.get();
              if (userDocSnapshot.exists) {
                setUsernames((prevUsernames) => ({
                  ...prevUsernames,
                  [post.id]: userDocSnapshot.data().username,
                }));
                setProfilePicture((prevProfilePictures) => ({
                  ...prevProfilePictures,
                  [post.id]: userDocSnapshot.data().profilePicture,
                }));
              }
            }
          });
        },
        (error) => {
          console.error('Error fetching posts:', error);
        }
      );
  
    return () => unsubscribe();
  }, []);
  
  const renderPost = ({ item: post }) => {
    if (!post) return null;
  
    const createdAt = post.createdAt?.seconds
      ? new Date(post.createdAt.seconds * 1000).toLocaleString()
      : 'Bilinmeyen Tarih';
  
    const username = usernames[post.id];
    const profilePicture = profilePictures[post.id];
  
    return (
      <View style={styles.postContainer}>
        {/* Profil Fotoğrafı */}
        <Image
          source={{
            uri: profilePicture }}
            style={styles.profileImage}
        />
        <View style={styles.postContent}>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>@{username}</Text>
            <Text style={styles.timestamp}>{createdAt}</Text>
          </View>
  
          {post.text && <Text style={styles.postText}>{post.text}</Text>}
  
          {post.imageUri && (
            <Image source={{ uri: post.imageUri }} style={styles.postImage} />
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
  };
   
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(post) => post.id}
        renderItem={renderPost}
      />
       <FlatList
        data={users}
        keyExtractor={(user) => user.id}
        renderItem={renderPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
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
    color: '#D1D1D1',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
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
