import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // SecureStore için doğru import
import { useNavigation } from '@react-navigation/native'; // Navigation için gerekli hook
import { firestore } from '../firebase/firebaseConfig';

export default function UserList({ users }) {
  const [userId, setUserId] = useState('');
  const navigation = useNavigation(); // Navigation'ı kullanıma alıyoruz

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
      console.log('Stored User Id:', storedUserId,"usres",users);
    };

    fetchUserId();
  }, []);

  return (

    <View style={{flex:1}}>
        <ScrollView
           scrollEventThrottle={16}>
            <View style={{flexDirection: 'row', padding: 10, borderBlockColor:'rgba(255, 255, 255, 0.6)', borderBottomWidth:0.5}}>
                <TouchableOpacity
                    style={styles.userItem}
                    onPress={() =>
                        navigation.navigate(userId === users.id ? 'Hesap' : 'ForeingAccount', { foreingUserId: users.id })
                    }
                    >
                    <Image
                        source={{ uri: users.profilePicture || 'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account'}}
                        style={styles.profilePicture}
                    />
                    <Text style={styles.username}>{users.username}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </View>
   
  );
}

const styles = StyleSheet.create({
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
