import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../firebase/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as SecureStore from 'expo-secure-store';  // SecureStore import edildi

export default function AddProfilePicture({ navigation }) {
  const [imageUri, setImageUri] = useState(null); 
  const [userId, setUserId] = useState(null);

  // Fetch userId from SecureStore on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await SecureStore.getItemAsync('userId');
      if (userId) {
        setUserId(userId); // Set userId state
      }
    };

    fetchUserId();
  }, []);

  // Skip button logic
  const skipButton = () => {
    navigation.navigate('MainContainer');
  };

  // Image picker logic
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Update URI if an image is selected
    }
  };

  // Save button logic
  const saveButton = async () => {
    if (userId && imageUri) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const filename = `_userProfilePicture/${userId}.jpg`;
        const storageRef = ref(getStorage(), filename);

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        await firestore.collection('Users').doc(userId).update({
          profilePicture: downloadURL
        });

        navigation.navigate('MainContainer'); // Navigate to the main content screen
      } catch (error) {
        console.error('Hata oluştu:', error);
      }
    } else {
      console.log('Görsel seçilmedi veya kullanıcı ID bulunamadı.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          style={styles.image}
          source={{ uri: imageUri || 'https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_1280.png' }} // Display the selected image or a placeholder
        />
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={skipButton}>
          <Text style={styles.buttonText}>Geç</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={saveButton}>
          <Text style={styles.buttonText}>Devam</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain', 
    borderRadius: 150, 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  skipButton: {
    backgroundColor: '#FFA500',
    width: '40%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 5,
  },
  continueButton: {
    backgroundColor: '#007BFF',
    width: '40%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
