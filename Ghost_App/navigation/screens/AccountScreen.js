import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import PostItem from '../../components/PostItem';
import * as SecureStore from 'expo-secure-store';
import styles from '../../styles/_accountStyle';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Postlar');
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [followToSize, setFollowToSize] = useState('');
  const [followBySize, setFollowBySize] = useState('');

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.item.id));
  });

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const getUserData = () => {
        try {
          const unsubscribe = firestore
            .collection('Users')
            .doc(userId)
            .onSnapshot((userDocSnapshot) => {
              if (userDocSnapshot.exists) {
                setUserData(userDocSnapshot.data());
              } else {
                console.error('User not found!');
              }
            });
          return unsubscribe;
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      const getFollowStats = () => {
        try {
          const unsubscribeFollowTo = firestore
            .collection('Follow')
            .where('followedTo', '==', userId)
            .onSnapshot((querySnapshot) => {
              setFollowToSize(querySnapshot.size);
            });

          const unsubscribeFollowBy = firestore
            .collection('Follow')
            .where('followedBy', '==', userId)
            .onSnapshot((querySnapshot) => {
              setFollowBySize(querySnapshot.size);
            });

          return () => {
            unsubscribeFollowTo();
            unsubscribeFollowBy();
          };
        } catch (error) {
          console.error('Error fetching follow stats:', error);
        }
      };

      const unsubscribeUser = getUserData();
      const unsubscribeFollowStats = getFollowStats();

      return () => {
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeFollowStats) unsubscribeFollowStats();
      };
    }
  }, [userId]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('Posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredPosts = postsData.filter((post) => {
          if (activeTab === 'Postlar') return post.postType !== 'Comment' && post.userId === userId;
          if (activeTab === 'Medya') return (post.imageUri || post.videoUri) && post.userId === userId;
          if (activeTab === 'Yanıtlar') return post.userId === userId;
          return post.userId === userId;
        });

        setPosts(filteredPosts);
        setLoading(false);

        filteredPosts.forEach(async (post) => {
          if (post.userId) {
            const userDocRef = firestore.collection('Users').doc(post.userId);
            const userDocSnapshot = await userDocRef.get();
            if (userDocSnapshot.exists) {
              setUsernames((prev) => ({ ...prev, [post.id]: userDocSnapshot.data().username }));
              setProfilePictures((prev) => ({ ...prev, [post.id]: userDocSnapshot.data().profilePicture }));
            }
          }
        });
      });

    return () => unsubscribe();
  }, [activeTab, userId]);

  const formatDate = (timestamp) => {
    const date = timestamp ? timestamp.toDate() : null;
    if (!date || isNaN(date.getTime())) return null;
    return format(date, 'dd.MM.yyyy');
  };

  const renderPost = ({ item: post }) => {
    const username = usernames[post.id];
    const profilePicture = profilePictures[post.id];
    const isFocused = viewableItems.includes(post.id);

    return <PostItem post={post} username={username} profilePicture={profilePicture} isFocused={isFocused} />;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.coverPhoto}>
          <Image
            source={{ uri: userData?.bannerPicture || 'https://via.placeholder.com/350x100' }}
            style={styles.coverImage}
          />
          <TouchableOpacity
            style={{ width: 30, height: 30, position: 'absolute', top: 10, right: 10,backgroundColor:'rgba(0, 0, 0, 0.6)',borderRadius: 15,justifyContent: 'center',alignItems: 'center', }}
            onPress={() => navigation.navigate('SearchResults', {filterUserId:userId})}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <View style={{ flexDirection: 'column', width: '60%' }}>
            <View style={styles.profileDetails}>
              <Image
                source={{
                  uri: userData?.profilePicture || 'https://via.placeholder.com/150',
                }}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.textDetails}>
              <Text style={styles.username}>@{userData?.username}</Text>
              {userData?.bio && <Text style={styles.bio}>{userData?.bio}</Text>}
              <Text style={styles.date}>
                {userData?.createdAt
                  ? `${formatDate(userData.createdAt)} tarihinde katıldı`
                  : 'Katılmadı'}
              </Text>
              <Text style={styles.followInfo}>
                {followBySize} takipçi · {followToSize} takip edilen
              </Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.BorderButtonStyle}
              onPress={() => navigation.navigate('EditUserProfile')}
            >
              <Text style={styles.editbuttonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tabContainer}>
          {['Postlar', 'Yanıtlar', 'Medya', 'Kaydedilenler'].map((tab) => (
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
