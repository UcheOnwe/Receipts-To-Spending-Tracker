//Imports - Bring in what we need 
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../Services/api'; //Our API Services  

//Every screen = a function 
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
    <View style = {styles.receiptCard}> 
      <Text style = {styles.storeName}> {item.store}</Text>
      <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.itemCount}>{item.items?.length || 0} items</Text>
    </View>
    );
  }

  //UI - What shows on the screen
  return(
    <View style = {styles.container}>
      <Text style = {styles.header}> My Receipts</Text>

      {/* LOADING STATE - Shoe spinner while fetching  */}
      {loading && (
        <ActivityIndicator size="large" color = "#0000ff"/>
      )}

      {/* ERROR STATE - Show error message if failed */}
      {error && (
        <Text style = {styles.errorText}>{error}</Text>
      )}

      {/* SUCCESS STATE - Ifn NOT loading and NOT error Show list of receipts otherwiise show nothing */}
      {!loading && !error && (
        <FlatList
          data = {receipts}
          renderItem={renderReceipt}
          keyExtractor={(item) => item.receiptId.toString()} /*To track rendered receipts whether deleted or new ones
           added and then convert to string*/

           /* if data = [] (empty array) show message rather than blank screen */
          ListEmptyComponent={
            <Text style={styles.emptyText}>No receipts yet</Text>
          }
        />
      )}
    </View>
  );
}

/*
STATE 1: Loading
loading = true, error = null, receipts = []
Shows: Spinner only

STATE 2: Error
loading = false, error = "Failed", receipts = []
Shows: Error message only

STATE 3: Success
loading = false, error = null, receipts = [...]
Shows: FlatList only

Purpose: Users see appropriate feedback at all times No blank screens
*/ 

//Styles - How things look
const styles = StyleSheet.create({
  container: {
    flex: 1, //Take all available space
    padding: 20, //space inside(all sides )
    backgroundColor: '#f5f5f5' //space outside
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10
  },
  receiptCard: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    storeName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    amount: {
        fontSize: 24,
        color: '#2ecc71',
        fontWeight: 'bold',
        marginBottom: 5
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5
    },
    itemCount: {
        fontSize: 12,
        color: '#999'
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#999'
    }
});