import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, ImageBackground } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import * as Font from 'expo-font';  // Font modülünü ekledik

import MainContainer from './navigation/MainContainer';
import UserLoginType from './pages/UserLoginType';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AddProfilePicturePage from './pages/AddProfilePicture';
import EditUserProfilePage from './pages/EditUserProfile';
import ForeingAccountPage from './pages/ForeingAccount';




import { firestore } from './firebase/firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
    const [initialRouteName, setInitialRouteName] = useState(null);
    const [fontLoaded, setFontLoaded] = useState(false);  // Font yüklendimi kontrol edeceğiz

    useEffect(() => {
        const loadFonts = async () => {
            try {
                await Font.loadAsync({
                    'WorkSans-Regular': require('./fonts/WorkSans-Regular.ttf'),
                    'WorkSans-Light': require('./fonts/WorkSans-Light.ttf'),
                    'WorkSans-SemiBold': require('./fonts/WorkSans-SemiBold.ttf'),
                });
                setFontLoaded(true);  // Fontlar yüklendiğinde state'i güncelle
            } catch (error) {
                console.error("Font yükleme hatası:", error);
            }
        };

        loadFonts();

        const fetchInitialRoute = async () => {
            try {
                const userId = await SecureStore.getItemAsync('userId');
                console.log("userId: ", userId);
                if (!userId) {
                    setInitialRouteName('UserLoginType');
                    return;
                }

                const userDoc = await firestore.collection('Users').doc(userId).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.validity !== false ) {
                        setInitialRouteName('MainContainer');
                    } else {
                        setInitialRouteName('UserLoginType');
                        console.log("validity false ise UserLoginType'a yönlendir: ", userId);
                    }
                } else {
                    setInitialRouteName('UserLoginType');
                    console.log("Kullanıcı verisi bulunamazsa UserLoginType'a yönlendir: ", userId);
                }
            } catch (error) {
                console.error("Hata oluştu:", error);
                setInitialRouteName('UserLoginType'); 
                console.log("Hata durumunda  UserLoginType'a yönlendir: ", userId);
            }
        };

        fetchInitialRoute();
    }, []);

    if (!fontLoaded || initialRouteName === null) {
        return <LoadingScreen />;  // Font yüklenene kadar bekleyin
    }

    return (
       <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRouteName}>
                <Stack.Screen
                    name="UserLoginType"
                    component={UserLoginType}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterPage}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginPage}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AddProfilePicture"
                    component={AddProfilePicturePage}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EditUserProfile"
                    component={EditUserProfilePage}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ForeingAccount"
                    component={ForeingAccountPage}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="MainContainer"
                    component={MainContainer}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

function LoadingScreen() {
    return (
        <View style={{flex: 1, justifyContent: 'space-around',  alignItems: 'center', flexDirection:'column' }}>  
        <View></View>
            <ImageBackground style={{width:200,height:200,}}source={require('./assets/icon.png')}></ImageBackground>
            <ActivityIndicator size="large" color="#000"/>
        </View>
    );
}
