import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, TextInput, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as SecureStore from 'expo-secure-store';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function EditProfile({ navigation }) {
  const [bannerUri, setBannerUri] = useState(null);
  const [profilePictureUri, setProfilePictureUri] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [userId, setUserId] = useState(null);

  const [isFocused, setIsFocused] = useState(false);
  const [isFocusedBio, setIsFocusedBio] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null); // banner or profile

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await SecureStore.getItemAsync('userId');
      if (userId) {
        setUserId(userId);
        const userDoc = await firestore.collection('Users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setBannerUri(userData.bannerPicture || null);
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
      aspect: currentImage === 'banner' ? [16, 6] : [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
    setModalVisible(false);
  };

  const handleImagePress = (imageType) => {
    setCurrentImage(imageType);
    setModalVisible(true);
  };

  const handleRemoveImage = () => {
    if (currentImage === 'banner') setBannerUri(null);
    if (currentImage === 'profile') setProfilePictureUri(null);
    setModalVisible(false);
  };

  const saveChanges = async () => {
    if (userId) {
      try {
        const updates = {};
  
        if (bannerUri) {
          const bannerBlob = await fetch(bannerUri).then((res) => res.blob());
          const bannerRef = ref(getStorage(), `_userProfilePictures/${userId}_banner.jpg`);
          await uploadBytes(bannerRef, bannerBlob);
          updates.bannerPicture = await getDownloadURL(bannerRef);
        } else {
          updates.bannerPicture = null; // Save null if no banner image
        }
  
        if (profilePictureUri) {
          const profileBlob = await fetch(profilePictureUri).then((res) => res.blob());
          const profileRef = ref(getStorage(), `_userProfilePictures/${userId}_profile.jpg`);
          await uploadBytes(profileRef, profileBlob);
          updates.profilePicture = await getDownloadURL(profileRef);
        } else {
          updates.profilePicture = null; // Save null if no profile picture
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
      <TouchableOpacity activeOpacity={0.5} onPress={() => handleImagePress('banner')}>
        <Image
          style={styles.banner}
          source={{ uri: bannerUri || 'https://via.placeholder.com/800x300' }}
        />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} onPress={() => handleImagePress('profile')}>
        <Image
          style={styles.profilePicture}
          source={{ uri: profilePictureUri || 'https://via.placeholder.com/150' }}
        />
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalAction}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => pickImage(currentImage === 'banner' ? setBannerUri : setProfilePictureUri)}
              >
                <Ionicons name="image-outline" size={25} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalButtonText}>Galeriden Seç</Text>
            </View>

            <View style={styles.modalAction}>
              <TouchableOpacity style={styles.iconCircleRed} onPress={handleRemoveImage}>
                <Ionicons name="trash-outline" size={25} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalButtonTextRed}>Resmi Sil</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, isFocused && styles.labelfocused]}>İsim</Text>
        <View style={[styles.InputBorderStyle, isFocused && styles.InputFocusedBorderStyle]}>
          <TextInput
            style={styles.BorderedInputStyle}
            placeholder="Yazınız"
            placeholderTextColor="#888"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <Text style={[styles.label, isFocusedBio && styles.labelfocused]}>Biyografi</Text>
        <View style={[styles.InputBorderStyle, isFocusedBio && styles.InputFocusedBorderStyle]}>
          <TextInput
            style={[styles.BorderedInputStyle, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Biyografi"
            placeholderTextColor="#888"
            onFocus={() => setIsFocusedBio(true)}
            onBlur={() => setIsFocusedBio(false)}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>
      </View>

      <TouchableOpacity style={styles.BlueStandartButton} onPress={saveChanges}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#101010',
    },
    banner: {
      width: '100%',
      height: 150,
      backgroundColor: '#246ddd',
    },
    profilePicture: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      marginTop: -50,
      marginLeft: 20,
      borderColor: 'rgba(0, 0, 0, 0.4)',
      borderWidth: 1,
    },
    inputContainer: {
      paddingHorizontal: 16,
    },
    label: {
      color: '#888',
      fontSize: 16,
      marginBottom: 4,
      marginLeft: 8,
      
    },
    labelfocused: {
      color: '#246DDD',
    },
    InputBorderStyle: {
      borderWidth: 2,
      borderColor: '#888',
      borderRadius: 8,
      marginBottom: 10,
    },
    BorderedInputStyle: {
      backgroundColor: 'transparent',
      color: '#FFF',
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      
    },
    InputFocusedBorderStyle: {
      borderColor: '#246DDD',
    },
    BlueStandartButton: {
      backgroundColor: '#007BFF',
      padding: 12,
      borderRadius: 9999,
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 16,
      width: 130,
    },
    saveButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: 220,
      backgroundColor: '#FFF',
      paddingVertical: 20,
      paddingHorizontal:10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'space-around',
      flexDirection:'row',
    },
    modalAction: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#0002bc',
      fontWeight: 'bold',
      marginTop:'5',
    },
    modalButtonTextRed: {
      color: '#FF1700',
      fontWeight: 'bold',
      marginTop:'5',
    },
    iconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#0002bc',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconCircleRed: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#FF1700',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });