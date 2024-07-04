import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerItemList, DrawerContentScrollView } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Home from './Home'; // Replace with your actual Home component
import Admin from './Admin'; // Replace with your actual Admin component

const DrawerNav = ({ setLoggedIn }) => {
  const Drawer = createDrawerNavigator();
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  async function getUserData() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token not found');
        return;
      }
      const response = await axios.post('http://192.168.0.238:3000/userdata', { token });
      setUserData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'loggedIn', 'formFields', 'role']);
      console.log('Logged out successfully');
      Alert.alert('Logout', 'You have been logged out successfully.');
      setLoggedIn(false); // Update the loggedIn state
      // Redirect to login screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout', 'Error logging out. Please try again.');
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <View style={{ flex: 1 }}>
          <View style={styles.drawerHeader}>
            {/* Your custom drawer header if needed */}
            <Text style={styles.headerText}>BCS Employees</Text>
          </View>
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
            <FontAwesomeIcon icon={faSignOutAlt} style={styles.logoutIcon} />
          </TouchableOpacity>
        </View>
      )}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#c6cbef',
          width: 150,
        },
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      {userData && userData.isAdmin === true ? (
        <Drawer.Screen name="Admin" component={Admin} />
      ) : null}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  logoutText: {
    marginRight: 10,
    fontSize: 16,
  },
  logoutIcon: {
    fontSize: 20,
    color: '#555',
  },
});

export default DrawerNav;
