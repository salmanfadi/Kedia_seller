import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import CommonStyles from '../CommonStyles';

const PhoneInputScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const validatePhoneNumber = (number) => /^[0-9]{10}$/.test(number);

  const handleContinue = () => {
    if (!validatePhoneNumber(phone)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits.');
      return;
    }
    if (!otp) {
      Alert.alert('Missing OTP', 'Please enter the OTP.');
      return;
    }
<<<<<<< HEAD
    navigation.navigate('Dashboard', { phone });
=======
    navigation.navigate('Dashboard');
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
  };

  return (
    <KeyboardAvoidingView style={CommonStyles.container} behavior="height">
      <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
<<<<<<< HEAD
        <Image source={require('../assets/logo.png')} style={CommonStyles.logoImage} />
        <Text style={CommonStyles.tagline}>Fast. Reliable. At Your Doorsteps</Text>

=======
        {/* Logo and Tagline */}
        <Image source={require('../assets/logo.png')} style={CommonStyles.logoImage} />
        <Text style={CommonStyles.tagline}>Fast. Reliable. At Your Doorsteps</Text>

        {/* Phone Input */}
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
        <View style={[CommonStyles.input, { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 10, color: '#6a1b9a' }}>
            +91
          </Text>
          <TextInput
            placeholder="Enter Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            style={{ flex: 1, paddingVertical: 0 }}
          />
        </View>

<<<<<<< HEAD
=======
        {/* OTP Input */}
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
        <TextInput
          placeholder="Enter OTP"
          keyboardType="numeric"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
          style={CommonStyles.input}
        />

<<<<<<< HEAD
=======
        {/* Continue Button */}
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
        <TouchableOpacity style={CommonStyles.button} onPress={handleContinue}>
          <Text style={CommonStyles.buttonText}>Continue</Text>
        </TouchableOpacity>

<<<<<<< HEAD
=======
        {/* Register Button */}
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
        <TouchableOpacity
          style={[CommonStyles.button, { backgroundColor: '#d1c4e9' }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[CommonStyles.buttonText, { color: '#512da8' }]}>Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PhoneInputScreen;
