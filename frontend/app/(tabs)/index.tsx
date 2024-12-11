import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SellerSplashScreen from '../../screens/SplashScreen';
import PhoneInputScreen from '../../screens/PhoneInputScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import DashboardScreen from '../../screens/DashboardScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SellerSplashScreen} />
      <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
};

export default App;
