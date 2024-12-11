import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo and Tagline */}
      <Text style={styles.logo}>Logo</Text>
      <Text style={styles.tagline}>Lorem ipsum</Text>

      {/* Input Fields */}
      <TextInput style={styles.input} placeholder="Enter Full Name" />
      <TextInput style={styles.input} placeholder="Enter Shop Name" />
      <TextInput style={styles.input} placeholder="Enter GST Regd No" />
      <TouchableOpacity style={styles.captureButton}>
        <Text style={styles.captureButtonText}>Capture Geo Code</Text>
      </TouchableOpacity>
      <TextInput style={styles.input} placeholder="Category/Sub Category" />
      <TextInput style={styles.input} placeholder="Shop Open Days" />
      <TextInput style={styles.input} placeholder="Shop Open/Close Timings" />

      {/* Register Button */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        By continuing, you agree to our{' '}
        <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>
          Terms of Use & Privacy Policy
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9c27b0', // Purple background
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: '#ffccbc',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '80%',
  },
  captureButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 30,
    marginBottom: 10,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#ff9800',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RegisterScreen;