import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonStyles from '../CommonStyles';

const BASE_URL = 'http://ec2-13-60-227-45.eu-north-1.compute.amazonaws.com:8081';

const PhoneInputScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpButtonText, setOtpButtonText] = useState('Send OTP');

  const validatePhoneNumber = (number) => /^[0-9]{10}$/.test(number);

  const sendOtp = async () => {
    if (!validatePhoneNumber(phone)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits.');
      return;
    }
    
    setOtpSent(true);
    setOtpButtonText('Resend OTP');
    
    try {
      await fetch(`${BASE_URL}/login/shopfront/getOtp?userId=${phone}`);
    } catch (error) {
      // Silent fail
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Missing OTP', 'Please enter the OTP.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/login/shopfront/verifyOtp?userId=${phone}&otp=${otp}`);
      const data = await response.json();

      if (data.sessionId) {
        await AsyncStorage.setItem('sessionId', data.sessionId);
        await AsyncStorage.setItem('phoneNumber', phone);
        navigation.replace('Dashboard', { 
          sessionId: data.sessionId,
          sfId: data.id,
          shopName: data.name,
          phone
        });
      } else {
        Alert.alert('Error', 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
      <KeyboardAvoidingView style={CommonStyles.container} behavior="height">
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <Image source={require('../assets/logo.png')} style={CommonStyles.logoImage} />
          <Text style={CommonStyles.tagline}>Fast. Reliable. At Your Doorstep</Text>

          {/* Phone Input - Always editable */}
          <View style={[CommonStyles.input, { 
            flexDirection: 'row', 
            alignItems: 'center',
            paddingHorizontal: 15
          }]}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              marginRight: 10, 
              color: '#6a1b9a' 
            }}>
              +91
            </Text>
            <TextInput
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              style={{ 
                flex: 1, 
                paddingVertical: 0,
                paddingHorizontal: 10
              }}
            />
            <TouchableOpacity onPress={sendOtp}>
              <Text style={{ 
                color: '#6a1b9a', 
                textDecorationLine: 'underline',
                minWidth: 80
              }}>
                {otpButtonText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* OTP Input */}
          {otpSent && (
            <TextInput
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              style={CommonStyles.input}
            />
          )}

          {/* Buttons */}
          <TouchableOpacity 
            style={CommonStyles.button} 
            onPress={verifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={CommonStyles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[CommonStyles.button, { backgroundColor: '#d1c4e9' }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[CommonStyles.buttonText, { color: '#512da8' }]}>Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneInputScreen;