import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import SellerSplashScreen from './screens/SplashScreen';
import PhoneInputScreen from './screens/PhoneInputScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import MetricsDashboard from './screens/MetricsDashboard';
import ProfileInfoScreen from './screens/ProfileInfoScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SellerSplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PhoneInput"
          component={PhoneInputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileInfo"
          component={ProfileInfoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Metrics"
          component={MetricsDashboard}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
