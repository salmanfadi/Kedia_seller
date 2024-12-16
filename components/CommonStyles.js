import { StyleSheet, Platform, StatusBar } from 'react-native';

const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a1b9a', // Purple background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Add padding for Android
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 22,
    color: '#ffffff',
    marginVertical: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '85%',
    fontSize: 14,
    color: '#424242',
    elevation: 3,
  },
  button: {
    backgroundColor: '#512da8',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '85%',
    marginVertical: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#9575cd',
    color: '#4a148c',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTab: {
    backgroundColor: '#ffca28',
  },
});

export default CommonStyles;
