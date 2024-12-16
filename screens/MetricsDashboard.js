import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BarChart, PieChart } from 'react-native-chart-kit';

const MetricsDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Inventory');
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [salesDetails, setSalesDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shopPaused, setShopPaused] = useState(false);

  const baseURL = 'https://720b64ea-dd06-4f91-a0e5-5704da4867fd.mock.pstmn.io';

  useEffect(() => {
    if (activeTab === 'Inventory') fetchInventory();
    if (activeTab === 'Sales') fetchSales();
  }, [activeTab]);

  // Fetch Inventory Data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/seller/viewInventory?shopfrontId=sf-1`);
      const data = await response.json();
      setInventoryDetails(data.inventoryDetails || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch inventory data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Sales Data
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseURL}/seller/viewSales?shopfrontId=sf-1&from=12345678&to=12345678`
      );
      const data = await response.json();
      
      if (data.salesDetails && typeof data.salesDetails === 'object') {
        setSalesDetails(data.salesDetails);
      } else {
        Alert.alert('Error', 'Sales data is not in expected format.');
        setSalesDetails(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sales data.');
    } finally {
      setLoading(false);
    }
  };

  // Pause/Unpause Shop
  const handleShopPauseToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/seller/manageShop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopfrontId: 'sf-1', pause: !shopPaused }),
      });
      if (response.ok) {
        setShopPaused(!shopPaused);
        Alert.alert('Success', `Shop is now ${!shopPaused ? 'paused' : 'active'}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update shop status.');
    } finally {
      setLoading(false);
    }
  };

  // Data for BarChart and PieChart
  const barChartData = {
    labels: ['Delivered', 'Cancelled', 'Pending'],
    datasets: [
      {
        data: [
          salesDetails?.ordersDelivered || 0,
          salesDetails?.ordersCancelled || 0,
          salesDetails?.ordersPending || 0,
        ],
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Delivered',
      population: salesDetails?.ordersDelivered || 0,
      color: '#2ecc71',
      legendFontColor: '#ffffff',
      legendFontSize: 15,
    },
    {
      name: 'Cancelled',
      population: salesDetails?.ordersCancelled || 0,
      color: '#e74c3c',
      legendFontColor: '#ffffff',
      legendFontSize: 15,
    },
    {
      name: 'Pending',
      population: salesDetails?.ordersPending || 0,
      color: '#f39c12',
      legendFontColor: '#ffffff',
      legendFontSize: 15,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.arrowContainer}>
          <Icon name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Metrics Dashboard</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Inventory', 'Sales'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : activeTab === 'Inventory' ? (
        <ScrollView>
          <View style={styles.tableHeader}>
            {['Item', 'Rate', 'Stock'].map((header) => (
              <Text key={header} style={styles.tableHeaderText}>{header}</Text>
            ))}
          </View>
          {inventoryDetails.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableData}>{item.name}</Text>
              <Text style={styles.tableData}>₹{item.rate}</Text>
              <Text style={styles.tableData}>{item.inventory} {item.metric}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.pauseShopButton} onPress={handleShopPauseToggle}>
            <Text style={styles.buttonText}>
              {shopPaused ? 'Unpause Entire Shop' : 'Pause Entire Shop'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView>
          {/* Sales Data in Single Table */}
          <View style={styles.tableHeader}>
            {['Metric', 'Value'].map((header) => (
              <Text key={header} style={styles.tableHeaderText}>{header}</Text>
            ))}
          </View>
          {salesDetails ? (
            <>
              <View style={styles.tableRow}>
                <Text style={styles.tableData}>GMV</Text>
                <Text style={styles.tableData}>{salesDetails.gmv} ₹</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableData}>Number of Orders</Text>
                <Text style={styles.tableData}>{salesDetails.numberOfOrders}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableData}>Orders Delivered</Text>
                <Text style={styles.tableData}>{salesDetails.ordersDelivered}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableData}>Orders Cancelled</Text>
                <Text style={styles.tableData}>{salesDetails.ordersCancelled}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableData}>Orders Pending</Text>
                <Text style={styles.tableData}>{salesDetails.ordersPending}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.tableData}>No sales data available.</Text>
          )}

          {/* BarChart for Orders */}
          <Text style={styles.salesHeaderText}>Order Distribution</Text>
          <BarChart
            data={barChartData}
            width={Dimensions.get('window').width - 20}
            height={220}
            chartConfig={chartConfig}
            style={styles.chartStyle}
          />

          {/* PieChart for Orders */}
          <Text style={styles.salesHeaderText}>Order Status</Text>
          <PieChart
            data={pieChartData}
            width={Dimensions.get('window').width - 20}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            style={styles.pieChartStyle}
          />
        </ScrollView>
      )}
    </View>
  );
};

const chartConfig = {
  backgroundColor: '#6a1b9a',
  backgroundGradientFrom: '#6a1b9a',
  backgroundGradientTo: '#9c27b0',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6a1b9a', padding: 10 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  arrowContainer: { padding: 5 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  tabContainer: { flexDirection: 'row', marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#9575cd', marginHorizontal: 5, borderRadius: 5 },
  activeTab: { backgroundColor: '#ffca28' },
  tabText: { color: '#ffffff', fontWeight: 'bold' },
  activeTabText: { color: '#4a148c' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#ddd', padding: 10 },
  tableHeaderText: { flex: 1, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  tableRow: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 10, marginVertical: 5 },
  tableData: { flex: 1, textAlign: 'center', color: '#333' },
  pauseShopButton: { backgroundColor: '#d32f2f', padding: 15, marginTop: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  salesHeaderText: { color: '#fff', fontSize: 18, marginBottom: 10 },
  chartStyle: { borderRadius: 10 },
  pieChartStyle: {
    borderRadius: 10,
    padding: 5,
    backgroundColor: '#ffffff',
    marginVertical: 10,
  },
});

export default MetricsDashboard;
