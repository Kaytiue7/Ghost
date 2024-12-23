import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator,Image,TouchableOpacity,Text,ScrollView  } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import PostItem from '../components/PostItem';
import * as  SecureStore from 'expo-secure-store';
import styles from '../styles/_accountStyle';
import { serverTimestamp, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { useRoute } from '@react-navigation/native';


export default function ForeingAccount({navigation}) {
  const [activeTab, setActiveTab] = useState('Postlar'); 
  
  const [userData, setUserData] = useState(null);

  const [posts, setPosts] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading durumu ekleniyor
  const [isFollowing, setIsFollowing] = useState(false);
  const [userId, setUserId] = useState('');

    const [followToSize, setFollowToSize]= useState("");
    const [followBySize, setFollowBySize]= useState("");

  const route = useRoute();  // Get the navigation route
  const { foreingUserId } = route.params;
  console.log(foreingUserId);
  
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
      if (foreingUserId) {
        try {
          const unsubscribe = firestore
            .collection('Users')
            .doc(foreingUserId)
            .onSnapshot((docSnapshot) => {
              if (docSnapshot.exists) {
                setUserData(docSnapshot.data());
              } else {
                console.error('User not found!');
              }
            });
    
          // Dinleyiciyi temizleme fonksiyonunu döndür
          return unsubscribe;
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      }
    };

    const getFollowStats = () => {
      if (foreingUserId) {
        try {
          const unsubscribeFollowTo = firestore
            .collection('Follow')
            .where('followedTo', '==', foreingUserId)
            .onSnapshot((querySnapshot) => {
              setFollowToSize(querySnapshot.size);
            });
    
          const unsubscribeFollowBy = firestore
            .collection('Follow')
            .where('followedBy', '==', foreingUserId)
            .onSnapshot((querySnapshot) => {
              setFollowBySize(querySnapshot.size);
            });
    
          // Dinleyicileri temizleme fonksiyonlarını döndür
          return () => {
            unsubscribeFollowTo();
            unsubscribeFollowBy();
          };
        } catch (error) {
          console.error('Veri alma sırasında bir hata oluştu:', error);
        }
      }
    };
  
    if (foreingUserId) {
      getUserData(); 
      getFollowStats();
    }
  }, [userId]);
  
  useEffect(() => {
    const checkIfFollowing = async () => {
      if (!userId || !foreingUserId) return; // userId veya foreingUserId yoksa bekle
      try {
        const followSnapshot = await firestore
          .collection('Follow')
          .where('followedBy', '==', userId)
          .where('followedTo', '==', foreingUserId)
          .get();
  
        setIsFollowing(!followSnapshot.empty);
      } catch (error) {
        console.error('Error checking follow status: ', error);
      }
    };
  
    checkIfFollowing();
  }, [userId, foreingUserId]);
  
  const handleFollow = async (foreingUserId) => {
    if (isFollowing) {
      try {
        const followSnapshot = await firestore
          .collection('Follow')
          .where('followedBy', '==', userId)
          .where('followedTo', '==', foreingUserId)
          .get();
  
        followSnapshot.forEach(async (doc) => {
          await doc.ref.delete();
        });
  
        setIsFollowing(false);
      } catch (error) {
        console.error('Error unfollowing user: ', error);
      }
    } else {
      try {
        await firestore
          .collection('Follow')
          .add({
            followedBy: userId,
            followedTo: foreingUserId,
            createdAt: serverTimestamp(),
          });
  
        setIsFollowing(true);
      } catch (error) {
        console.error('Error following user: ', error);
      }
    }
  };
  
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
            return post.postType !== 'Comment' && post.userId === foreingUserId
            ;
          }
          if (activeTab === "Medya") {
            return (post.imageUri || post.videoUri) && post.userId === foreingUserId;
          }
          if (activeTab === "Yanıtlar") {
            return post.userId === foreingUserId;
          }
          return post.userId === foreingUserId; // Eğer başka bir sekme yoksa userId bazlı filtreleme
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




  const formatDate = (timestamp) => {
    // Convert Firebase timestamp to JavaScript Date object
    const date = timestamp ? timestamp.toDate() : null;
  
    // Check if the date is valid before formatting
    if (!date || isNaN(date.getTime())) {
      return null; // Return null if the date is invalid
    }
  
    return format(date, 'dd.MM.yyyy'); // Format the date to 'DD.MM.YYYY'
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
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing ? styles.followingButton : styles.notFollowingButton,
              ]}
              onPress={() => handleFollow(foreingUserId)}
            >
              <Text style={styles.followbuttonText}>
                {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
              </Text>
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

