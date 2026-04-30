import {Text, View, StyleSheet, Button, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import api from '../Services/api'; // Our API service (Handles backend calls)
import {useRouter} from 'expo-router'; //for navigation
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';




export default function CreateReceiptScreen(){

    //----------------------------------------------------
    //STATE - Variables that cause UI to update when changed
    //------------------------------------------------------


    //Basic Receipt info
    const [store, setStore] = useState('');    //store name
    const [date, setDate] = useState(new Date());     // Purchase date

    //Current Item being added (temporary storage)
    const[itemName, setItemName] = useState('');
    const[itemPrice, setItemPrice] = useState(''); //Item price is string because user types it
    const[itemQuantity, setItemQuantity] = useState('1'); //Defualt = 1
    const[itemCategory, setItemCategory] = useState('Food & Dining'); //default category

    type Item = {
            itemName: string;
            price: number;
            quantity: number;
            category: string;
        };

    const [showPicker, setShowPicker] = useState(false);

    //List of all items added to this receipt
    const [items, setItems] = useState<Item[]>([]);

    //Is the form currently submitting to backend?
    const [loading, setLoading] = useState(false);

    // For navigation between screens
    const router = useRouter();


    //Function: Add item to the items list
    //similar to: C# List.Add() but with React state
    function handleAddItem(){
        // Step 1: Validate - make sure all fields have data
        if (itemName === " ")
        {
            Alert.alert('Error', 'Please enter the item name');
            return;
        }

        if (itemPrice === " "){
            Alert.alert('Error', 'Please enter item price');
            return;
        }

        if (itemQuantity === " "){
            Alert.alert('Error', 'Please enter item quantity');
            return;
        }

        //Step 2: Convert strings to numbers
        //User types "3.99" (string), Backend needs 3.99 (int)
        const priceAsNumber = parseFloat(itemPrice) || 0;
        const quantityAsNumber = parseInt(itemQuantity) || 1;

        
        
        //Step 3: Create new item object
        const newItem: Item = {
            itemName: itemName,
            price: priceAsNumber,
            quantity: quantityAsNumber,
            category: itemCategory
        };

        //Step 4: Add to items array
        //Note: In React, we must create a New array, not modify existing
        //c# POV This is like: List<Item> newList = new List<Item>(oldList); newList.Add(newItem);
        const newItemsList: Item[] = [];

        // Copy all existing items to new array
        for (let i = 0; i < items.length; i++){
            newItemsList.push(items[i]);
        }

        // Add the new item to the end 
        newItemsList.push(newItem);

        

        // Update state with the new array
        setItems(newItemsList);

        //STEP 5: Clear the input fields so user can add another item
        setItemName('');
        setItemPrice('');
        setItemQuantity('1');
        setItemCategory('Food & Dining');
    }

    //-------------------------------------------------------------
    // Function: Remove item from list
    // Similar to: C# List.RemoveAt(index)
    function handleRemoveItem(indexToRemove: number){
        // Create a new array WITHOUT the item at indexToRemove
        const newItemsList = [];

        //Loop through all items
        for(let i = 0; i < items.length; i++){

            //If this is not the item to remove, add it to new list
            if (i !== indexToRemove){
                newItemsList.push(items[i]);
            }
            //if this is the item to remove, skip it (dont add to new list)
        }

        // Update state with new array (missing the removed item)
        setItems(newItemsList);
    }

    function calculateTotal(){
        let total = 0;

        // Loop through all items
        for(let i = 0; i < items.length; i++){
            const currentItem = items[i];
            const itemTotal = currentItem.price * currentItem.quantity;
            total = total + itemTotal;
        }

        // Convert to string with 2 decimal places: 10.5 becomes "10.50"
        const totalAsString = total.toFixed(2);
        return totalAsString;
    }

    async function handleSubmit(){
        //Step 1: Validate form data
        if(store === ''){
        Alert.alert('Error', 'Please enter store name');
        return;
        }
    

        if(date == ''){
            Alert.alert('Error', 'Please enter date');
            return;
        }

        if (items.length === 0 ){
            Alert.alert('Error', 'Please add at least one item');
            return;
        }

        // STEP 2: Try to submit to backend
        try{
            // Show loading state (disables button, shows "Creating...")
            setLoading(true);

            // Build the data object to send to backend
            //This matches the CreateReceiptDto Structure 
            const receiptData = {
                store: store,
                date: new Date(date).toISOString(),
                items: items
            };

            console.log("SENDING TO BACKEND: ", JSON.stringify(receiptData, null, 2));
            // Call your backend API
            // This calls: POST /api/receipt
            const result = await api.createReceipt(receiptData);

            // if we got here, it worked!
            Alert.alert('Success', 'Receipt created successfully!');

            //Go back to the list screens
            router.back();
        }
        catch (error){
            // Something failed - network error, backend error, etc.
            if (error instanceof Error){
                Alert.alert('Error', 'Failed to create receipt: ' + error.message);
            }
            else{
                Alert.alert('Error', 'Failed to create receipt');
            }
        }
        finally
        {
            // Always hide loading state (whether success or error)
            setLoading(false);
        }
    }


    //Function: Render list of added items
    //returns JSX to display all items
    function renderItemsList(){
        //If no items added yet, don't show anything
        if (items.length === 0){
            return null;
        }

        //Create array to hold JSX for each item
        const itemElements = [];

        // Loop through all items and create JSX for each
        for (let i = 0; i < items.length; i++){
            const currentItem = items[i];
            const itemTotal = currentItem.price * currentItem.quantity;
            const itemTotalFormatted = itemTotal.toFixed(2);
            const priceFormatted = currentItem.price.toFixed(2);

            // Create JSX FOR THIS Item
            const itemElement = (
                <View key = {i} style = {styles.itemCard}>
                    <View style = {styles.itemInfo}>
                        <Text style={styles.itemName}>{currentItem.itemName}</Text>
                        <Text style={styles.itemDetails}>
                            ${priceFormatted} * {currentItem.quantity} = ${itemTotalFormatted}
                        </Text>
                        <Text style={styles.itemCategory}>{currentItem.category}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={function() { handleRemoveItem(i); }}
                    >
                        <Text style={styles.removeButtonText}>Remove</Text>
                        

                    </TouchableOpacity>
                </View>
            );

            //Add this item's JSX to the array
            itemElements.push(itemElement);
    
        }

        //Return the entire section with all items
        return(
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items ({items.length})</Text>
                {itemElements}
                <Text style={styles.total}>Total: ${calculateTotal()}</Text>
            </View>
        );
    }

    //------------------------------------------------
    //USER INTERFACE
    //------------------------------------------------

    return(
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Create Receipt</Text>

            {/*Section 1: Store & Date Information */}
            <View style = {styles.label}>
                <Text style = {styles.label}>Store Name</Text>
                <TextInput
                    style = {styles.input}
                    value = {store}
                    onChangeText = {setStore}
                    placeholder = "e.g., Walmart"
                />

                <Text style = {styles.label}>Date</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowPicker(true)}
                >
                    <Text>
                        {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowPicker(false);
                            if (selectedDate) {
                                setDate(selectedDate);
                            }
                            }}
                        />
                    )}
            </View>

            {/* SECTION 2: ADD Items form*/}
            <View style = {styles.sectionTitle}>
                <Text style={styles.sectionTitle}>Add Items</Text>

                <TextInput
                    style = {styles.input}
                    value = {itemName}
                    onChangeText={setItemName}
                    placeholder= "e.g., Milk"
                />

                <Text style = {styles.label}>Price</Text>
                <TextInput
                    style = {styles.input}
                    value = {itemPrice}
                    onChangeText={setItemPrice}
                    placeholder="3.99"
                    keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Quantity</Text>
                <TextInput
                    style={styles.input}
                    value={itemQuantity}
                    onChangeText={setItemQuantity}
                    placeholder="1"
                    keyboardType="number-pad"
                />

                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.picker}
                        selectedValue={itemCategory}
                        onValueChange={(value) => setItemCategory(value)}
                    >
                        <Picker.Item label="Food & Dining" value="Food & Dining" />
                        <Picker.Item label="Groceries" value="Groceries" />
                        <Picker.Item label="Entertainment" value="Entertainment" />
                        <Picker.Item label="Shopping" value="Shopping" />
                        <Picker.Item label="Transportation" value="Transportation" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                </View>

                <Button title="Add Item" onPress={handleAddItem} />
            </View>

            {/* SECTION 3: Display Added Items (if any exitst)*/}
            {renderItemsList()}

            {/* SECTION 4: Submit Button */}
            <View style={styles.section}>
                <Button
                    title={loading ? "Creating..." : "Create Receipt"}
                    onPress={handleSubmit}
                    disabled={loading}
                />
            </View>

        </ScrollView>
    );

}



// ============================================
// STYLES - How everything looks
// ============================================
const styles = StyleSheet.create({

    pickerContainer: {
        backgroundColor: '#29d582',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },

    picker: {
        color: '#ffffff',
    },
    
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 40
    },
    section: {
        marginBottom: 25
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 10,
        color: '#333'
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemInfo: {
        flex: 1
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3
    },
    itemCategory: {
        fontSize: 12,
        color: '#999'
    },
    removeButton: {
        backgroundColor: '#ff4444',
        padding: 8,
        borderRadius: 5
    },
    removeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    },
    total: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 10,
        color: '#2ecc71'
    }
});