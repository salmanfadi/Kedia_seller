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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shopName, setShopName] = useState('');
  const [gstin, setGstin] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [selectedCloseDays, setSelectedCloseDays] = useState([]);
  const [openTimeFrom, setOpenTimeFrom] = useState('');
  const [openTimeTo, setOpenTimeTo] = useState('');
  const [communitiesInput, setCommunitiesInput] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubCategoryPicker, setShowSubCategoryPicker] = useState(false);
  const [showOpenTimePicker, setShowOpenTimePicker] = useState(false);
  const [showCloseTimePicker, setShowCloseTimePicker] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const categories = [
    'Grocery',
    'Medicine',
    'HomeFood',
    'DailyEssentials',
    'Liquor',
    'Tobacco',
    'Artisan',
    'Snacks'
  ];
  
  const subCategoriesMap = {
    Grocery: ['FruitVegetables', 'Kirana'],
    Medicine: ['OTC'],
    DailyEssentials: ['Flower'],
    Liquor: ['Nolo'],
    Tobacco: ['Paan'],
    HomeFood: ['HomeFood'],
    Snacks: ['Snacks'],
    Artisan: []
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${period}`;
  });

  const toggleDaySelection = (day) => {
    if (selectedCloseDays.includes(day)) {
      setSelectedCloseDays(selectedCloseDays.filter((d) => d !== day));
    } else {
      setSelectedCloseDays([...selectedCloseDays, day]);
    }
  };

  const parseTimeString = (timeStr) => {
    if (!timeStr) return '';
    const [time, period] = timeStr.split(' ');
    const [hourStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour.toString();
  };

  const captureGeoCode = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setGeoCode(`${location.coords.latitude}, ${location.coords.longitude}`);
    } catch (error) {
      Alert.alert('Error', 'Error capturing Geo Code.');
    }
  };

  const handleRegister = async () => {
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
  
    const requestBody = {
      name: phoneNumber,
      shopfrontName: shopName,
      geoCode,
      cat: category,
      subCategory,
      shopCloseDays: selectedCloseDays.map(day => day.toUpperCase()),
      shopOpenTs: parseTimeString(openTimeFrom),
      shopCloseTs: parseTimeString(openTimeTo),
      community: communitiesInput.split(',').map(c => c.trim()).filter(c => c),
      ...(gstin && { gstin }),
    };
  
    try {
      const response = await axios.post(
        'http://ec2-13-60-227-45.eu-north-1.compute.amazonaws.com:8081/sf/register',
        requestBody
      );
  
      if (response.data) {
        const successMessage = response.data.message || 'Registration Successful!';
        console.log(successMessage); // Log message if needed
  
        // ✅ Either Show Alert or Directly Navigate
        navigation.replace('PhoneInput', { successMessage });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?._embedded?.errors[0]?.message || 'Registration failed. Please check your inputs.';
      Alert.alert('Registration Failed', errorMessage);
    }
  };
  

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.tagline}>Register Your Shop</Text>

          {/* Phone Number */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Shop Information */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Shop Name"
              value={shopName}
              onChangeText={setShopName}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>GSTIN (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter GSTIN"
              value={gstin}
              onChangeText={setGstin}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Geo Location</Text>
            <TouchableOpacity style={styles.captureButton} onPress={captureGeoCode}>
              <Text style={styles.captureButtonText}>{geoCode || 'Capture Location'}</Text>
            </TouchableOpacity>
          </View>

          {/* Category Selection */}
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
                <ScrollView nestedScrollEnabled={true}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setCategory(cat);
                        setSubCategory('');
                        setShowCategoryPicker(false);
                      }}
                      style={styles.pickerItem}
                    >
                      <Text>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Subcategory Selection */}
          {subCategoriesMap[category]?.length > 0 && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Subcategory</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowSubCategoryPicker(!showSubCategoryPicker)}
              >
                <Text>{subCategory || 'Select Subcategory'}</Text>
              </TouchableOpacity>
              {showSubCategoryPicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView nestedScrollEnabled={true}>
                    {subCategoriesMap[category]?.map((subCat) => (
                      <TouchableOpacity
                        key={subCat}
                        onPress={() => {
                          setSubCategory(subCat);
                          setShowSubCategoryPicker(false);
                        }}
                        style={styles.pickerItem}
                      >
                        <Text>{subCat}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Closed Days Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Shop Closed Days</Text>
            <View style={styles.daysContainer}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedCloseDays.includes(day) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDaySelection(day)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedCloseDays.includes(day) && styles.dayButtonTextSelected
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business Hours */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Business Hours</Text>
            
            {/* Opening Time */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowOpenTimePicker(!showOpenTimePicker)}
            >
              <Text>{openTimeFrom || 'Select Opening Time'}</Text>
            </TouchableOpacity>
            {showOpenTimePicker && (
              <View style={styles.pickerContainer}>
                <ScrollView nestedScrollEnabled={true}>
                  {hours.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => {
                        setOpenTimeFrom(time);
                        setShowOpenTimePicker(false);
                      }}
                      style={styles.pickerItem}
                    >
                      <Text>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Closing Time */}
            <TouchableOpacity
              style={[styles.input, { marginTop: 10 }]}
              onPress={() => setShowCloseTimePicker(!showCloseTimePicker)}
            >
              <Text>{openTimeTo || 'Select Closing Time'}</Text>
            </TouchableOpacity>
            {showCloseTimePicker && (
              <View style={styles.pickerContainer}>
                <ScrollView nestedScrollEnabled={true}>
                  {hours.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => {
                        setOpenTimeTo(time);
                        setShowCloseTimePicker(false);
                      }}
                      style={styles.pickerItem}
                    >
                      <Text>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Communities Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Serving Communities</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter communities (comma-separated)"
              value={communitiesInput}
              onChangeText={setCommunitiesInput}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Complete Registration</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By registering, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#6a1b9a',
  },
  container: {
    paddingHorizontal: 15,
  },
  tagline: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
  },
  fieldContainer: {
    marginBottom: 20,
    zIndex: 1,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  captureButton: {
    backgroundColor: '#ff5722',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 20,
    minWidth: 90,
  },
  dayButtonSelected: {
    backgroundColor: '#ff5722',
  },
  dayButtonText: {
    textAlign: 'center',
  },
  dayButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#ff5722',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
});

export default RegisterScreen;