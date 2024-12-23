import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as SecureStore from 'expo-secure-store';

export default function EditProfile({ navigation }) {
  const [bannerUri, setBannerUri] = useState(null);
  const [profilePictureUri, setProfilePictureUri] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await SecureStore.getItemAsync('userId');
      if (userId) {
        setUserId(userId);
        const userDoc = await firestore.collection('Users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setBannerUri(userData.banner || null);
          setProfilePictureUri(userData.profilePicture || null);
          setUsername(userData.username || '');
          setBio(userData.bio || '');
        }
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async (setImageUri) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Aspect ratio for banner
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    if (userId) {
      try {
        const updates = {};

        if (bannerUri) {
          const bannerBlob = await fetch(bannerUri).then(res => res.blob());
          const bannerRef = ref(getStorage(), `_userBanners/${userId}.jpg`);
          await uploadBytes(bannerRef, bannerBlob);
          updates.banner = await getDownloadURL(bannerRef);
        }

        if (profilePictureUri) {
          const profileBlob = await fetch(profilePictureUri).then(res => res.blob());
          const profileRef = ref(getStorage(), `_userProfilePictures/${userId}.jpg`);
          await uploadBytes(profileRef, profileBlob);
          updates.profilePicture = await getDownloadURL(profileRef);
        }

        updates.username = username;
        updates.bio = bio;

        await firestore.collection('Users').doc(userId).update(updates);
        navigation.navigate('MainContainer');
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => pickImage(setBannerUri)}>
        <Image
          style={styles.banner}
          source={{ uri: bannerUri || 'https://via.placeholder.com/800x300' }}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => pickImage(setProfilePictureUri)}>
        <Image
          style={styles.profilePicture}
          source={{ uri: profilePictureUri || 'https://via.placeholder.com/150' }}
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Biyografi"
        placeholderTextColor="#888"
        value={bio}
        onChangeText={setBio}
        multiline={true}
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    padding: 16,
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  inputContainer: {
    padding: 16,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
