import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, ScrollView,StyleSheet } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';

import { SearchBar } from '@rneui/themed';
import { Keyboard } from 'react-native';

import styles from '../styles/_accountStyle';

import PostItem from '../components/PostItem';
import UserItem from '../components/UserItem';

export default function SearchResults({ route, navigation }) {
  const [activeTab, setActiveTab] = useState('Postlar');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [viewableItems, setViewableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUserId, setFilteredUserId] = useState('');
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems.map((item) => item.item.id));
  });

  const { query,filterUserId } = route.params;
  useEffect(() => {
    const fetchFilterUserId= async () => {
      setFilteredUserId(filterUserId);
      console.log("FilteredUserId",filteredUserId);
    };

    fetchFilterUserId();
  }, [filterUserId]);

  useEffect(() => {
  
    console.log("Query",query);
    console.log("FilterUserId",filterUserId);
    const showPosts = firestore
      .collection('Posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));


        let filteredPosts = postsData.filter((post) => {
          const postText = post.text ? post.text.toLowerCase() : '';
          
          if (!query || query.trim() === '') {
            if (filteredUserId && filteredUserId !== '') {
              return post.userId === filteredUserId; 
            }
            return post.postType !== 'Comment'; 
          }

          if (activeTab === 'Postlar') {
            return post.postType !== 'Comment' && postText.includes(query.toLowerCase()) && 
                   (!filteredUserId || post.userId === filteredUserId);
          }
          
          if (activeTab === 'Medya') {
            return (post.imageUri || post.videoUri) && postText.includes(query.toLowerCase()) && 
                   (!filteredUserId || post.userId === filteredUserId);
          }
  
          if (activeTab === 'Yanıtlar') {
            return postText.includes(query.toLowerCase()) && 
                   (!filteredUserId || post.userId === filteredUserId);
          }
        });
        

        setPosts(filteredPosts);
        setLoading(false);

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


      const showUsers = firestore
      .collection('Users')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(usersData); // Verileri kontrol etmek için
        // Filtreleme işlemi
        let filteredUsers = usersData.filter((user) => {
          const username = user.username ? user.username.toLowerCase() : "";
          //return  username.includes(query.toLowerCase());
          return true;
        });
        setUsers(filteredUsers);
        setLoading(false);
      });



      if(activeTab === 'Kullanıcılar'){
        console.log("Kullanıcılar");
        return () => showUsers(); 
        
      }
      else{
        return () => showPosts();
      }
    
  }, [activeTab, query,filteredUserId]); 

  const handleSearchBarPress = () => {
    Keyboard.dismiss(); 
    navigation.goBack(); 
  };

  const renderPost = ({ item: post }) => {
    const username = usernames[post.id];
    const profilePicture = profilePictures[post.id];
    const isFocused = viewableItems.includes(post.id);

    return <PostItem post={post} username={username} profilePicture={profilePicture} isFocused={isFocused} />;
  };

  const renderUser = ({ item: user }) => {
    return <UserItem post={user} />;
  };

  return (
    <View style={stylesStyleSheet.container}>
      <ScrollView>
      <SearchBar
        placeholder="Ara..."
        onPress={handleSearchBarPress}
        value={query}
        containerStyle={stylesStyleSheet.searchBarContainer}
        inputContainerStyle={stylesStyleSheet.searchBarInputContainer}
        inputStyle={stylesStyleSheet.searchBarInput}
        placeholderTextColor="#888"
        e
                
        />
        <View style={[styles.tabContainer]}>
          {['Postlar', 'Kullanıcılar', 'Yanıtlar', 'Medya'].map((tab) => (
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
          <>
            {activeTab === 'Kullanıcılar' ? (
              <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={{ itemVisiblePercentThreshold: 69 }}
              />
            ) : (
              <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={{ itemVisiblePercentThreshold: 69 }}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const stylesStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  searchBarContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchBarInputContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
  },
  searchBarInput: {
    color: '#fff',
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profilePicture: {
    width: 52,
    height: 52,
    borderRadius: 25,
    marginRight: 15,
  },
  username: {
    fontSize: 16,
    color: '#fff',
  },
});

