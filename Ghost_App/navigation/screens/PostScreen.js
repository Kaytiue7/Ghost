import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import * as SecureStore from 'expo-secure-store'; // SecureStore ekledik

export default function ModernPostsScreen() {
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  // Kullanıcı ID'sini al
  const getUserId = async () => {
    const storedUserId = await SecureStore.getItemAsync('userId');
    return storedUserId;
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
              } else {
                setUsernames((prevUsernames) => ({
                  ...prevUsernames,
                  [post.id]: 'Anonim',
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

  const handleLike = async (postId) => {
    const userId = await getUserId();
    
    if (!userId) {
      console.log('Kullanıcı ID bulunamadı.');
      return;
    }

    const postRef = firestore.collection('Posts').doc(postId);
    const usersLikedRef = postRef.collection('usersLiked');
    const userLikeDoc = usersLikedRef.doc(userId);

    const docSnapshot = await userLikeDoc.get();
    
    // Eğer kullanıcı daha önce beğenmişse, beğenisini kaldır
    if (docSnapshot.exists) {
      await userLikeDoc.delete();
    } else {
      await userLikeDoc.set({
        userId: userId,
        timestamp: new Date(),
      });
    }
  };

  const renderPost = ({ item }) => {
    const createdAt = item.createdAt?.seconds
      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
      : 'Bilinmeyen Tarih';

    const username = usernames[item.id];

    return (
      <View style={styles.postContainer}>
        {/* Profil Fotoğrafı */}
        <Image
          source={{
            uri: item.profilePicture ||
              'https://trthaberstatic.cdn.wp.trt.com.tr/resimler/1844000/ismail-kartal-1844308.jpg',
          }}
          style={styles.profileImage}
        />
        <View style={styles.postContent}>
          {/* Kullanıcı Adı ve İçerik */}
          <View style={styles.usernameContainer}>  
            <Text style={styles.username}>@{username}</Text>
            <Text style={styles.timestamp}>{createdAt}</Text>
          </View>

          {item.text && (
            <Text style={styles.postText}>{item.text}</Text>
          )}

          {item.imageUri && (
            <Image source={{ uri: item.imageUri }} style={styles.postImage} />
          )}
          
          <View style={styles.footer}>
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => handleLike(item.id)}>
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
        keyExtractor={(item) => item.id}
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
