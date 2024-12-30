import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Font from 'expo-font';

export default function MessageScreen({ navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'WorkSans-Light': require('../../fonts/WorkSans-Light.ttf'), // Font dosyanızın yolunu buraya yazın
      });
      setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) {
    return null; // Yükleme ekranı göstermek için burayı değiştirebilirsiniz.
  }

  return (
    <View style={styles.container}>
      <Text
        style={styles.text}
        onPress={() => navigation.navigate('Arama')}
      >
        Message Screen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontFamily: 'WorkSans-Light', // Özel fontu burada kullanıyoruz
    color: '#333',
  },
});
