import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import CommonStyles from '../CommonStyles';

const DashboardScreen = ({ navigation, route }) => {
  const { phone } = route.params; // Receive phone number from navigation params
  const baseURL = 'https://0d8af6e4-9d6b-496b-8a08-4d699be941db.mock.pstmn.io/';

  const pendingOrdersAPI = `${baseURL}/seller?userId=${phone}&maxResults=7&paginationToken=xyz`;
  const allOrdersAPI = `${baseURL}/seller?userId=${phone}&maxResults=10&paginationToken=xyz&from=12345678&to=12345678`;

  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const apiURL = activeTab === 'Pending' ? pendingOrdersAPI : allOrdersAPI;
      const response = await axios.get(apiURL);
      const orders = response.data.orders;

      if (activeTab === 'Pending') {
        setPendingOrders(orders);
      } else {
        setAllOrders(orders);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await axios.get(`${baseURL}/seller/?shopfrontId=sf-1&orderId=${orderId}`);
      const orderDetails = response.data.orderDetail;

      const listingsWithUrls = orderDetails.listings.map((item) => ({
        ...item,
        s3Url: item.shortImg,
      }));

      if (activeTab === 'Pending') {
        setPendingOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, listings: listingsWithUrls } : order
          )
        );
      } else {
        setAllOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, listings: listingsWithUrls } : order
          )
        );
      }

      setExpandedOrderId(orderId);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch order details.');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleNextStatus = async (order) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, [order.id]: true }));
  
      const requestBody = {
        storefrontId: 'sf-1',
        orderId: order.id,
        currState: order.currStatus,
        nextState: order.nextStatus,
      };
  
      const response = await axios.post(`${baseURL}/seller`, requestBody);
  
      if (response.data.success) {
        const nextState = response.data.currState; // Current state after the update
        const nextNextStatus = response.data.nextState; // Next status for the updated state
  
        // Update orders in Pending Orders
        const updateOrders = (orders) =>
          orders.map((item) =>
            item.id === order.id
              ? {
                  ...item,
                  currStatus: nextState,
                  nextStatus: nextNextStatus,
                }
              : item
          );
  
        setPendingOrders((prevPendingOrders) => updateOrders(prevPendingOrders));
        setAllOrders((prevAllOrders) => updateOrders(prevAllOrders));
      } else {
        Alert.alert('Error', 'Failed to update order status.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status.');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [order.id]: false }));
    }
  };
  
  const handleCancelOrder = (orderId) => {
    setPendingOrders((prevPendingOrders) =>
      prevPendingOrders.map((item) =>
        item.id === orderId ? { ...item, isCanceled: true } : item
      )
    );
    setAllOrders((prevOrders) =>
      prevOrders.map((item) =>
        item.id === orderId ? { ...item, isCanceled: true } : item
      )
    );
  };
  
  
  const ordersToDisplay = activeTab === 'Pending' ? pendingOrders : allOrders;

  return (
    <View style={styles.container}>
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={CommonStyles.arrowContainer}>
          <Icon name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={CommonStyles.headerText}>Manage Orders</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={fetchOrders} style={CommonStyles.redirectButton}>
            <Icon name="refresh" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Metrics')}
            style={CommonStyles.redirectButton}
          >
            <Icon name="bar-chart" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={CommonStyles.tabContainer}>
        <TouchableOpacity
          style={[CommonStyles.tab, activeTab === 'Pending' && CommonStyles.activeTab]}
          onPress={() => setActiveTab('Pending')}
        >
          <Text style={CommonStyles.tabText}>Pending Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[CommonStyles.tab, activeTab === 'All' && CommonStyles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={CommonStyles.tabText}>All Orders</Text>
        </TouchableOpacity>
      </View>

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

              {expandedOrderId === order.id && order.listings && (
                <View style={styles.orderDetailsContainer}>
                  <Text style={styles.orderDetailsTitle}>Order Items</Text>
                  {order.listings.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Image
                        source={{ uri: item.s3Url || 'https://via.placeholder.com/100' }}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>
                          {item.quantity} {item.metric}
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                    </View>
                  ))}
                </View>
              )}

<View style={styles.buttonContainer}>
  {order.isCanceled ? (
    <Text style={styles.canceledText}>The order is canceled</Text>
  ) : (
    <>
      {/* Render Cancel button only for orders with statuses before 'accepted' */}
      {activeTab === 'Pending' &&
        order.currStatus === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(order.id)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}

      {/* Render Next Status button */}
      {order.nextStatus && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleNextStatus(order)}
        >
          <Text style={styles.buttonText}>
            {order.nextStatus === 'accepted'
              ? 'Accept'
              : order.nextStatus === 'dispatched'
              ? 'Dispatch'
              : order.nextStatus === 'delivered'
              ? 'Deliver'
              : order.nextStatus.charAt(0).toUpperCase() + order.nextStatus.slice(1)}
          </Text>
        </TouchableOpacity>
      )}
    </>
  )}
</View>


            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ...CommonStyles,
  container: {
    flex: 1,
    backgroundColor: '#6a1b9a',
    padding: 10,
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
  canceledText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 5,
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#424242',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6a1b9a',
  },
});

export default DashboardScreen;
