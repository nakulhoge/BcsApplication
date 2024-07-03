import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {  faRecycle, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { height, width } from '@fortawesome/free-solid-svg-icons/fa0';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.0.238:3000/admin/users', {
          method: 'GET',
          headers: {Authorization: token},
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://192.168.0.238:3000/admin/users/delete/${id}`,
        {
          method: 'DELETE',
          headers: {Authorization: token},
        },
      );
      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (

    <View >
      <View style={styles.header}>
        <Text style={styles.headerText}>Name</Text>
        <Text style={styles.headerText}>Email</Text>
        <Text style={styles.headerText}>Mobile</Text>
        <Text style={styles.headerText}>Action</Text>
      </View>
      <ScrollView>
        {
          users.map(item=>(
            <View key={item._id} style={styles.containt}>
            <Text  style={styles.containtText}>{item.name}</Text>
            <Text style={styles.containtText}>{item.email}</Text>
            <Text style={styles.containtText}> {item.mobile}</Text>
            <TouchableOpacity  onPress={()=>deleteUser(item._id)}><Text style={styles.Button}> <FontAwesomeIcon icon={faTrash} style={styles.icon} /></Text></TouchableOpacity>
            </View>

          ))
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
 
  containt:{
    flexDirection:'row',
    justifyContent:'space-between',
    borderBottomWidth:1,
    borderBottomColor:'gray',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'yellow',
  },
  headerText:{
    fontSize:16,
    color:'black',
   
  },
  containtText:{
    flex:1
  },
  Button:{
    padding:5,
    flex:1,
    justifyContent:'center',
    alignItems:'center',

  }
  
});

export default UsersScreen;
