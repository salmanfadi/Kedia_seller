import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Dashboard</Text>

      {/* Order 1 */}
      <View style={styles.orderCard}>
        <Text style={styles.orderDetails}>Order Details #1</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.dispatchButton}>
            <Text style={styles.buttonText}>Dispatch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order 2 */}
      <View style={styles.orderCard}>
        <Text style={styles.orderDetails}>Order Details #2</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.dispatchButton}>
            <Text style={styles.buttonText}>Dispatch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9c27b0',  // Purple background
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  orderDetails: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',  // Align buttons horizontally
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  dispatchButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    width: '45%',  // Ensure buttons have equal width
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    width: '45%',  // Ensure buttons have equal width
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DashboardScreen;
