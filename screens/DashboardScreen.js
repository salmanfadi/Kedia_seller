import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const DashboardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const baseURL = 'https://720b64ea-dd06-4f91-a0e5-5704da4867fd.mock.pstmn.io';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/seller?userId=9731726006&maxResults=10`);
      const orders = response.data.orders;

      setPendingOrders(orders.filter((order) => order.currStatus !== 'dispatched'));
      setAllOrders(orders);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    if (expandedOrderId === orderId) {
      // Collapse the order if it's already expanded
      setExpandedOrderId(null);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/seller/?shopfrontId=sf-1&orderId=${orderId}`);
      const orderDetails = response.data.orderDetail;
      setExpandedOrderId(orderId);

      // Update the order details in the allOrders list
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, listings: orderDetails.listings } : order
        )
      );

      // Update the order details in the pendingOrders list if it exists
      setPendingOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, listings: orderDetails.listings } : order
        )
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStatus = async (order) => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseURL}/seller`, {
        storefrontId: 'sf-1',
        orderId: order.id,
        currState: order.currStatus,
        nextState: order.nextStatus,
      });

      if (response.data.success) {
        const nextState = response.data.nextState;

        setPendingOrders((prevPendingOrders) =>
          nextState
            ? prevPendingOrders.map((item) =>
                item.id === order.id
                  ? { ...item, currStatus: nextState, nextStatus: response.data.nextNextStatus }
                  : item
              )
            : prevPendingOrders.filter((item) => item.id !== order.id)
        );

        setAllOrders((prevAllOrders) =>
          prevAllOrders.map((item) =>
            item.id === order.id
              ? { ...item, currStatus: nextState, nextStatus: response.data.nextNextStatus }
              : item
          )
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await axios.post(`${baseURL}/seller`, {
        orderId,
        currStatus: 'pending',
      });

      setAllOrders((prevOrders) =>
        prevOrders.map((item) =>
          item.id === orderId ? { ...item, currStatus: 'cancelled' } : item
        )
      );

      setPendingOrders((prevPendingOrders) =>
        prevPendingOrders.filter((item) => item.id !== orderId)
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel the order.');
    } finally {
      setLoading(false);
    }
  };

  const ordersToDisplay = activeTab === 'Pending' ? pendingOrders : allOrders;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowContainer}>
          <Icon name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Manage Orders</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Metrics')}
          style={styles.redirectButton}
        >
          <Icon name="bar-chart" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Pending' && styles.activeTab]}
          onPress={() => setActiveTab('Pending')}
        >
          <Text style={styles.tabText}>Pending Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All' && styles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={styles.tabText}>All Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#9c27b0" />
        ) : (
          ordersToDisplay.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => fetchOrderDetails(order.id)}
            >
              <View style={styles.summaryView}>
                <Text style={styles.orderTitle}>#Order {order.id.replace('order-', '')}</Text>
                <Text style={styles.orderAmount}>₹{order.amountTotal}</Text>
              </View>

              <Text style={styles.deliveryDetails}>
                {order.CustomerName}, {'\n'}
                {order.address?.unitNo}, {order.address?.community}, {'\n'}
                {order.address?.landmark}
              </Text>

              {activeTab === 'Pending' && (
                <View style={styles.buttonContainer}>
                  {order.currStatus !== 'dispatched' && order.currStatus !== 'delivered' && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelOrder(order.id)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}

                  {order.nextStatus && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleNextStatus(order)}
                    >
                      <Text style={styles.buttonText}>
                        {order.nextStatus.charAt(0).toUpperCase() + order.nextStatus.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {expandedOrderId === order.id && Array.isArray(order.listings) && order.listings.length > 0 && (
                <View style={styles.orderDetailsContainer}>
                  <Text style={styles.orderDetailsTitle}>Order Items</Text>
                  {order.listings.map((item) => (
                    <View key={item.id} style={styles.itemContainer}>
                      <Text>{item.name}</Text>
                      <Text>₹{item.totalPrice} ({item.quantity} {item.metric})</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a1b9a',
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#6a1b9a',
    marginBottom: 10,
  },
  arrowContainer: { padding: 5 },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  redirectButton: { padding: 5 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#9575cd',
    alignItems: 'center',
  },
  activeTab: { backgroundColor: '#ffca28' },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a148c',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  summaryView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderTitle: { fontSize: 16, fontWeight: 'bold', color: '#6a1b9a' },
  orderAmount: { fontSize: 16, fontWeight: 'bold', color: '#6a1b9a' },
  deliveryDetails: { fontSize: 14, color: '#424242', marginTop: 5 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#43a047',
    padding: 10,
    borderRadius: 5,
    flex: 0.7,
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 5,
    flex: 0.2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orderDetailsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a1b9a',
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 5,
  },
});

export default DashboardScreen;
