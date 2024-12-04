import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { firestore } from '../firebase/firebaseConfig.js'; // Firestore bağlantısını doğru yapın
import * as SecureStore from 'expo-secure-store';
import crypto from 'crypto-js';
import styles from '../styles/styles';

export default function LoginPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [showError, setShowError] = useState(false); 

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gerekli!');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); 
      return;
    }
  
    try {
      // Girilen şifreyi hashle
      const hashedPassword = crypto.SHA256(password).toString(crypto.enc.Hex);
      console.log("Hashlenmiş şifre (kayıt ve girişteki şifre):", hashedPassword);
  
      const userSnapshot = await firestore
        .collection('Users')
        .where('username', '==', username)
        .get();
  
      if (userSnapshot.empty) {
        setError('Kullanıcı bulunamadı.');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        return;
      }
  
      // Hashlenmiş şifreyi ve validity'yi kontrol et
      let userId;
      let isValid = false; // Kullanıcı valid mi?
      userSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.password === hashedPassword) {
          userId = doc.id;
          isValid = userData.validity !== false; // Validity kontrolü
        }
      });
  
      if (userId && isValid) {
        // userID'yi yerel depolamaya kaydet
        await SecureStore.setItemAsync('userId', userId);
        
        // MainContainer sayfasına yönlendir
        navigation.navigate('MainContainer');
      } else if (!isValid) {
        setError('Hesabınız geçerli değil. Lütfen yöneticinizle iletişime geçin.');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      } else {
        setError('Şifre yanlış.');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } 
    catch (error) {
      console.error('Giriş hatası:', error);
      setError('Giriş sırasında bir hata oluştu.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../assets/whiteghost.png')} style={styles.logo} />
        <Text style={styles.title}>Giriş Yap</Text>
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
        
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <Text style={styles.signup}>
          Hesabın yok mu?
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}> Kayıt Ol</Text>
          </TouchableOpacity>
        </Text>
      </View>

      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
