// pages/Login/App.js
import React from 'react';
import { Image, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function LoginPage() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View>
          <Image source={require('../../assets/whiteghost.png')} style={styles.logo} />
        </View>
        <Text style={styles.title}>Tekrar Hoşgeldiniz!</Text>
        <Text style={styles.subtitle}>Kullanıcı bilgilerinizi giriniz</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adını Giriniz"
            placeholderTextColor="#6B6B6B"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi Giriniz"
            placeholderTextColor="#6B6B6B"
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Giriş</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.signup}>
            Hesabın yok mu? <Text style={styles.signupText}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1F1F23',
    width: '90%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#D3D3D3',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    marginBottom: 20,
    height: 100,
    width: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#D3D3D3', 
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFF', 
    padding: 10,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#292929',
  },
  loginButton: {
    backgroundColor: '#0047AB', 
    width: '70%',
    padding: 15,
    borderRadius: 99999,
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 20,
    shadowColor: '#2A5D9E',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  signup: {
    color: '#D3D3D3',
  },
  signupText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
