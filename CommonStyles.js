import { StyleSheet, Platform, StatusBar } from 'react-native';

const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a1b9a', // Purple background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 5, // Add padding for Android
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    backgroundColor: '#6a1b9a',
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  arrowContainer: {
    padding: 5,
  },
  redirectButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderColor: '#ffffff',
    marginVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#9575cd',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#ffca28',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
});

export default CommonStyles;
