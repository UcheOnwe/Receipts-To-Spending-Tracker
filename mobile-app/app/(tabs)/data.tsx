import { Image } from 'expo-image';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from "react-native-gifted-charts";

const logo = require('@/assets/images/icon.png');

//pie stuff
const RandColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
};

const piedata = [15, 30, 26, 40];
const pieData = piedata.map(value => ({
  value,
  color: RandColor(),}));
const dataL = [{id: '1' , name: 'Walmart', value: 15}, {id: '2' , name: 'Target',value: 30}, {id: '3' , name: 'Heb',value: 26}, {id: '4' , name: 'Walgreens',value: 40}];
//bar graph stuff

const barData = [
        {value: 25.0, label: 'M'},
        {value: 50.0, label: 'T'},
        {value: 74.5, label: 'W'},
        {value: 32.0, label: 'T'},
        {value: 60.0, label: 'F'},
        {value: 25.6, label: 'S'},
        {value: 30.0, label: 'S'},
    ];

    //Advice stuff

    const Advice = "\tSpend less at walmart and and put this money into savings or somthing idk";



export default function ReceiptListScreen()
{
  
  return (
    <ScrollView style={styles.Scroll}>

    <View style={styles.containerT}>
      <View  style={styles.container}>
        <Image style={styles.tinyLogo} source={logo} />
        <Text style={styles.textT}>Data Page</Text>
      </View>
      

      <View  style={styles.containerH}>
        <Text style={styles.textH}>Spending Advice</Text>
        <View>
        <Text style={styles.textD}>{Advice}</Text>
        </View>
      </View>



      <View  style={styles.containerH}>
        <Text style={styles.textH}>Spending per day</Text>
       
         <View  style={styles.containerB}><BarChart
                barWidth={52}
                barBorderRadius={4}
                frontColor="green"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
            /></View>
        
        
        </View>

        <View>
       <View  style={styles.containerH}>
        <Text style={styles.textH}>Propertion Spent per Store</Text>
      </View>
      <View style={styles.containerC}>
        <PieChart data={pieData}/>
      </View>
      <View style={styles.containerL}>
        <FlatList
        data = {dataL}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 20 }}
        renderItem={({item}) => 
        <Text style={styles.textL}>{item.name}: {item.value}%</Text> 
      }
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
                          <Text style={styles.textL}>No Money spent</Text>}
        />
      </View>
      <View >
        <Text style={styles.textH}></Text>
        <Text style={styles.textH}></Text>
      </View>
    </View>
        
        
    <View>


<View  style={styles.containerH}>
  <Text style={styles.textbuffor}>t.</Text>
</View>


     

    </View>
  
    </View>
      
  </ScrollView>  

    
    
    
  );
}

const styles = StyleSheet.create({
  
  containerT: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    height: 'auto',
    margin: 0,
    padding: 0,
  },
  containerH: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 45,
    bottom: 35,
    left: 5,
    margin: 10,
    padding: 0,
    flex: 1,
  },
  container: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 25,
    left: 5,
  },
  textT: {
    color: '#000000',
    fontFamily: 'Cochin',
    fontSize: 40,
    top: 5,
    bottom: 5,
  },
  textH: {
    color: '#003879',
    fontFamily: 'Cochin',
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
  //added

Scroll: {
  height: 'auto',
  flexGrow: 1, paddingBottom:100,
  
},

  Button: {
  backgroundColor: '#ffd8f5',
 alignSelf: 'center',
 verticalAlign: 'middle',
  color: '#ffffff',
  width: 320,
  height: 160,
  top: 60,
    bottom: 35,
},
textLableT: {
    color: '#003879',
    fontFamily: 'Cochin',
    alignSelf: 'center',
    fontSize: 30,
  },
  textLable: {
    color: '#000000',
    fontFamily: 'Cochin',
    fontSize: 30,
  },
  emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        top: 20,
        color: '#999'
    },
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
   bottom: 80,
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

containerB: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 0,
    bottom: 35,
    left: 5,
    margin: 0,
    padding: 0,
  },

  containerBC: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 80,
    bottom: 35,
    left: 5,
    margin: 0,
    padding: 0,
  },

 // componet specific styles
textD: {
    color: '#000000',
    fontFamily: 'Inter',
    fontSize: 20,
    
  },
textbuffor: {
    color: '#fdfdfd',
    fontFamily: 'Inter',
    fontSize: 120,
    
  },
});