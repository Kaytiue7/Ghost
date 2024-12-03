import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MainContainer from './navigation/MainContainer';
import UserLoginType from './pages/UserLoginType';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AddProfilePicturePage from './pages/AddProfilePicture';

const Stack = createStackNavigator();

export default function App() {
    
    return (
       <NavigationContainer>
            <Stack.Navigator initialRouteName="UserLoginType">
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
                    name="MainContainer"
                    component={MainContainer}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
    
}