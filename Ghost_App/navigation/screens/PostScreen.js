import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';

export default function ModernPostsScreen() {
  const [posts, setPosts] = useState([]);

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
        },
        (error) => {
          console.error('Error fetching posts:', error);
        }
      );

    return () => unsubscribe();
  }, []);

  const renderPost = ({ item }) => {
    // createdAt alanının null olmadığını kontrol edelim
    const createdAt = item.createdAt?.seconds
      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
      : 'Bilinmeyen Tarih';

    return (
      <View style={styles.postContainer}>
        <Image
          source={{
            uri: item.profilePicture ||
              'https://trthaberstatic.cdn.wp.trt.com.tr/resimler/1844000/ismail-kartal-1844308.jpg',
          }}
          style={styles.profileImage}
        />
        <View style={styles.postContent}>
          <Text style={styles.username}>@{item.userId || 'Anonim'}</Text>
          <Text style={styles.postText}>{item.text || 'Metin bulunamadı.'}</Text>
          <Text style={styles.timestamp}>{createdAt}</Text>
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
    backgroundColor: '#F2F2F2',
    padding: 10,
  },
  postContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  postContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});