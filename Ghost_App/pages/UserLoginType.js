import React from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function UserLoginType({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/whiteghost.png')} style={styles.logo} />

      <Text  style={styles.title}>Ghost</Text>

      <Text style={styles.subtitle}>Küçük kuşlar bile bu kadar güvenli olamadı.</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.BlueStandartButton} 
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.OrangeStandartButton}
          onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "gray",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "10%",
    gap: 10,
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
  OrangeStandartButton: {
    backgroundColor: '#FF4500',
    padding: 12,
      borderRadius: 9999,
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 16,
      width: 130,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
