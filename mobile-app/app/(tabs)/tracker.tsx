import { Text, View, StyleSheet,TouchableOpacity,FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import api from '../../Services/api'; //Our API Services  
const logo = require('@/assets/images/icon.png');

//test testData




export default function ReceiptListScreen()
{
  //-------------------------------------------------------------
  //STATE - Variables that trigger UI updates

  //receipts - stores collection of receipts from backend

  //setReceipts - function to update receipts (triggers UI refresh)
  //-------------------------------------------------------------
  const [receipts, setReceipts] = useState([]); // [] - Start with an empty list

  // loading - true while fetching data. false when done
  const [loading, setLoading] = useState(true); //To manage UI while asynchronous data is being fetched
 
  // error - stores error message if something fails
  const[error, setError] = useState<string | null>(null); //Union Type: string or null





  //for loading
  useEffect(()=>{
    loadReceipts();
  },[]) //Empty array = run once screen loads 
  //[] - run only once




 //API calls are asyncronous. They take time. use with await
  async function loadReceipts(){
    try{
      setLoading(true); //Show loading spinner
      
      //call api.js service 
      const data = await api.getReceipts();

      //Update state with receipts from backend
      setReceipts(data);

      setError(null); //Clear any previous errors

    }
    catch(err){
      // if error, store error message
      if( err instanceof Error){ /*Trust that err.message is a real error object because Typescript 
        doesnt know what type err is in the catch block*/
        setError('failed to lead receipts' + err.message);
      }
      else {
        setError('failed to load receipts')
      }
      
      console.log('Error loading receipts: ', err);
    }
    finally{
      //Always hide loading spinner
      setLoading(false);
    }
  }
  


  
  //Create a type: Receipt
  //Defined to match backend ReceiptResponseDto
  type Receipt = {
    receiptId: number;
    store: string;
    amount: number;
    date: string;
    items: any[];
  }

//RENDER EACH RECEIPT CALLED FOR EACH ITEM
  //This function receives an object with an item  property, and that item is of type Receipt
  function renderReceipt({ item }: {item: Receipt}){ //{item} means take the item property from an object
    //item = One receipt from the array
    return(
    <TouchableOpacity style = {styles.Button}>
          <Text style = {styles.textLableT}>
            {item.store}
          </Text>
          <Text style = {styles.textLable}>
            Date:     {item.date.split('T00:00:00')}
          </Text>
          <Text style = {styles.textLable}>
            Amount:     {item.amount}$
          </Text>
        </TouchableOpacity>
    );
  }


  return (
    
    <View style={styles.containerT}>
      <View  style={styles.container}>
        <Image style={styles.tinyLogo} source={logo} />
        <Text style={styles.textT}>Receipt  Tracker</Text>
      </View>
      <View  style={styles.containerH}>
        <Text style={styles.textH}>My Receipts</Text>
      </View>

    <View>

    </View>
      <FlatList  data = {receipts}
                renderItem={renderReceipt}
                contentContainerStyle={{ gap: 20 }}
                keyExtractor={(item) => item.receiptId.toString()} /*To track rendered receipts whether deleted or new ones
                 added and then convert to string*/
      
                 /* if data = [] (empty array) show message rather than blank screen */
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No receipts yet</Text>
                }/>

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
    }
});