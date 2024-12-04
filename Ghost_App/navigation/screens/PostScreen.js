// screens/PostsScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import SecureStore from 'expo-secure-store';
import PostItem from '../../components/PostItem';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePicture] = useState({});

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
    const username = usernames[post.id];
    const profilePicture = profilePictures[post.id];
    return (
      <PostItem
        post={post}
        username={username}
        profilePicture={profilePicture}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
});
