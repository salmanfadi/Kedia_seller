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
import AWS from 'aws-sdk';
import Icon from 'react-native-vector-icons/FontAwesome';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import CommonStyles from '../CommonStyles';


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-north-1',
});


const s3 = new AWS.S3({
  signatureVersion: 'v4', // Explicitly set to AWS4-HMAC-SHA256
});

const DashboardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({});

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
      setExpandedOrderId(null);
      return;
    }

    setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await axios.get(`${baseURL}/seller/?shopfrontId=sf-1&orderId=${orderId}`);
      const orderDetails = response.data.orderDetail;

      const listingsWithUrls = await Promise.all(
        orderDetails.listings.map(async (item) => {
          if (item.shortImg) {
            const s3Key = item.shortImg.replace('s3://tnn-app-test/', '');
            try {
              const imageUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: 'tnn-app-test',
                Key: s3Key,
                Expires: 3600,
              });
              return { ...item, s3Url: imageUrl };
            } catch (err) {
              console.error(`Error generating signed URL for item ${item.id}:`, err);
              return { ...item, s3Url: null };
            }
          }
          return { ...item, s3Url: null };
        })
      );

      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, listings: listingsWithUrls } : order
        )
      );

      setPendingOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, listings: listingsWithUrls } : order
        )
      );

      setExpandedOrderId(orderId);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch order details.');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
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
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={CommonStyles.arrowContainer}>
          <Icon name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={CommonStyles.headerText}>Manage Orders</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Metrics')}
          style={CommonStyles.redirectButton}
        >
          <Icon name="bar-chart" size={20} color="#ffffff" />
        </TouchableOpacity>
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

              {expandedOrderId === order.id && (
                <View style={styles.orderDetailsContainer}>
                  {loadingDetails[order.id] ? (
                    <ActivityIndicator size="small" color="#9c27b0" />
                  ) : (
                    <>
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
                    </>
                  )}
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
