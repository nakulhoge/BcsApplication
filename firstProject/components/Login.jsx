import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleLogin = async () => {
    try {
      const response = await axios.post("http://192.168.0.238:3000/login", { email, password });
      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', response.data.role);
      await AsyncStorage.setItem('formFields', JSON.stringify(response.data.formFields));
//       console.log('ok fine')
      await AsyncStorage.setItem('loggedIn', JSON.stringify(true));
//       console.log('ok 2')
    
       navigation.navigate('home');
     
      // Update state to trigger re-render
//       console.log('ok 3')
    } catch (error) {
      console.error("Login failed", error);
      Alert.alert("Login failed. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = () => {
    navigation.navigate('register');
  };
  
  const handleForgotPassword = () => {
    navigation.navigate('forgotpassword');
  };
   
  return (
    <View style={styles.loginSection}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.description}>Please enter your log in detail below.</Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <FontAwesomeIcon icon={faEnvelope} style={styles.icon} />
      </View>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.icon} onPress={togglePasswordVisibility}>
          <FontAwesomeIcon
            icon={showPassword ? faEye : faEyeSlash}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.forgotPass}>
        <View style={styles.check}>
          <CheckBox
            style={styles.checkbox}
            value={rememberMe}
            onValueChange={setRememberMe}
          />
          <Text style={styles.link}>Remember me</Text>
        </View>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>Submit</Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        Don't have an account?{' '}
        <TouchableOpacity onPress={handleRegisterClick}><Text>Register</Text></TouchableOpacity>
      </Text>
    </View>
  );
};

// Get the screen dimensions
const screen = Dimensions.get('window');
const styles = StyleSheet.create({
  loginSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: screen.width > 600 ? '20%' : '10%',
    width: '100%',
  },
  title: {
    fontSize: screen.width > 600 ? 40 : 30,
    fontWeight: '700',
    fontFamily: 'Raleway',
  },
  description: {
    marginVertical: screen.width > 600 ? 20 : 10,
    fontFamily: 'Poppins',
  },
  inputGroup: {
    marginBottom: screen.width > 600 ? 20 : 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: 'Poppins',
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  forgotPass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: screen.width > 600 ? 20 : 10,
  },
  link: {
    color: '#000',
  },
  loginBtn: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'black',
    alignItems: 'center',
    marginBottom: screen.width > 600 ? 20 : 10,
  },
  loginBtnText: {
    color: '#fff',
  },
  text: {
    fontFamily: 'Poppins',
    fontSize: 15,
  },
  checkbox: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] // Adjust size here
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Login;
