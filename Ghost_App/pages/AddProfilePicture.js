import React, { useState, useEffect } from 'react'; // Import useState and useEffect here
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddProfilePicture() {
  const [imageUri, setImageUri] = useState(null); // Declare the state inside the functional component

  useEffect(() => {
    // Any side-effects can be handled here (empty array means this runs once when component mounts)
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
      allowsEditing: true,
      aspect: [1, 1], // Ensure a 1:1 ratio (square aspect ratio)
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // If an image was selected, update the URI
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
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.buttonText}>Geç</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton}>
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
    resizeMode: 'contain', // Ensures the image fits within the container
    borderRadius: 150, // Optional: make it a circular image
    shadowColor: '#ffffff',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 20,
    elevation: 20,
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
