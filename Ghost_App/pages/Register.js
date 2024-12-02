import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { firestore } from '../firebase/firebaseConfig.js';
import { serverTimestamp } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';  // Import SecureStore
import styles from '../styles/styles';
import crypto from 'crypto-js';

export default function RegisterPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre gerekli!');
      return;
    }

    try {
      // Şifreyi hex formatında hashle
      const hashedPassword = crypto.SHA256(password).toString(crypto.enc.Hex);

      // Firestore'a kullanıcı ekle
      const userDoc = await firestore.collection('Users').add({
        username: username,
        password: hashedPassword,
        createdAt: serverTimestamp(), // Correct usage of serverTimestamp
      });

      // Firestore'dan dönen ID'yi yerel veri tabanına kaydet
      await SecureStore.setItemAsync('userId', userDoc.id);  // Store userId securely

      Alert.alert('Başarılı', 'Kayıt işlemi tamamlandı!');

      // Başarılıysa giriş sayfasına yönlendir
      navigation.navigate('Login');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../assets/whiteghost.png')} style={styles.logo} />
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Kullanıcı Bilgilerinizi Giriniz</Text>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adını Giriniz"
          placeholderTextColor="#6B6B6B"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi Giriniz"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
          <Text style={styles.loginButtonText}>Kayıt Ol</Text>
        </TouchableOpacity>
        <Text style={styles.signup}>
          Zaten bir hesabın var mı?
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signupText}> Giriş Yap</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}
