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

const PAGE_SIZE = 10;

import AsyncStorage from '@react-native-async-storage/async-storage';

const MetricsDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Inventory');
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopPaused, setShopPaused] = useState(false);
  const [currentStart, setCurrentStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sfId, setSfId] = useState(null); // Store ShopFront ID

  const baseURL = 'http://ec2-13-60-227-45.eu-north-1.compute.amazonaws.com:8081';

  useEffect(() => {
    const getSfId = async () => {
      const storedSfId = await AsyncStorage.getItem('sfId');
      if (storedSfId) setSfId(storedSfId);
    };
    getSfId();
  }, []);

  useEffect(() => {
    if (sfId && activeTab === 'Inventory') fetchInventory();
  }, [sfId, activeTab, currentStart]);

  const fetchInventory = async (loadMore = false) => {
    if (loading || !sfId || (!loadMore && currentStart !== 0)) return;

    setLoading(true);
    try {
      const start = loadMore ? currentStart : 0;
      const response = await fetch(
        `${baseURL}/metricDashboard/inventory?sfId=${sfId}&start=${start}`
      );
      const data = await response.json();

      if (data.summary?.length) {
        setInventoryDetails(prev => 
          loadMore ? [...prev, ...data.summary] : data.summary
        );
        setCurrentStart(start + data.summary.length);
        setHasMore(data.summary.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleShopPauseToggle = async () => {
    if (!sfId) return;
    setLoading(true);
    try {
      const endpoint = shopPaused ? `${baseURL}/sf/unpause` : `${baseURL}/sf/pause`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sfId }), // Use the stored ShopFront ID
      });

      if (response.ok) {
        setShopPaused(!shopPaused);
        Alert.alert('Success', `Shop is now ${!shopPaused ? 'paused' : 'active'}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update shop status');
    } finally {
      setLoading(false);
    }
  };


  const pieChartColors = [
    '#FF5733', // Bright Orange
    '#33FF57', // Green
    '#3357FF', // Blue
    '#FFC300', // Yellow
    '#8E44AD', // Purple
    '#FF33A6', // Pink
    '#2ECC71', // Light Green
    '#E74C3C', // Red
  ];
  
  
  // Modify Pie Chart Data
  const prepareChartData = () => {
    const itemCounts = {};
    inventoryDetails.forEach((item) => {
      const title = item.title;
      itemCounts[title] = (itemCounts[title] || 0) + 1;
    });
  
    return {
      labels: Object.keys(itemCounts),
      data: Object.values(itemCounts),
      colors: Object.keys(itemCounts).map((_, index) => pieChartColors[index % pieChartColors.length]),
    };
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
          {['Inventory', 'Charts'].map((tab) => (
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

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : activeTab === 'Inventory' ? (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.table}>
              <View style={styles.tableRowHeader}>
                {['Item', 'Price Map'].map((header) => (
                  <Text key={header} style={styles.tableHeaderText}>{header}</Text>
                ))}
              </View>
              
              {inventoryDetails.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.tableRow}>
                  <Text style={styles.tableData}>{item.title}</Text>
                  <Text style={styles.tableData}>
                    {Object.entries(item.priceMap)
                      .map(([size, { ssp }]) => `${size}: ₹${ssp}`)
                      .join('\n')}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.buttonGroup}>
              {hasMore && (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={() => fetchInventory(true)}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.pauseShopButton}
                onPress={handleShopPauseToggle}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {shopPaused ? 'Unpause Shop' : 'Pause Shop'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.chartsContainer}>
            {inventoryDetails.length > 0 ? (
              <>
                <View style={styles.chartCard}>
  <Text style={styles.chartHeader}>Inventory Distribution</Text>
  <BarChart
    data={{
      labels: prepareChartData().labels.map(label => label.length > 8 ? label.substring(0, 8) + "..." : label), // Shorten long labels
      datasets: [{ data: prepareChartData().data }]
    }}
    width={Dimensions.get('window').width - 40}
    height={220}
    fromZero={true}
    showValuesOnTopOfBars={true}
    withInnerLines={false}
    withHorizontalLabels={true}
    withVerticalLabels={true}
    chartConfig={{
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      barPercentage: 0.6, // Adjust width for spacing
      propsForVerticalLabels: {
        fontSize: 12,
        rotation: -30, // Rotate labels to fit
      },
    }}
    style={styles.chartStyle}
  />
</View>


<View style={styles.chartCard}>
  <Text style={styles.chartHeader}>Inventory Breakdown</Text>
  <PieChart
    data={prepareChartData().labels.map((label, index) => ({
      name: label.length > 10 ? label.substring(0, 10) + "..." : label, // Shorten long labels
      population: prepareChartData().data[index],
      color: prepareChartData().colors[index],
      legendFontColor: '#000', // Ensure readable legend
      legendFontSize: 14, // Increase readability
    }))}
    width={Dimensions.get('window').width - 40}
    height={220}
    accessor="population"
    backgroundColor="transparent"
    chartConfig={{
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    }}
    style={styles.chartStyle}
  />
</View>


              </>
            ) : (
              <Text style={styles.noDataText}>No data available for charts</Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};



const chartConfig = {
  backgroundColor: '#ffffff',  // Light background for better contrast
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#f4f4f4',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Dark text
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Ensure labels are black
  barPercentage: 0.6, // Thicker bars for clarity
  propsForLabels: {
    fontSize: 10, // Reduce size to prevent overlapping
  },
  useShadowColorFromDataset: false,
  propsForBackgroundLines: {
    strokeWidth: 0.3, // Reduce thickness of background grid lines
    stroke: 'rgba(0,0,0,0.2)', // Make grid lines lighter
  },
};



const styles = StyleSheet.create({
  ...CommonStyles,
  container: {
    flex: 1,
    backgroundColor: '#6a1b9a',
    padding: 10
  },
  table: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 20
  },
  tableRowHeader: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#6a1b9a',
    textAlign: 'center',
    fontSize: 14
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tableData: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    fontSize: 14
  },
  buttonGroup: {
    marginTop: 10,
    gap: 10
  },
  loadMoreButton: {
    backgroundColor: '#43a047',
    padding: 15,
    borderRadius: 8
  },
  pauseShopButton: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3
  },
  chartHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6a1b9a',
    textAlign: 'center',
    marginBottom: 10
  },
  chartStyle: {
    borderRadius: 8
  },
  noDataText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20
  }
});



export default MetricsDashboard;