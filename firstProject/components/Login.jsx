import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
const Login = ({ setLoggedIn }) => {
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
      await AsyncStorage.setItem('loggedIn', JSON.stringify(true));
      setLoggedIn(true); // Update the loggedIn state
      navigation.navigate('Home');
    } catch (error) {
      console.error("Login failed", error);
      Alert.alert("Login failed. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('Forgotpassword');
  };

  return (
    <View style={styles.loginSection}>
      <Animatable.Text animation={'zoomIn'}style={styles.title}>Welcome Back!</Animatable.Text>
      <Animatable.Text animation={'slideInLeft'} style={styles.description}>Please enter your log in detail below.</Animatable.Text>
      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <FontAwesomeIcon style={styles.icon} icon={faEnvelope} />
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
        <Animatable.Text animation={'flash'}style={styles.loginBtnText}>Submit</Animatable.Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        Don't have an account?{' '}
        <TouchableOpacity onPress={handleRegisterClick}><Text>Register</Text></TouchableOpacity>
      </Text>
    </View>
  );
};

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
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Login;
