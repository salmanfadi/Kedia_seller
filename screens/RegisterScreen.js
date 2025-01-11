import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
<<<<<<< HEAD
  const [geoCode, setGeoCode] = useState('');
=======
  const [geoCode, setGeoCode] = useState(null);
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [gstin, setGstin] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
<<<<<<< HEAD
  const [selectedDays, setSelectedDays] = useState([]);
  const [openTimeFrom, setOpenTimeFrom] = useState('');
  const [openTimeTo, setOpenTimeTo] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day)); // Remove day if already selected
    } else {
      setSelectedDays([...selectedDays, day]); // Add day if not selected
    }
  };

=======
  const [openDayFrom, setOpenDayFrom] = useState('');
  const [openDayTo, setOpenDayTo] = useState('');
  const [openTimeFrom, setOpenTimeFrom] = useState('');
  const [openTimeTo, setOpenTimeTo] = useState('');

>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
  const captureGeoCode = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const capturedGeoCode = `${location.coords.latitude}, ${location.coords.longitude}`;
      setGeoCode(capturedGeoCode);
      console.log('Geo Code Captured:', capturedGeoCode);
    } catch (error) {
      console.error('Error capturing Geo Code:', error);
      Alert.alert('Error', 'Error capturing Geo Code.');
    }
  };

  const handleRegister = async () => {
    const requestBody = {
      name,
      shopfrontName: shopName,
      gstin,
      geoCode,
      category,
      subCategory,
<<<<<<< HEAD
      openDays: selectedDays, // Send selected days
=======
      openDayFrom,
      openDayTo,
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
      openTimeFrom,
      openTimeTo,
    };

    try {
      const response = await axios.post(
<<<<<<< HEAD
        'https://0d8af6e4-9d6b-496b-8a08-4d699be941db.mock.pstmn.io/seller',
=======
        'https://720b64ea-dd06-4f91-a0e5-5704da4867fd.mock.pstmn.io/seller',
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
        requestBody
      );

      console.log('API Response:', response.data);
      if (response.data.success) {
        console.log('Navigation Triggered: Dashboard');
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Registration Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'An error occurred during registration.');
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${period}`;
  });

<<<<<<< HEAD
=======
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.tagline}>Register Your Shop</Text>

        {/* Input Fields */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Full Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Shopfront</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Shop Name"
            value={shopName}
            onChangeText={setShopName}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>GSTIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter GST Regd No"
            value={gstin}
            onChangeText={setGstin}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Geo Code</Text>
          <TouchableOpacity style={styles.captureButton} onPress={captureGeoCode}>
<<<<<<< HEAD
            <Text style={styles.captureButtonText}>
              {geoCode ? geoCode : 'Capture'}
            </Text>
=======
            <Text style={styles.captureButtonText}>Capture</Text>
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
          </TouchableOpacity>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category/ Sub Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Grocery" value="grocery" />
              <Picker.Item label="Electronics" value="electronics" />
              <Picker.Item label="Clothing" value="clothing" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={subCategory}
              onValueChange={(itemValue) => setSubCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Sub Category" value="" />
              <Picker.Item label="Mobile" value="mobile" />
              <Picker.Item label="Laptop" value="laptop" />
              <Picker.Item label="Accessories" value="accessories" />
            </Picker>
          </View>
        </View>

<<<<<<< HEAD
        {/* Days Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Shop Open Days</Text>
          <View style={styles.daysContainer}>
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.dayButtonSelected,
                ]}
                onPress={() => toggleDaySelection(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDays.includes(day) && styles.dayButtonTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
=======
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Shop Open Days</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={openDayFrom}
              onValueChange={(itemValue) => setOpenDayFrom(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="From" value="" />
              {days.map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={openDayTo}
              onValueChange={(itemValue) => setOpenDayTo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="To" value="" />
              {days.map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Shop Open/Close Timings</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={openTimeFrom}
              onValueChange={(itemValue) => setOpenTimeFrom(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="From" value="" />
              {hours.map((hour, index) => (
                <Picker.Item key={index} label={hour} value={hour} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={openTimeTo}
              onValueChange={(itemValue) => setOpenTimeTo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="To" value="" />
              {hours.map((hour, index) => (
                <Picker.Item key={index} label={hour} value={hour} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={{ textDecorationLine: 'underline', fontWeight: 'bold' }}>
            Terms of Use & Privacy Policy
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    backgroundColor: '#6a1b9a',
  },
  container: {
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 10,
    fontSize: 14,
    color: '#424242',
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#dddddd',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    color: '#424242',
  },
  captureButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
<<<<<<< HEAD
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 20,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center', // Added to ensure proper alignment
    width: 100, // Set fixed width
    height: 40, // Set fixed height
  },
  dayButtonSelected: {
    backgroundColor: '#e74c3c',
  },
  dayButtonText: {
    color: '#000000',
    fontSize: 14,
  },
  dayButtonTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
=======
>>>>>>> 29eea835778a70e984f03ac8c8cc7591a2052e10
  registerButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
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
