import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import PostItem from '../../components/PostItem';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading durumu ekleniyor

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

        // Comment olmayanları filtreleyelim
        const filteredPosts = postsData.filter((post) => post.postType !== 'Comment');

        setPosts(filteredPosts);
        setLoading(false); // Veri alındığında loading durumu false yapılıyor

        filteredPosts.forEach(async (post) => {
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
      {loading ? (
        // Loading göstergesi, veri alınırken görünür
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 69, // Görünürlük eşiği
          }}
        />
      )}
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
