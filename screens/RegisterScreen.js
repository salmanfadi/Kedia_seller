import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.tagline}>Register Your Shop</Text>

      {/* Input Fields */}
      <TextInput style={styles.input} placeholder="Enter Full Name" />
      <TextInput style={styles.input} placeholder="Enter Shop Name" />
      <TextInput style={styles.input} placeholder="Enter GST Number" />
      <TouchableOpacity style={[styles.button, { backgroundColor: '#ffca28' }]}>
        <Text style={[styles.buttonText, { color: '#512da8' }]}>Capture Geo Code</Text>
      </TouchableOpacity>
      <TextInput style={styles.input} placeholder="Category/Sub Category" />
      <TextInput style={styles.input} placeholder="Shop Open Days" />
      <TextInput style={styles.input} placeholder="Shop Open/Close Timings" />

      {/* Register Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      {/* Footer */}
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
    backgroundColor: '#6a1b9a',
    padding: 20,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 14,
    color: '#424242',
  },
  button: {
    backgroundColor: '#43a047',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RegisterScreen;
