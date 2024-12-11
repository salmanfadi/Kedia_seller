import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PhoneInputScreen = ({ navigation }) => {  // Make sure `navigation` is passed correctly
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      {/* Circles */}
      <View style={styles.circle} />
      <View style={[styles.circle, styles.circleOverlay]} />

      {/* Logo and Tagline */}
      <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
      <Text style={styles.tagline}>Fast. Reliable. At Your Doorsteps</Text>

      {/* Phone Input */}
      <View style={styles.phoneContainer}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.phoneContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
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
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f06292',
    position: 'absolute',
    top: 50,
    left: 30,
  },
  circleOverlay: {
    backgroundColor: '#f48fb1',
    top: 70,
    left: 50,
  },
  logoImage: {
    width: 150, // Adjust the size as needed
    height: 150, // Adjust the size as needed
    marginBottom: 20,
  },
  tagline: {
    fontSize: 20,
    color: '#f8f9fa',
    marginVertical: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 20,
    padding: 10,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
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
});

export default PhoneInputScreen;
