import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet, TouchableOpacity,Alert,PermissionsAndroid,Linking  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import * as Animatable from 'react-native-animatable';


const Home = ({ navigation }) => {
  const [role, setRole] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState('');
  const [tasks, setTasks] = useState([]);
  const [imgUri, setImgUri] = useState(null);
  const [location, setLocation] = useState(null);


    useEffect(() => {
       requestLocationPermission();
     }, []);

     const requestLocationPermission = async () => {
       try {
         const granted = await PermissionsAndroid.request(
           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
           {
             title: 'Location Permission',
             message: 'This app needs access to your location.',
             buttonNeutral: 'Ask Me Later',
             buttonNegative: 'Cancel',
             buttonPositive: 'OK',
           }
         );

         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
           fetchLocation();
         } else {
           Alert.alert('Location Permission Denied', 'Permission to access location was denied.');
         }
       } catch (err) {
         console.error('Permissions Error:', err);
       }
     };

     const fetchLocation = () => {
       Geolocation.getCurrentPosition(
         position => {
           setLocation(position.coords);
         },
         error => {
           console.error('Error getting location:', error);
           if (error.code === 2) {
             Alert.alert('Location Services Disabled', 'Please enable location services for this app.', [
               { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
               { text: 'Settings', onPress: () => Linking.openSettings() },
             ]);
           } else {
             Alert.alert('Location Error', 'Failed to get location. Please try again.');
           }
         },
         { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
       );
     };


  useEffect(() => {
    const fetchData = async () => {
      const storedRole = await AsyncStorage.getItem("role");
      const storedFormFields = await AsyncStorage.getItem("formFields");

      if (storedRole) {
        setRole(storedRole);
      }
      if (storedFormFields) {
        setFormFields(JSON.parse(storedFormFields));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

async function getUserData() {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('Token not found');
      return;
    }
//     console.log('Token:', token);

    const response = await axios.post('http://192.168.0.238:3000/userdata', { token });
//     console.log('Response:', response.data);
    setUserData(response.data.data); // You might want to set state here if needed

  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

  useEffect(() => {
    getUserData();
  }, []);

  const handleInputChange = (id, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleImageChange = async () => {
    try {
      const permissionResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (permissionResult !== PermissionsAndroid.RESULTS.GRANTED) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const options = {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 600,
        quality: 1,
      };

      const sourceChoice = await new Promise((resolve) => {
        Alert.alert(
          'Select Image Source',
          'Choose the source of the image',
          [
            {
              text: 'Camera',
              onPress: async () => {
                const cameraResult = await launchCamera(options);
                resolve(cameraResult);
              },
            },
            {
              text: 'Gallery',
              onPress: async () => {
                const galleryResult = await launchImageLibrary(options);
                resolve(galleryResult);
              },
            },
            {
              text: 'Cancel',
              onPress: () => resolve(null),
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      });

      if (!sourceChoice || sourceChoice.didCancel) {
        return;
      }

      const { uri, fileName, type } = sourceChoice.assets[0];

      setImgUri(uri);

      setFormData((prevFormData) => ({
        ...prevFormData,
        photo: {
          uri,
          name: fileName,
          type,
        },
      }));
  Alert.alert('Image upload successfully');
    } catch (error) {
      console.error('Error handling image change:', error);
      alert('Failed to select image. Please try again.');
    }
  };


 const handleSubmit = async () => {
   try {
     const formDataWithImage = new FormData();
     formDataWithImage.append("role", role);
     Object.entries(formData).forEach(([key, value]) => {
       formDataWithImage.append(key, value);
     });

     // Append location data if available
     if (location) {
       formDataWithImage.append('latitude', location.latitude.toString());
       formDataWithImage.append('longitude', location.longitude.toString());
     }

     await axios.post("http://192.168.0.238:3000/submit-form", formDataWithImage, {
       headers: {
         "Content-Type": "multipart/form-data",
       },
     });
     alert("Form submitted successfully!");
   } catch (error) {
     console.error("Error submitting form:", error);
     alert("Failed to submit form. Please try again.");
   }
 };






  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found");
      }
      const response = await fetch("http://192.168.0.238:3000/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleStatusChange = (taskId, status) => {
    updateTaskStatus(taskId, status);
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(`http://192.168.0.238:3000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTasks = tasks.map((task) => {
        if (task._id === taskId) {
          return { ...task, status };
        }
        return task;
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const groups = [...new Set(formFields.map(field => field.group))];

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <Animatable.Text  animation={'zoomInUp'} style={styles.header}>Welcome, {userData.name} </Animatable.Text>
       <Animatable.Text  animation={'zoomInUp'} style={styles.header}>Your role is {role}!</Animatable.Text>
      <Animatable.Image style={styles.image} source={require('../assets/home.png')} animation={'zoomIn'}  duration={1400}/>

      {groups.map(group => (
        < View key={group} >
          {/* <Text>{group}</Text> */}
          {formFields.filter(field => field.group === group).map(field => (
            <View  key={field._id} style={styles.fieldContainer}>
              <Animatable.Text animation={'slideInLeft'} style={styles.fieldLabel}>{field.label}</Animatable.Text>
              {field.type === "select" ? (
                <Picker
                  selectedValue={formData[field.fieldName]}
                  style={styles.input}
                  onValueChange={(itemValue) => handleInputChange(field.fieldName, itemValue)}
                >
                  <Picker.Item label={field.label} value="" />
                  {field.options.map(option => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              ) : field.type === "file" ? (
                <TouchableOpacity style={styles.fileInput} onPress={handleImageChange}>
                  <Text>Upload Image</Text>
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder={field.label}
                  value={formData[field.fieldName] || ''}
                  onChangeText={(value) => handleInputChange(field.fieldName, value)}
                />
              )}
            </View>
          ))}
        </View>
      ))}
      <Button title="Submit" onPress={handleSubmit} />

      <Text style={styles.taskHeader}>Tasks Assigned to You</Text>
      {tasks.map(task => (
        <View key={task._id} style={styles.taskItem}>
          <Text>{task.task}</Text>
          <Picker
            selectedValue={task.status}
            style={styles.input}
            onValueChange={(value) => handleStatusChange(task._id, value)}
          >
            <Picker.Item label="Incomplete" value="incomplete" />
            <Picker.Item label="Ongoing" value="ongoing" />
            <Picker.Item label="Completed" value="completed" />
          </Picker>
        </View>
      ))}

<Button title="Request Location Permission" onPress={requestLocationPermission} />
{location && (
        <View style={{ marginTop: 20,backgroundColor:'#fff' }}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          <Text>Accuracy: {location.accuracy} meters</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  fileInput: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  taskHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  taskItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});

export default Home;
