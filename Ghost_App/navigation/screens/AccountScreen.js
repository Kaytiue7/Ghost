import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator,Image,TouchableOpacity,Text,ScrollView  } from 'react-native';
import { firestore } from '../../firebase/firebaseConfig';
import PostItem from '../../components/PostItem';
import * as  SecureStore from 'expo-secure-store';
import styles from '../../styles/_accountStyle';
import { format } from 'date-fns';


export default function AccountScreen({navigation}) {
  const [activeTab, setActiveTab] = useState('Postlar'); 
  
  const [userData, setUserData] = useState(null);

  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading durumu ekleniyor
  const [userId, setUserId] = useState("");


  const [followToSize, setFollowToSize]= useState("");
  const [followBySize, setFollowBySize]= useState("");
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
    const getUserData = () => {
      if (userId) {
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
    
          // Dinleyiciyi temizleme fonksiyonu döndür
          return unsubscribe;
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      } else {
        console.warn('User ID is not set.');
      }
    };

    const getFollowStats = () => {
      if (userId) {
        try {
          // `followedTo` dinleyicisi
          const unsubscribeFollowTo = firestore
            .collection('Follow')
            .where('followedTo', '==', userId)
            .onSnapshot((querySnapshot) => {
              setFollowToSize(querySnapshot.size); // Takip edilen kullanıcı sayısını güncelle
            });
    
          // `followedBy` dinleyicisi
          const unsubscribeFollowBy = firestore
            .collection('Follow')
            .where('followedBy', '==', userId)
            .onSnapshot((querySnapshot) => {
              setFollowBySize(querySnapshot.size); // Takipçi sayısını güncelle
            });
    
          // Dinleyicileri temizleme fonksiyonunu döndür
          return () => {
            unsubscribeFollowTo();
            unsubscribeFollowBy();
          };
        } catch (error) {
          console.error('Veri alma sırasında bir hata oluştu:', error);
        }
      } else {
        console.warn('Kullanıcı ID belirtilmemiş.');
      }
    };
  
    if (userId) {
      getUserData(); 
      getFollowStats();
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
            return post.userId === userId;
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
  }, [activeTab]); 

  const formatDate = (timestamp) => {
    const date = timestamp ? timestamp.toDate() : null;
  
    if (!date || isNaN(date.getTime())) {
      return null; 
    }
    return format(date, 'dd.MM.yyyy');
  };


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
            source={{ uri: userData && userData.bannerPicture ? userData.bannerPicture : 'https://via.placeholder.com/350x100' }}
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
              <Text style={styles.username}>@{userData?.username}</Text>

              {userData?.bio && (
                <Text style={styles.bio}>{userData?.bio}</Text>
              )}

            {/* Format the date and display it */}
            <Text style={styles.date}>
              {userData?.createdAt ? `${formatDate(userData.createdAt)} tarihinde katıldı` : 'Katılmadı'}
            </Text>
              <Text style={styles.followInfo}>{followBySize} takip edilen · {followToSize} takipçi</Text>
            </View>
          </View>
          {/* Kullanıcı Bilgileri */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditUserProfile')}>
              <Text style={styles.editbuttonText}>Profili Düzenle</Text>
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

