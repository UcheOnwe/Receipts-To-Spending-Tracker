//Imports - Bring in what we need
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import api from '../../Services/api'; //Our API Services  
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

//Runs code every time this screen becomes active (Used to refresh data when coming back)
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react'; // Prevents unnecessary re-runs (required for useFocusEffect to work properly)

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
  const [query, setQuery] = useState('');

 //Tool provided by Expo to move between screens (like changing pages)
  const router = useRouter();

   

  useFocusEffect(
    useCallback(() => {
      // loadReceipts runs everytime screen is opened or returned to
      loadReceipts();
    }, [])
  );




  //for loading
  /*useEffect(()=>{
    loadReceipts();
  },[]) //Empty array = run once screen loads */
  //[] - run only once


//test to see network address
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
console.log('public expo',BASE_URL);

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
        setError('failed to load receipts' + err.message);
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
    const dateText = new Date(item.date).toLocaleDateString('en-CA');
    return(
    <Pressable
      style = {styles.receiptCard}
      onPress={() =>
        router.push({
          pathname: '/receipt-details',
          params: {
            receiptId: item.receiptId.toString(),
            store: item.store,
            date: item.date,
            amount: item.amount.toString(),
          },
        })
      }>
      <Text style = {styles.storeName}>{item.store}</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Date:</Text>
        <Text style={styles.rowValue}>{dateText}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Total Amount:</Text>
        <Text style={styles.amount}>{Math.round(item.amount)} USD</Text>
      </View>
    </Pressable>
    );
  }

  const filteredReceipts = receipts.filter((receipt: Receipt) =>
    receipt.store.toLowerCase().includes(query.trim().toLowerCase())
  );

  //UI - What shows on the screen
  return(
    <View style = {styles.container}>
      <View style={styles.brandRow}>
        <Text style={styles.brandTitle}>Receipt Tracker</Text>
        <Image
          style={styles.logo}
          source={require('@/assets/images/icon.png')}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.header}>My Receipts</Text>

      <View style={styles.searchWrap}>
        <View style={styles.searchIconBtn}>
          <Ionicons name="menu-outline" size={22} color="#49454F" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#6B7280"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <View style={styles.searchIconEnd} pointerEvents="none">
          <Ionicons name="search-outline" size={22} color="#49454F" />
        </View>
      </View>

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
          data = {filteredReceipts}
          renderItem={renderReceipt}
          keyExtractor={(item) => item.receiptId.toString()} /*To track rendered receipts whether deleted or new ones
           added and then convert to string*/

           /* if data = [] (empty array) show message rather than blank screen */
          ListEmptyComponent={
            <Text style={styles.emptyText}>No receipts yet</Text>
          }
        />
      )}


      {/* Button - Navigate to Create Receipt Screen*/}
      <Text
        style = {styles.addReceipt}
        onPress={() => router.push('/create-receipt')}
      >
        + Add Receipt
      </Text>
      
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
    flex: 1,
    alignSelf: 'stretch',
    paddingTop: 46,
    paddingBottom: 40,
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#FDFEFF',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 69,
    paddingTop: 0,
  },
  brandTitle: {
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
    color: '#000000',
    fontFamily: 'Kameron_700Bold',
    flex: 1,
    paddingRight: 8,
    alignSelf: 'center',
  },
  logo: {
    width: 67,
    height: 67,
  },
  header: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 24,
    marginTop: 12,
    color: '#173372',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  searchWrap: {
    width: '100%',
    maxWidth: 328,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE6F0',
    borderRadius: 28,
    paddingLeft: 14,
    paddingRight: 16,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#111827',
    padding: 0,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
  },
  searchIconBtn: {
    paddingVertical: 8,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconEnd: {
    paddingVertical: 8,
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptCard: {
    width: '100%',
    maxWidth: 343,
    minHeight: 123,
    backgroundColor: '#F4EAEA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 24,
  },
  storeName: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: '#173372',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rowLabel: {
    fontSize: 20,
    lineHeight: 28,
    color: '#111827',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  rowValue: {
    fontSize: 20,
    lineHeight: 28,
    color: '#111827',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  amount: {
    fontSize: 24,
    lineHeight: 32,
    color: '#16A34A',
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
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
        color: '#6B7280'
    ,
    fontFamily: 'Inter_400Regular',
    },
    addReceipt: {
      color: 'pink',
      marginTop: 15,
      textAlign: 'center',
      marginBottom: 10,
    }
});