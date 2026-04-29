import { Text, FlatList, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { PieChart } from "react-native-gifted-charts";

const logo = require('@/assets/images/icon.png');


const piePalette = ['#7F7F7F', '#B1B1B1', '#909090', '#C2C2C2', '#A0A0A0'];

const dataL = [
  { id: '1', name: 'Walmart', value: 15 },
  { id: '2', name: 'Target', value: 30 },
  { id: '3', name: 'Heb', value: 26 },
  { id: '4', name: 'Walgreens', value: 40 },
];

const pieData = dataL.map((row, idx) => ({
  value: row.value,
  color: piePalette[idx % piePalette.length],
}));


export default function Index() {
  return (
    <View style={styles.containerT}>
      <View style={styles.container}>
        <Text style={styles.textT}>Receipt Tracker</Text>
        <Image style={styles.tinyLogo} source={logo} />
      </View>
      <View style={styles.containerH}>
        <Text style={styles.textH}>Money Spent</Text> 
      </View>
      <View style={styles.containerC}>
        <PieChart
          data={pieData}
          radius={130}
          donut={false}
          strokeWidth={1}
          strokeColor="#FDFEFF"
        />
      </View>
      <View style={styles.containerL}>
        <FlatList
          data={dataL}
          contentContainerStyle={{ gap: 8, paddingBottom: 18 }}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={styles.legendRow}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: piePalette[index % piePalette.length] },
                ]}
              />
              <Text style={styles.textL}>
                {item.name}: {item.value}%
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No spending data yet.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  
  containerT: {
    backgroundColor: '#FDFEFF',
    flex: 1,
    width: '100%',
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: 32,
    paddingBottom: 12,
  },
  containerH: {
    marginTop: 12,
    marginBottom: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 69,
  },
  textT: {
    color: '#000000',
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '700',
    flex: 1,
    fontFamily: 'Kameron_700Bold',
    alignSelf: 'center',
  },
  textH: {
    color: '#173372',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  tinyLogo: {
    width: 67,
    height: 67,
  },

  // componet specific styles

  containerC: {
    alignItems: 'center',
    marginTop: 6,
    margin: 0,
    padding: 0,
  },
  containerL: {
    marginTop: 20,
    margin: 0,
    padding: 0,
  },
  textL: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },



});