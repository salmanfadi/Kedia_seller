import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // For checkmarks
import { Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  // Navigate to PhoneInputScreen after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('PhoneInput'); // Replace the current screen
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Circles */}
      <View style={styles.circle} />
      <View style={[styles.circle, styles.circleOverlay]} />

      {/* Logo */}
      <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
      <Text style={styles.tagline}>Fast. Reliable. At Your Doorstep</Text>

      {/* Checklist */}
      <View style={styles.checklist}>
        <View style={styles.checkItem}>
          <Icon name="check" size={16} color="white" />
          <Text style={styles.checkText}>Fast Delivery</Text>
        </View>
        <View style={styles.checkItem}>
          <Icon name="check" size={16} color="white" />
          <Text style={styles.checkText}>Fresh</Text>
        </View>
        <View style={styles.checkItem}>
          <Icon name="check" size={16} color="white" />
          <Text style={styles.checkText}>Convenient</Text>
        </View>
      </View>
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
  logo: {
    size:'10px',
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: 20,
    color: '#f8f9fa',
    marginVertical: 20,
  },
  checklist: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
});

export default SplashScreen;