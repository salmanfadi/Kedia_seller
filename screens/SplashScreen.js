import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import CommonStyles from '../CommonStyles';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => navigation.replace('PhoneInput'), 2000);
  }, [navigation]);

  return (
    <View style={CommonStyles.container}>
      <Image source={require('../assets/logo.png')} style={CommonStyles.logoImage} />
      <Text style={CommonStyles.tagline}>Fast. Reliable. At Your Doorstep</Text>
    </View>
  );
};

export default SplashScreen;
