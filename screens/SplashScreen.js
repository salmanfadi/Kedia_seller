import React, { useEffect } from 'react';
import { View, Text, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommonStyles from '../CommonStyles';

const BASE_URL = 'http://ec2-13-60-227-45.eu-north-1.compute.amazonaws.com:8081';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkSession();
  }, []);

  // 🔹 Get stored session ID from AsyncStorage
  const getStoredSessionId = async () => {
    try {
      return await AsyncStorage.getItem('sessionId');
    } catch (error) {
      return null;
    }
  };

  // 🔹 Check Session API Call
  const checkSession = async () => {
    try {
      const storedSessionId = await getStoredSessionId();
      if (!storedSessionId) {
        navigation.replace('PhoneInput'); // No pop-up, direct navigation
        return;
      }

      console.log("Session ID:", storedSessionId);
      const response = await fetch(`${BASE_URL}/login/session?sessionId=${storedSessionId}`);
      const data = await response.json();

      if (data === true) {
        fetchShopFront(storedSessionId);
      } else {
        navigation.replace('PhoneInput');
      }
    } catch (error) {
      navigation.replace('PhoneInput'); // Silent failure, no pop-up
    }
  };

  // 🔹 Fetch ShopFront Details
  const fetchShopFront = async (sessionId) => {
    try {
      const phoneNumber = await AsyncStorage.getItem('phoneNumber');
      if (!phoneNumber) {
        navigation.replace('PhoneInput');
        return;
      }

      const response = await fetch(`${BASE_URL}/sf/fetch?ownerId=${phoneNumber}`);
      const data = await response.json();

      if (data.shopFront) {
        navigation.replace('Dashboard', { sessionId, sfId: data.id, shopName: data.name, phone: phoneNumber });
      } else {
        navigation.replace('PhoneInput');
      }
    } catch (error) {
      navigation.replace('PhoneInput');
    }
  };

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
      <View style={CommonStyles.container}>
        <Image source={require('../assets/logo.png')} style={CommonStyles.logoImage} />
        <Text style={CommonStyles.tagline}>Fast. Reliable. At Your Doorstep</Text>
        <ActivityIndicator size="large" color="#6a1b9a" style={{ marginTop: 20 }} />
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;
