  import { Text,  FlatList, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { PieChart } from "react-native-gifted-charts";

const logo = require('@/assets/images/icon.png');


const getRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
};

const data = [15, 30, 26, 40];
const pieData = data.map(value => ({
  value,
  color: getRandomColor(),}));
const dataL = [{id: '1' , name: 'Walmart', value: 15}, {id: '2' , name: 'Target',value: 30}, {id: '3' , name: 'Heb',value: 26}, {id: '4' , name: 'Walgreens',value: 40}];


export default function Index() {
  return (
    
    <View style={styles.containerT}>
      <View  style={styles.container}>
        <Image style={styles.tinyLogo} source={logo} />
        <Text style={styles.textT}>Receipt  Tracker</Text>
      </View>
      <View  style={styles.containerH}>
        <Text style={styles.textH}>Money Spent</Text> 
      </View>
      <View style={styles.containerC}>
        <PieChart data={pieData}/>
      </View>
      <View style={styles.containerL}>
        <FlatList
        data = {dataL}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({item}) => 
        <Text style={styles.textL}>{item.name}: {item.value}%</Text> 
      }
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
                          <Text style={styles.textL}>No Money spent</Text>}
        />
      </View>
    </View>
    
    
  );
}

const styles = StyleSheet.create({
  
  containerT: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    height: 1000,
    margin: 0,
    padding: 0,
  },
  containerH: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 45,
    bottom: 35,
    left: 5,
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 25,
    left: 5,
  },
  textT: {
    color: '#000000',
    fontFamily: 'Kameron',
    fontSize: 40,
    top: 5,
    bottom: 5,
  },
  textH: {
    color: '#003879',
    fontFamily: 'Inter',
    fontSize: 30,
    top: 0,
  },
  tinyLogo: {
    position: 'absolute',
    width: 50,
    height: 50,
    top: 10,
    right: 25,
  },

  // componet specific styles

containerC: {
    backgroundColor: '#fdfdfd',
     alignItems: 'center',
    top: 60,
   
    margin: 0,
    padding: 0,
  },
  containerL: {
    backgroundColor: '#fdfdfd',
     alignItems: 'center',
    top: 80,
   
    margin: 0,
    padding: 0,
  },
  textL: {
    color: '#000000',
    fontFamily: 'Kameron',
    fontSize: 20,
    top: 0,
    bottom: 0,
  },



});