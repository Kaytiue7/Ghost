import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Image, TouchableOpacity, Text, ScrollView,StyleSheet,activeTab } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import PostItem from '../../components/PostItem';
import * as SecureStore from 'expo-secure-store';

export default function PostsScreen({navigation}) {

  const [activeTab, setActiveTab] = useState('Tümü');

  const [userId, setUserId] = useState('');
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading durumu ekleniyor

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.item.id));
  });
  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
    getUserId();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('Posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot(async (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Use an array to store filtered posts
        const filteredPosts = [];
  
        for (const post of postsData) {
          if (activeTab === 'Tümü' && post.postType !== 'Comment') {
            filteredPosts.push(post);
          }
  
          if (activeTab === 'Takip Ettiklerin') {
            // Fetch follow data asynchronously
            const isFollow = firestore
              .collection('Follow')
              .where('followedBy', '==', userId)
              .where('followedTo', '==', post.userId);
            const snapshot = await isFollow.get();
  
            if ((!snapshot.empty || post.userId === userId) && post.postType !== 'Comment') {
              filteredPosts.push(post);
            }
          }
        }
  
        setPosts(filteredPosts);
        setLoading(false); // Data fetched, update loading state
  
        // Fetch usernames and profile pictures asynchronously
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
  }, [activeTab, userId]); // Add activeTab and userId as dependencies
  
  

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
    <View style={styles.container} >
       <View style={styles.topBar}>
        {/* Logo */}
        <Image source={require('../../assets/whiteghost.png')} style={styles.logo} />
       
      </View>
      <View style={styles.tabContainer}>
                {['Tümü', 'Takip Ettiklerin'].map((tab) => (
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
        // Loading göstergesi, veri alınırken görünür
        <ActivityIndicator onPress={() => navigation.navigate('EditUserProfile')} size="large" color="#FFFFFF" style={styles.loadingIndicator} />
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

  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    height: 60,
    backgroundColor: '#060606',
    flexDirection: 'row', // Yatayda hizalamak için flexDirection kullanıyoruz
    alignItems: 'center', // Ortalamak için
    justifyContent: 'center', // Ortalamak için

  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10, // Logo ile başlık arasına boşluk bırakıyoruz
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    color: '#888',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeIndicator: {
    width: '40%',
    height: 2,
    backgroundColor: '#007AFF',
    marginTop: 5,
  },
});

