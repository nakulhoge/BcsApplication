import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './Register';
import Login from './Login';
import ForgotResetPassword from './ForgotResetPassword';
import DrawerNav from './DrawerNav';

const Stack = createStackNavigator();

const AuthStack = ({ setLoggedIn }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login">
        {props => <Login {...props} setLoggedIn={setLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Forgotpassword" component={ForgotResetPassword} />
      <Stack.Screen name="Home" component={DrawerNav} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AuthStack;
