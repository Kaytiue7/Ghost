import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import styles from '../styles/styles';

export default function LoginPage({ navigation }) {
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
        />
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi Giriniz"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('MainContainer')}
          style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <Text style={styles.signup}>
          Hesabın yok mu?
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}> Kayıt Ol</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}
