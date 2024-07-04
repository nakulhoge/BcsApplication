import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faEye, faEyeSlash, faMobile, faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';

const Register = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = () => {
    navigation.navigate('Login');
  };

  const handleSubmit = (values) => {
    console.log("Form submitted:", values);
    axios
      .post("http://192.168.0.238:3000/register", values)
      .then((response) => {
        // const token = response.data.token;
        // // Store token in local storage (if applicable)
        console.warn("Register success");
        // Navigate to login screen
        navigation.navigate('Login');
      })
      .catch((err) => {
        console.log(err);
        console.warn("Register failed");
      });
  };

  return (
    <Formik
      initialValues={{ name: '', email: '', mobile: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <Animatable.Text animation={'zoomIn'} style={styles.title}>Create an account</Animatable.Text>
          <Text style={{ marginBottom: 10 }}>Please enter your detail below to create an account.</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            <FontAwesomeIcon icon={faUser} style={styles.icon} />
          </View>
          {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            <FontAwesomeIcon icon={faEnvelope} style={styles.icon} />
          </View>
          {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mobile"
              keyboardType="phone-pad"
              onChangeText={handleChange('mobile')}
              onBlur={handleBlur('mobile')}
              value={values.mobile}
            />
            <FontAwesomeIcon icon={faMobile} style={styles.icon} />
          </View>
          {touched.mobile && errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            <TouchableOpacity style={styles.icon} onPress={togglePasswordVisibility}>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 10 }}>Already have an account? <TouchableOpacity onPress={handleRegisterClick}><Text>Login</Text></TouchableOpacity></Text>
        </View>
      )}
    </Formik>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  icon: {
    marginLeft: 10,
    height: 20,
    width: 20,
  },
  button: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 10,
  },
});
