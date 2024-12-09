import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import PostItem from '../../components/PostItem';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.item.id));
  });

  useEffect(() => {
    const unsubscribe = firestore
      .collection('Posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
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
              setProfilePictures((prevProfilePictures) => ({
                ...prevProfilePictures,
                [post.id]: userDocSnapshot.data().profilePicture,
              }));
            }
          }
        });
      });

    return () => unsubscribe();
  }, []);

  const renderPost = ({ item: post }) => {
    const username = usernames[post.id];
    const profilePicture = profilePictures[post.id];
    const isFocused = viewableItems.includes(post.id);

    return (
      <PostItem
        post={post}
        username={username}
        profilePicture={profilePicture}
        isFocused={isFocused}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 69, // Görünürlük eşiği
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
});
