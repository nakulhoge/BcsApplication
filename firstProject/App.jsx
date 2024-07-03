import React, { useEffect, useState, useCallback } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AuthStack from './components/AuthStack';
import DrawerNav from './components/DrawerNav';
import SplashScreen from 'react-native-splash-screen';




const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const initialize = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulating splash screen delay
        SplashScreen.hide();
        checkLoginStatus();
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };

    initialize();
  }, []);

  const checkLoginStatus = useCallback(async () => {
    try {
      const loggedInStatus = await AsyncStorage.getItem('loggedIn');
      setLoggedIn(JSON.parse(loggedInStatus) || false);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false); // Ensure loading state is turned off
    }
  }, []);



  if (loading) {
    // Show a loading indicator while checking login status or logging out
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {loggedIn ? <DrawerNav /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
