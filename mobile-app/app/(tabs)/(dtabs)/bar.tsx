import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { BarChart } from "react-native-gifted-charts";

const logo = require('@/assets/images/icon.png');

const barData = [
        {value: 25.0, label: 'M'},
        {value: 50.0, label: 'T'},
        {value: 74.5, label: 'W'},
        {value: 32.0, label: 'T'},
        {value: 60.0, label: 'F'},
        {value: 25.6, label: 'S'},
        {value: 30.0, label: 'S'},
    ];

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

      <View style={styles.chartWrap}>
        <BarChart
          data={barData}
          barWidth={22}
          spacing={18}
          roundedTop
          yAxisThickness={0}
          xAxisThickness={0}
          noOfSections={4}
          maxValue={Math.max(10, ...barData.map((d) => d.value))}
          frontColor="#8F8F8F"
          hideRules
          hideYAxisText
          disableScroll
          initialSpacing={12}
          barBorderRadius={4}
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
    paddingTop: 32,
    paddingBottom: 12,
    paddingLeft: 8,
    paddingRight: 16,
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
    paddingTop: 0,
  },
  textT: {
    color: '#000000',
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
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
  chartWrap: {
    marginTop: 4,
    backgroundColor: '#DADADA',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
});