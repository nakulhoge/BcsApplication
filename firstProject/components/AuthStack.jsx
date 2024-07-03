import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './Register';
import Login from './Login';
import ForgotResetPassword from './ForgotResetPassword';
import DrawerNav from './DrawerNav';
const Stack = createStackNavigator();

const AuthStack = () => {
    return (

        <Stack.Navigator>
            <Stack.Screen name="login" component={Login} />
            <Stack.Screen name="register" component={Register} />
            <Stack.Screen name="forgotpassword" component={ForgotResetPassword} />
            <Stack.Screen name="home" component={DrawerNav} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default AuthStack