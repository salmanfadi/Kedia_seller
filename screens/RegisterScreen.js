import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import CommonStyles from '../CommonStyles';

const RegisterScreen = ({ navigation }) => {
  const [geoCode, setGeoCode] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shopName, setShopName] = useState('');
  const [gstin, setGstin] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [openTimeFrom, setOpenTimeFrom] = useState('');
  const [openTimeTo, setOpenTimeTo] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubCategoryPicker, setShowSubCategoryPicker] = useState(false);
  const [showOpenTimePicker, setShowOpenTimePicker] = useState(false);
  const [showCloseTimePicker, setShowCloseTimePicker] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const categories = ['Grocery', 'Electronics', 'Clothing'];
  const subCategories = ['Mobile', 'Laptop', 'Accessories'];
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${period}`;
  });

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

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
    } catch (error) {
      console.error('Error capturing Geo Code:', error);
      Alert.alert('Error', 'Error capturing Geo Code.');
    }
  };

  const handleRegister = async () => {
    if (!phoneNumber) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    const requestBody = {
      name,
      phoneNumber,
      shopfrontName: shopName,
      gstin,
      geoCode,
      category,
      subCategory,
      shopOpenDays: selectedDays.map((day) => day.slice(0, 3)),
      shopOpenTs: openTimeFrom,
      shopCloseTs: openTimeTo,
    };

    try {
      const response = await axios.post(
        'https://0d8af6e4-9d6b-496b-8a08-4d699be941db.mock.pstmn.io/seller',
        requestBody
      );

      if (response.data.success) {
        Alert.alert('Registration Successful', `Shopfront ID: ${response.data.shopfrontId}`);
        navigation.navigate('Dashboard', { phoneNumber });
      } else {
        Alert.alert('Registration Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'An error occurred during registration.');
    }
  };

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
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
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
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
              <Text style={styles.captureButtonText}>{geoCode ? geoCode : 'Capture'}</Text>
            </TouchableOpacity>
          </View>

          {/* Category Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text>{category || 'Select Category'}</Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerContainer}>
                {categories.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                    style={styles.pickerItem}
                  >
                    <Text>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Sub Category Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Sub Category</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowSubCategoryPicker(!showSubCategoryPicker)}
            >
              <Text>{subCategory || 'Select Sub Category'}</Text>
            </TouchableOpacity>
            {showSubCategoryPicker && (
              <View style={styles.pickerContainer}>
                {subCategories.map((subCat, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSubCategory(subCat);
                      setShowSubCategoryPicker(false);
                    }}
                    style={styles.pickerItem}
                  >
                    <Text>{subCat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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
            </View>
          </View>

          {/* Shop Open/Close Timings */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Shop Open/Close Timings</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowOpenTimePicker(!showOpenTimePicker)}
            >
              <Text>{openTimeFrom || 'Open Time'}</Text>
            </TouchableOpacity>
            {showOpenTimePicker && (
              <View style={styles.pickerContainer}>
                {hours.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setOpenTimeFrom(time);
                      setShowOpenTimePicker(false);
                    }}
                    style={styles.pickerItem}
                  >
                    <Text>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ marginBottom: 15 }} />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowCloseTimePicker(!showCloseTimePicker)}
            >
              <Text>{openTimeTo || 'Close Time'}</Text>
            </TouchableOpacity>
            {showCloseTimePicker && (
              <View style={styles.pickerContainer}>
                {hours.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setOpenTimeTo(time);
                      setShowCloseTimePicker(false);
                    }}
                    style={styles.pickerItem}
                  >
                    <Text>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
    </SafeAreaView>
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
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },
  pickerItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 20,
    margin: 5,
    alignItems: 'center',
    width: 100,
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
