import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import styles from '../styles/styles';

export default function RegisterPage({ navigation }) {
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
        />
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi Giriniz"
          placeholderTextColor="#6B6B6B"
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginButton}>
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
