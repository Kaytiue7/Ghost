import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator,Image,TouchableOpacity,Text,ScrollView  } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import PostItem from '../../components/PostItem';
import * as  SecureStore from 'expo-secure-store';


export default function AccountScreen() {
  const [activeTab, setActiveTab] = useState('Postlar'); 
  
  const [userData, setUserData] = useState(null);

  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading durumu ekleniyor
  const [userId, setUserId] = useState("");
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.item.id));
  });

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
  
    fetchUserId(); // Fetch user ID initially
  }, []); // Only run once when component mounts
  
  useEffect(() => {
    const getUserData = async () => {
      if (userId) {
        try {
          const userDocSnapshot = await firestore.collection('Users').doc(userId).get();
          if (userDocSnapshot.exists) {
            setUserData(userDocSnapshot.data());
          } else {
            console.error('User not found!');
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      }
    };
  
    if (userId) {
      getUserData(); // Fetch user data once userId is available
    }
  }, [userId]); // This effect will run again when userId changes
  useEffect(() => {
    const unsubscribe = firestore
      .collection('Posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        let filteredPosts = postsData.filter((post) => {
          // Sekme bazlı filtreleme
          if (activeTab === "Postlar") {
            return post.postType !== 'Comment' && post.userId === userId;
          }
          if (activeTab === "Medya") {
            return (post.imageUri || post.videoUri) && post.userId === userId;
          }
          if (activeTab === "Yanıtlar") {
            return post.postType === 'Comment' && post.userId === userId;
          }
          return post.userId === userId; // Eğer başka bir sekme yoksa userId bazlı filtreleme
        });

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
  }, [activeTab]); // activeTab değiştiğinde yeniden çalışacak

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
      <ScrollView>
        {/* Kapak Fotoğrafı */}
        <View style={styles.coverPhoto}>
          <Image
            source={{ uri: 'https://via.placeholder.com/350x100' }}
            style={styles.coverImage}
          />
        </View>

        {/* Profil Detayları */}
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <View style={{ flexDirection: 'column', width: '60%' }}>
            <View style={styles.profileDetails}>
              <Image
                 source={{
                  uri: userData && userData.profilePicture
                    ? userData.profilePicture
                    : 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png',
                }}
                style={styles.profileImage}
                />    
          </View>
            <View style={styles.textDetails}>
              <Text style={styles.username}>@{userData.username}</Text>
              <Text style={styles.bio}>benim adım volkan 17 y.o 👆</Text>
              <Text style={styles.date}>12.06.2020 Tarihinde katıldı</Text>
              <Text style={styles.followInfo}>40 takip edilen · 30 takipçi</Text>
            </View>
          </View>
          {/* Kullanıcı Bilgileri */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editbuttonText}>Profili Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followbuttonText}>Takip Et</Text>
            </TouchableOpacity>
          </View>
        </View>
     

      {/* Sekme Çubuğu */}
        <View style={styles.tabContainer}>
          {['Postlar', 'Yanıtlar', 'Medya'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  coverPhoto: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: -40,
  },
  textDetails: {
    marginLeft: 10,
    padding: 5,
  },
  username: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#EBE7E7',
  },
  bio: {
    fontSize: 14,
    color: '#C1C0C0',
  },
  date: {
    fontSize: 12,
    color: '#C1C0C0',
  },
  followInfo: {
    fontSize: 12,
    color: '#EBE7E7',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginTop: 10,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    flex: 1,
  },
  editButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#696868',
    width: 130,
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 130,
  },
  editbuttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf:'center',
    textAlign: 'center',
  },
  followbuttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf:'center',
    textAlign: 'center',
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
