import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BarChart, PieChart } from 'react-native-chart-kit';
import CommonStyles from '../CommonStyles';

const MetricsDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Inventory');
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [salesDetails, setSalesDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shopPaused, setShopPaused] = useState(false);

  const baseURL = 'https://0d8af6e4-9d6b-496b-8a08-4d699be941db.mock.pstmn.io/';

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

  return (
    <SafeAreaView style={CommonStyles.safeArea}>
    <View style={styles.container}>
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={CommonStyles.arrowContainer}>
          <Icon name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={CommonStyles.headerText}>Metrics Dashboard</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={CommonStyles.tabContainer}>
        {['Inventory', 'Sales'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[CommonStyles.tab, activeTab === tab && CommonStyles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[CommonStyles.tabText, activeTab === tab && CommonStyles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : activeTab === 'Inventory' ? (
        <ScrollView>
          {/* Continuous Table */}
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              {['Item', 'Rate', 'Stock'].map((header) => (
                <Text key={header} style={styles.tableHeaderText}>
                  {header}
                </Text>
              ))}
            </View>
            {inventoryDetails.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableData}>{item.name}</Text>
                <Text style={styles.tableData}>₹{item.rate}</Text>
                <Text style={styles.tableData}>
                  {item.inventory} {item.metric}
                </Text>
              </View>
            ))}
          </View>

          {/* Pause Button */}
          <TouchableOpacity style={styles.pauseShopButton} onPress={handleShopPauseToggle}>
            <Text style={styles.buttonText}>
              {shopPaused ? 'Unpause Entire Shop' : 'Pause Entire Shop'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView>
          {/* Cleaner Metrics Display */}
          {salesDetails ? (
            <View style={styles.metricsContainer}>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Orders Delivered</Text>
                <Text style={styles.cardValue}>{salesDetails.ordersDelivered}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Orders Cancelled</Text>
                <Text style={styles.cardValue}>{salesDetails.ordersCancelled}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Orders Pending</Text>
                <Text style={styles.cardValue}>{salesDetails.ordersPending}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>GMV</Text>
                <Text style={styles.cardValue}>{salesDetails.gmv} ₹</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Number of Orders</Text>
                <Text style={styles.cardValue}>{salesDetails.numberOfOrders}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>No sales data available.</Text>
          )}

          {/* BarChart for Orders */}
          <View style={styles.chartCard}>
            <Text style={styles.chartHeader}>Order Distribution</Text>
            <BarChart
              data={{
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
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chartStyle}
            />
          </View>

          {/* PieChart for Orders */}
          <View style={styles.chartCard}>
            <Text style={styles.chartHeader}>Order Status</Text>
            <PieChart
              data={[
                { name: 'Delivered', population: salesDetails?.ordersDelivered || 0, color: '#FFD700', legendFontColor: '#000', legendFontSize: 14 },
                { name: 'Cancelled', population: salesDetails?.ordersCancelled || 0, color: '#FF4500', legendFontColor: '#000', legendFontSize: 14 },
                { name: 'Pending', population: salesDetails?.ordersPending || 0, color: '#1E90FF', legendFontColor: '#000', legendFontSize: 14 },
              ]}
              width={Dimensions.get('window').width - 40}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: () => '#000',
              }}
              style={styles.chartStyle}
            />
          </View>
        </ScrollView>
      )}
    </View>
    </SafeAreaView>
  );
};

const chartConfig = {
  backgroundColor: '#6a1b9a',
  backgroundGradientFrom: '#6a1b9a',
  backgroundGradientTo: '#9c27b0',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 204, 102, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

  

const styles = StyleSheet.create(
{
    ...CommonStyles,

  container: { flex: 1, backgroundColor: '#6a1b9a', padding: 10 },

  table: { backgroundColor: '#ffffff', borderRadius: 10 },
  tableRowHeader: { flexDirection: 'row', padding: 10, backgroundColor: '#ddd' },
  tableHeaderText: { flex: 1, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tableData: { flex: 1, textAlign: 'center', color: '#333' },
  pauseShopButton: { backgroundColor: '#d32f2f', padding: 15, marginTop: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  metricsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#ffffff', borderRadius: 10, padding: 10, marginBottom: 10, alignItems: 'center' },
  cardHeader: { fontSize: 14, color: '#6a1b9a', fontWeight: 'bold', marginBottom: 5 },
  cardValue: { fontSize: 20, color: '#333', fontWeight: 'bold' },
  chartHeader: {
    color: '#FFD700', // Gold to match the complementary theme
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
  },
  noDataText: { color: '#ffffff', textAlign: 'center', marginTop: 20 },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 5,
    elevation: 5, // Shadow for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chartHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a1b9a',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default MetricsDashboard;
