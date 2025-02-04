import React, { useState, useEffect, useCallback, useMemo, useRef  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Image } from 'expo-image';
import CommonStyles from '../CommonStyles';

const PAGE_SIZE = 10;

// Utility function for API calls with error handling
const fetchData = async (url, options = {}) => {
  try {
    const response = await axios({ url, ...options });
    return response.data;
  } catch (error) {
    Alert.alert('Error', error.message || 'Something went wrong');
    throw error;
  }
};

// Debounce function to prevent rapid API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const DashboardScreen = ({ navigation, route }) => {
  const { phone } = route.params;
  const baseURL = 'http://ec2-13-60-227-45.eu-north-1.compute.amazonaws.com:8081';

  const [sfId, setSfId] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({});
  const [pagination, setPagination] = useState({
    Pending: { currentStart: 0, hasMore: true },
    All: { currentStart: 0, hasMore: true },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch ShopFront ID
  const fetchSfId = useCallback(async () => {
    const data = await fetchData(`${baseURL}/sf/fetch?ownerId=${phone}`);
    setSfId(data.id);
  }, [phone]);

  useEffect(() => {
    fetchSfId();
  }, [fetchSfId]);

  // Fetch orders with pagination
  const isLoadingRef = useRef(false);

  const fetchOrders = useCallback(
    async (loadMore = false) => {
      if (!sfId || isLoadingRef.current) return;
  
      console.log(`Loading orders for tab: ${activeTab}, loadMore: ${loadMore}`);
      isLoadingRef.current = true;
  
      try {
        const tabKey = activeTab;
        const { currentStart, hasMore } = pagination[tabKey];
  
        if (loadMore && !hasMore) {
          console.log(`No more orders for tab: ${tabKey}`);
          return;
        }
  
        const start = loadMore ? currentStart : 0;
        const apiURL =
          tabKey === 'Pending'
            ? `${baseURL}/orderDashboard/pending?sfId=${sfId}&start=${start}`
            : `${baseURL}/orderDashboard/browse?sfId=${sfId}&start=${start}`;
  
        const { orderSummaries, size } = await fetchData(apiURL);
        console.log(`Fetched ${size} orders for tab: ${tabKey}`);
  
        if (!orderSummaries) return;
  
        const newCurrentStart = start + size;
        const newHasMore = orderSummaries.length === PAGE_SIZE;
  
        setPagination((prev) => ({
          ...prev,
          [tabKey]: { currentStart: newCurrentStart, hasMore: newHasMore },
        }));
  
        if (tabKey === 'Pending') {
          setPendingOrders((prev) =>
            loadMore ? [...prev, ...orderSummaries] : orderSummaries
          );
        } else {
          setAllOrders((prev) =>
            loadMore ? [...prev, ...orderSummaries] : orderSummaries
          );
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [sfId, activeTab, pagination]
  );
  
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  
    setPagination((prev) => ({
      ...prev,
      [tab]: { currentStart: 0, hasMore: true },
    }));
  
    if (tab === 'Pending') {
      setPendingOrders([]);
    } else {
      setAllOrders([]);
    }
  };
  

  useEffect(() => {
    if (sfId) {
      console.log('Fetching orders for activeTab:', activeTab);
      fetchOrders();
    }
  }, [sfId, activeTab]); // ✅ Triggers fetchOrders when tab changes
  

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPagination((prev) => ({
      Pending: { currentStart: 0, hasMore: true },
      All: { currentStart: 0, hasMore: true },
    }));
  
    await fetchOrders(); // Ensures it only runs once
    setIsRefreshing(false);
  };

  

  // Handle load more
  const loadMoreCooldownRef = useRef(false);

  const handleLoadMore = () => {
    if (!loading && pagination[activeTab].hasMore && !loadMoreCooldownRef.current) {
      console.log('Loading more orders...');
      loadMoreCooldownRef.current = true;
      setTimeout(() => {
        loadMoreCooldownRef.current = false;
      }, 500); // Prevents multiple calls in quick succession
      fetchOrders(true);
    }
  };
  
  

  // Fetch order details with debounce
  const fetchOrderDetails = useCallback(async (orderId) => {
    console.log('Touched order:', orderId);
    console.log('Current expandedOrderId:', expandedOrderId);
  
    if (expandedOrderId === orderId) {
      console.log('Collapsing order:', orderId);
      setExpandedOrderId(null);
      return;
    }
  
    const targetOrder = pendingOrders.find((o) => o.orderId === orderId) || 
                        allOrders.find((o) => o.orderId === orderId);
  
    if (targetOrder?.listings?.length) {
      console.log('Order details already fetched, expanding:', orderId);
      setExpandedOrderId(orderId);
      return;
    }
  
    console.log('Fetching order details from API for:', orderId);
    setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));
  
    try {
      const orderDetails = await fetchData(`${baseURL}/orderDashboard/order?orderId=${orderId}`);
      console.log('Order details fetched:', orderDetails);
  
      const updateOrders = (orders) =>
        orders.map((order) =>
          order.orderId === orderId ? { ...order, listings: orderDetails.listings } : order
        );
  
      setPendingOrders((prev) => updateOrders(prev));
      setAllOrders((prev) => updateOrders(prev));
  
      setExpandedOrderId(orderId);
      console.log('Expanded order set to:', orderId);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      Alert.alert('Error', 'Failed to fetch order details');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  }, [expandedOrderId, pendingOrders, allOrders]);
  
  const debouncedFetchOrderDetails = debounce(fetchOrderDetails, 300);
  
  // Handle next status
  const handleNextStatus = async (order) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, [order.orderId]: true }));

      const response = await fetchData(`${baseURL}/orderDashboard/updateState`, {
        method: 'POST',
        data: {
          orderId: order.orderId,
          currState: order.currState,
          nextState: order.nextState,
        },
      });

      const { currState, nextState, terminal } = response;

      const updateOrders = (orders) =>
        orders.map((item) =>
          item.orderId === order.orderId
            ? {
                ...item,
                currState: currState,
                nextState: nextState,
                terminal: terminal,
              }
            : item
        );

      setPendingOrders((prev) => updateOrders(prev));
      setAllOrders((prev) => updateOrders(prev));
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [order.orderId]: false }));
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));

      const response = await fetchData(`${baseURL}/orderDashboard/cancel`, {
        method: 'POST',
        data: { orderId },
      });

      const { currState, nextState, terminal } = response;

      const updateOrders = (orders) =>
        orders.map((item) =>
          item.orderId === orderId
            ? {
                ...item,
                currState: currState,
                nextState: nextState,
                terminal: terminal,
              }
            : item
        );

      setPendingOrders((prev) => updateOrders(prev));
      setAllOrders((prev) => updateOrders(prev));
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  };


  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    return activeTab === 'Pending' ? pendingOrders : allOrders;
  }, [activeTab, pendingOrders, allOrders]);

  // Render order item
  const renderOrderItem = ({ item }) => {
    const isExpanded = expandedOrderId === item.orderId;
    const isLoading = loadingDetails[item.orderId];

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => debouncedFetchOrderDetails(item.orderId)}
      >
        <View style={styles.summaryView}>
          <Text style={styles.orderTitle}>#Order {item.orderId.replace('o-co-c-', '')}</Text>
          <Text style={styles.orderAmount}>₹{item.orderTotal}</Text>
        </View>

        <Text style={styles.deliveryDetails}>{item.address}</Text>

        {isLoading && (
          <ActivityIndicator size="small" color="#9c27b0" style={styles.loadingIndicator} />
        )}

        {isExpanded && item.listings && (
          <View style={styles.orderDetailsContainer}>
            <Text style={styles.orderDetailsTitle}>Order Items</Text>
            {item.listings.map((listing, index) => (
              <View key={`${listing.id}-${item.orderId}-${index}`} style={styles.itemRow}>
                <Image
                  style={styles.itemImage}
                  source={{ uri: listing.imgUrl || 'https://via.placeholder.com/100' }}
                  cachePolicy="disk"
                  placeholder={{ uri: 'https://via.placeholder.com/100' }}
                  transition={200}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{listing.title}</Text>
                  <Text style={styles.itemQuantity}>{listing.variation}</Text>
                  <Text style={styles.itemQuantity}>Qty: {listing.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{listing.price}</Text>
              </View>
            ))}
          </View>
        )}


        {/* Buttons for pending orders */}
        {activeTab === 'Pending' && (
          <View style={styles.buttonContainer}>
            {item.terminal ? (
              <Text style={styles.canceledText}>
                {item.currState === 'CANCELLED' ? 'Order Cancelled' : 'Order Fulfilled'}
              </Text>
            ) : (
              <>
                {item.currState !== 'ACCEPTED' && item.currState !== 'DISPATCHED' && item.currState !== 'FULFILLED' && (
                  <TouchableOpacity
                    style={[styles.cancelButton, isLoading && styles.disabledButton]}
                    onPress={() => handleCancelOrder(item.orderId)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>Cancel</Text>
                    )}
                  </TouchableOpacity>
                )}

                {item.nextState && !item.terminal && (
                  <TouchableOpacity
                    style={[styles.actionButton, isLoading && styles.disabledButton]}
                    onPress={() => handleNextStatus(item)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {item.nextState === 'Accept' && 'Accept Order'}
                        {item.nextState === 'Dispatch' && 'Mark Dispatched'}
                        {item.nextState === 'Fulfill' && 'Mark Fulfilled'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
      <View style={styles.container}>
        <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
            onPress={() => navigation.navigate('ProfileInfo', { phone })}
            style={CommonStyles.profileButton}
          >
            <Icon name="user-circle" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={CommonStyles.headerText}>Manage Orders</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleRefresh} style={CommonStyles.redirectButton}>
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
    onPress={() => handleTabChange('Pending')}
  >
    <Text style={CommonStyles.tabText}>Pending Orders</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[CommonStyles.tab, activeTab === 'All' && CommonStyles.activeTab]}
    onPress={() => handleTabChange('All')}
  >
    <Text style={CommonStyles.tabText}>All Orders</Text>
  </TouchableOpacity>
</View>


        <FlatList
  data={filteredOrders}
  renderItem={renderOrderItem}
  keyExtractor={(item) => `${item.orderId}-${activeTab}`}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.7} // Adjusted threshold to prevent unnecessary calls
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      colors={['#9c27b0']}
      progressBackgroundColor="#ffffff"
    />
  }
  ListFooterComponent={() => (
    <View style={styles.footer}>
      {loading && <ActivityIndicator size="large" color="#9c27b0" />}
    </View>
  )}
/>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ...CommonStyles,
  container: {
    flex: 1,
    backgroundColor: '#6a1b9a',
    padding: 10,
  },
  loadingIndicator: {
    marginTop: 10,
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
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a1b9a',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a1b9a',
  },
  deliveryDetails: {
    fontSize: 14,
    color: '#424242',
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#43a047',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
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
    marginVertical: 5,
  },
  orderDetailsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
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
    padding: 5,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6a1b9a',
  },
  footer: {
    padding: 10,
    alignItems: 'center',
  },
  noMoreText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
});

export default DashboardScreen;