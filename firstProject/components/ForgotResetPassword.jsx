import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const ForgotResetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [mode, setMode] = useState('forgot'); // 'forgot' or 'reset'
    const navigation = useNavigation();

    const handleForgotPassword = async () => {
        try {
            const response = await axios.post('http://192.168.0.238:3000/forgot-password', { email });
            setMessage(response.data.message);
            setMode('reset');
        } catch (error) {
            console.error('Error: ', error.response.data.message);
            setMessage(error.response.data.message);
        }
    };

    const handleResetPassword = async () => {
        try {
            const response = await axios.post('http://192.168.0.238:3000/reset-password', { email, otp, newPassword });
            setMessage(response.data.message);
            if (response.status === 200) {
                navigation.navigate('login');
            }
        } catch (error) {
            console.error('Error: ', error.response.data.message);
            setMessage(error.response.data.message);
        }
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.heading}>{mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#ccc"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                {mode === 'forgot' ? (
                    <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                        <Text style={styles.buttonText}>Send OTP</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter OTP"
                            placeholderTextColor="#ccc"
                            value={otp}
                            onChangeText={(text) => setOtp(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            placeholderTextColor="#ccc"
                            value={newPassword}
                            onChangeText={(text) => setNewPassword(text)}
                            secureTextEntry={true}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                            <Text style={styles.buttonText}>Reset Password</Text>
                        </TouchableOpacity>
                    </>
                )}
                {message ? <Text style={styles.message}>{message}</Text> : null}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: '#333',
    },
    button: {
        backgroundColor: '#3b5998',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        marginTop: 20,
        color: 'red',
    },
});

export default ForgotResetPassword;
