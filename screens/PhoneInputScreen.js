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

  const validatePhoneNumber = (number) => /^[0-9]{10}$/.test(number);

  // 🔹 Send OTP API Call
  const sendOtp = async () => {
    if (!validatePhoneNumber(phone)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/login/shopfront/getOtp?userId=${phone}`);
      if (response.ok) {
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Please check your phone for the OTP.');
      } else {
        Alert.alert('Error', 'Failed to send OTP. Try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network issue. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP API Call
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
        console.log("Session ID:", data.sessionId);
        await AsyncStorage.setItem('sessionId', data.sessionId);
        await AsyncStorage.setItem('phoneNumber', phone);
        fetchShopFront(data.sessionId);
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch ShopFront Details
  const fetchShopFront = async (sessionId) => {
    try {
      const response = await fetch(`${BASE_URL}/sf/fetch?ownerId=${phone}`);
      const data = await response.json();

      if (data.shopFront) {
        navigation.replace('Dashboard', { sessionId, sfId: data.id, shopName: data.name, phone });
      } else {
        Alert.alert('Error', 'ShopFront not found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch shop details.');
    }
  };

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
      <KeyboardAvoidingView style={CommonStyles.container} behavior="height">
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <Image source={require('../assets/logo.png')} style={CommonStyles.logoImage} />
          <Text style={CommonStyles.tagline}>Fast. Reliable. At Your Doorstep</Text>

          {/* Phone Number Input with OTP Sent Status */}
          <View style={[CommonStyles.input, { flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 10, color: '#6a1b9a' }}>
              +91
            </Text>
            <TextInput
              placeholder={otpSent ? 'OTP Sent ✔' : 'Enter Phone Number'}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              editable={!otpSent}
              style={{ flex: 1, paddingVertical: 0 }}
            />
          </View>

          {/* OTP Input */}
          <TextInput
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            style={CommonStyles.input}
          />

          {/* Buttons */}
          {loading ? (
            <ActivityIndicator size="large" color="#6a1b9a" />
          ) : otpSent ? (
            <TouchableOpacity style={CommonStyles.button} onPress={verifyOtp}>
              <Text style={CommonStyles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={CommonStyles.button} onPress={sendOtp}>
              <Text style={CommonStyles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          )}

          {/* Register Button */}
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
