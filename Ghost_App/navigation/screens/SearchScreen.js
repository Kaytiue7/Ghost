import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SearchBar } from '@rneui/themed';
import { firestore } from '../../firebase/firebaseConfig';
import * as SecureStore from 'expo-secure-store';

import Ionicons from '@expo/vector-icons/Ionicons';

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error("UserId alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await firestore.collection('Users').get();
        const userList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("Kullanıcılar alınırken hata oluştu:", error);
      }
    };

    fetchUsers();
  }, []);

  // Arama filtresi
  useEffect(() => {
    if (search.trim() === "") {
      //setFilteredUsers(users); // Arama boşsa tüm kullanıcıları gösterir sonrasında bu özellik belki eklenebilir
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [search, users]);

  // Yükleme durumunu kontrol et
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Ara..."
        onChangeText={(text) => setSearch(text)}
        value={search}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainer}
        inputStyle={styles.searchBarInput}
        placeholderTextColor="#888"
        
      />

      {search && (
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => navigation.navigate("SearchResults", { query: search })}
        >
          <Ionicons
            name="search"
            size={30}
            color="#fff"
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              marginLeft: 8,
              marginRight: 23,
            }}
          />
          <Text style={styles.username}>'{search}' için ara...</Text>
        </TouchableOpacity>
      )}
        
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() =>
              navigation.navigate(
                userId === item.id ? 'Hesap' : 'ForeingAccount',
                { foreingUserId: item.id }
              )
            }
          >
            <Image
              source={{ uri: item.profilePicture }}
              style={styles.profilePicture}
            />
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
