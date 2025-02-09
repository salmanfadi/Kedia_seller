import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CommonStyles from '../CommonStyles';
import Icon from 'react-native-vector-icons/FontAwesome';

const BASE_URL = 'http://ec2-13-60-227-45.eu-north-1.compute.amazonaws.com:8081';

const ProfileInfoScreen = ({ navigation, route }) => {
  const { phone } = route.params; 
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/sf/fetch?ownerId=${phone}`);
        setProfileData(response.data);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const sessionId = await AsyncStorage.getItem('sessionId');
      if (!sessionId) {
        console.log('No session ID found, redirecting to login...');
        navigation.replace('PhoneInput');
        return;
      }
  
      await axios.post(`${BASE_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
  
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await AsyncStorage.removeItem('sessionId');
      await AsyncStorage.removeItem('phoneNumber');
      navigation.replace('PhoneInput');
    }
  };
  
  
  

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
      <View style={styles.container}>
        {/* 🔹 Header with Back Button */}
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={CommonStyles.arrowContainer}>
            <Icon name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={CommonStyles.headerText}>Profile Info</Text>
          <View style={{ width: 20 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#9c27b0" />
        ) : profileData ? (
          <>
            <Image source={{ uri: profileData.imgUrl }} style={styles.profileImage} />
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileId}>Shop ID: {profileData.id}</Text>

            {/* 🔹 Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.errorText}>Failed to load profile data.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ...CommonStyles,
  container: { flex: 1, backgroundColor: '#6a1b9a', padding: 20, alignItems: 'center' },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  profileId: { fontSize: 16, color: '#ffffff', marginBottom: 20 },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  logoutText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#ffffff', textAlign: 'center', marginTop: 20 },
});

export default ProfileInfoScreen;
