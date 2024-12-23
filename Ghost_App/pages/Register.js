import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { firestore } from '../firebase/firebaseConfig.js';
import { serverTimestamp } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store'; 
import styles from '../styles/styles';
import crypto from 'crypto-js';

export default function RegisterPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInputChange = (text, type) => {
    const regex = /^[a-zA-Z0-9_.]+$/;

    if (regex.test(text) || text === '') {
      if (type === 'username') {
        setUsername(text);
      } else if (type === 'password') {
        setPassword(text);
      }
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gerekli!');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); 
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(username)) {
      setError('Kullanıcı adı veya şifre geçersiz karakter içeriyor.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); 
      return;
    }

    try {
      //Kullanıcı adı kontrolü
      const usernameSnapshot = await firestore
      .collection('Users')
      .where('username', '==', username)
      .get();

    if (!usernameSnapshot.empty) {
      setError('Bu kullanıcı adı zaten alınmış.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
      // Hexleme 
      const hashedPassword = crypto.SHA256(password).toString(crypto.enc.Hex);

      // Kullanıcı ekleme
      const userDoc = await firestore.collection('Users').add({
        username: username,
        password: hashedPassword,
        createdAt: serverTimestamp(),
        validity: true,
      });

      // UserID'yi yerel veritabanına kaydet
      await SecureStore.setItemAsync('userId', userDoc.id);

      // Başarı mesajı
      setError('');  // Hata mesajını sıfırla
      setShowError(false);
      setConfirm('Kayıt Başarılı!');
      setShowConfirm(true);
      setTimeout(() => {
        navigation.navigate('EditUserProfile');  // Başarıyla kayıt olduktan sonra yönlendirme
      }, 3000); 
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError('Kayıt sırasında bir hata oluştu.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); 
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
          onChangeText={(text) => handleInputChange(text, 'username')} 
        />
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi Giriniz"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
          value={password}
          onChangeText={(text) => handleInputChange(text, 'password')} 
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

      {showConfirm && <Text style={styles.confirmText}>{confirm}</Text>}
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
