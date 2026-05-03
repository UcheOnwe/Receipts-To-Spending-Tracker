import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState, } from 'react';

import api from '@/Services/api'; // Our API service (Handles backend calls)


import { Image } from 'expo-image';
import { FlatList, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { BarChart, PieChart } from "react-native-gifted-charts";


import type { ReceiptDto } from '@/assets/Utilities/receipt';
import { formatUsd } from '@/assets/Utilities/formatReceipt';
import { buildStoreShares,buildDailySpending } from '@/assets/Utilities/spending';

const logo = require('@/assets/images/icon.png');

//pie stuff
const RandColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
};



const dataL = [{id: '1' , name: 'Walmart', value: 15}, {id: '2' , name: 'Target',value: 30}, {id: '3' , name: 'Heb',value: 26}, {id: '4' , name: 'Walgreens',value: 40}];
//bar graph stuff

    //Advice stuff

    const Advice = "\tSpend less at walmart and and put this money into savings or somthing idk";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ReceiptListScreen()
{

  //AI advice function
  const [aiResponse, setAiResponse] = useState("");       //AI response
  
  

  const piePalette = ['#ffd900', '#ff0000', '#00ff0d', '#0044ff', '#7700ff','#ffae00', '#ff00f2', '#00ccff', '#1b0091', '#39007a'];

  const [receipts, setReceipts] = useState<ReceiptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await Promise.race([
        api.getReceipts(),
        new Promise<ReceiptDto[]>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000);
        }),
      ]);
      setReceipts(data);
    } catch (e) {
      setReceipts([]);
      setError(e instanceof Error ? e.message : 'Could not load spending data.');
    } finally {
      setLoading(false);
    }
  }, []);
/* useFocusEffect(
    React.useCallback(() => {
      void load();
    }, [load]),
  ); */

  //call AI with prompt
    const callAiPrompt = useCallback(async() =>{
      try{
        const rec = await Promise.race([
        api.getReceipts(),
        new Promise<ReceiptDto[]>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000);
        }),
      ]);
      setReceipts(rec);
        console.log(rec);
        
        const response = await fetch(`${API_URL}/Ai/advice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ receipts: rec })
        });
  
        const aiSays = await response.json();
        //so that aiSays is a string
        const advice = typeof aiSays === "string"
        ?aiSays:JSON.stringify(aiSays, null , 2);
        setAiResponse(advice);
        return advice;
      }catch(error){
        Alert.alert("Error", "could not reach OpenAI");
        console.error(error);
      }
      return null;
    },
  []);

  useFocusEffect(
    React.useCallback(() => {
      void load();
      void callAiPrompt();
    }, [load, callAiPrompt]),
  );

  const daily = useMemo(() => buildDailySpending(receipts, 7), [receipts]);
  const chartData = useMemo(
    () =>
      daily.map((day) => ({
        value: day.total,
        label: day.isoDate,
        topLabelComponent: () => (
        <Text style={{color: '#26a100', fontSize: 14, marginBottom: 6}}>$ {day.total}</Text>
      ),
        frontColor: '#35e200',
      })),
    [daily],
  );

  /* useFocusEffect(
    React.useCallback(() => {
      void load();
      void callAiPrompt();
    }, [load, callAiPrompt]),
  ); */

  const shares = useMemo(() => buildStoreShares(receipts, 7), [receipts]);
  const pieData = useMemo(
    () =>
      shares.map((row, idx) => ({
        value: row.percentage,
        color: piePalette[idx % piePalette.length],
      })),
    [shares],
  );

  const pieDataList = useMemo(
    () =>
      shares.map((row, idx) => ({
        store: row.store,
        value: row.amount,
        percentage: row.percentage,
        color: piePalette[idx % piePalette.length],
      })),
    [shares],
  );



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
        <Text style={styles.textD}>{"\t\t\t\t\t"}{aiResponse.substring(17).split("\"\n}")[0] || "Loading..."}</Text>
        </View>
      </View>



      <View  style={styles.containerH}>
        <Text style={styles.textH}>Spending per day</Text>
       
         <View  style={styles.containerB}><BarChart
                barWidth={80}
                barBorderRadius={4}
                frontColor="green"
                data={chartData}
                yAxisThickness={0}
                spacing={20}
                xAxisThickness={0}
                yAxisExtraHeight={40}
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
        data = {pieDataList}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 20 }}
        renderItem={({item}) => <View >
          <View style = {{
            backgroundColor: item.color,
    position: 'relative',
    height: 12,
    width: 12,
    right: 0,
          }}></View>
        <Text style={styles.textL}>{item.store}: {item.percentage}%</Text> 
        </View>
        
      }
        
        ListEmptyComponent={
                          <Text style={styles.textL}>No Money spent</Text>}
        />
      </View>
      <View >
        <Text style={styles.textH}> </Text>
        <Text style={styles.textH}> </Text>
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
    alignItems: 'center',
    fontFamily: 'Kameron',
    fontSize: 20,
    top: 0,
    bottom: 0,
  },

containerB: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 0,
    height: 'auto',
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
    marginInlineStart: 6
    
  },
textbuffor: {
    color: '#fdfdfd',
    fontFamily: 'Inter',
    fontSize: 120,
    
  },
});