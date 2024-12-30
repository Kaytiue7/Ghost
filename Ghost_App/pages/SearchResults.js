import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, ScrollView } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import PostItem from '../components/PostItem';
import styles from '../styles/_accountStyle';

export default function SearchResults({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('Postlar');
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.item.id));
  });

  const { query } = route.params; // SearchScreen'den gelen arama terimi

  useEffect(() => {
    const unsubscribe = firestore
      .collection('Posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtreleme işlemi
        let filteredPosts = postsData.filter((post) => {
          // Aktif sekmeye göre filtreleme
          if (activeTab === 'Postlar') return post.postType !== 'Comment';
          if (activeTab === 'Medya') return post.imageUri || post.videoUri;
          if (activeTab === 'Yanıtlar') return true; // Yanıtlar sekmesi için filtreleme (gerekiyorsa)

          // `query` ile post.text verisinde filtreleme
          if (query) {
            return post.text.toLowerCase().includes(query.toLowerCase());
          }

          //return true; // `query` yoksa tüm postlar göster
        });

        setPosts(filteredPosts);
        setLoading(false);

        // Kullanıcı verilerini almak ve güncellemek
        filteredPosts.forEach(async (post) => {
          if (post.userId) {
            const userDocRef = firestore.collection('Users').doc(post.userId);
            const userDocSnapshot = await userDocRef.get();
            if (userDocSnapshot.exists) {
              setUsernames((prev) => ({
                ...prev,
                [post.id]: userDocSnapshot.data().username,
              }));
              setProfilePictures((prev) => ({
                ...prev,
                [post.id]: userDocSnapshot.data().profilePicture,
              }));
            }
          }
        });
      });

    return () => unsubscribe();
  }, [activeTab, query]); // activeTab ve query değiştikçe yeniden çalışacak

  const renderPost = ({ item: post }) => {
    const username = usernames[post.id];
    const profilePicture = profilePictures[post.id];
    const isFocused = viewableItems.includes(post.id);

    return <PostItem post={post} username={username} profilePicture={profilePicture} isFocused={isFocused} />;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={[styles.tabContainer, { paddingVertical: 50, paddingHorizontal: 10 }]}>
          {['Postlar', 'Kullanıcılar', 'Yanıtlar', 'Medya', 'Kaydedilenler'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              {activeTab === tab && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={{ itemVisiblePercentThreshold: 69 }}
          />
        )}
      </ScrollView>
    </View>
  );
}
