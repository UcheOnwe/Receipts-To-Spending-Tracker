/**
 * api.js - BACKEND CONNECTION
 * 
 * This file is the BRIDGE between React Native and the C# backend.
 * Every function here calls one of the endpoints.
 */

//STEP1: Configuration for Network/Server to work on mobile not just localhost(Computer)
const BASE_URL = 'https://172.20.10.3:5001/api';

//STEP2: API Functions - One for each backend endpoint

//Function 1: Get all receipts. Sends get request to the backend to backend
//C# Backend receives it: ReceiptController.GetAll()
//Backend returns Json and fetvh() receives the response 

async function getReceipts()
{
    try
    {
        //Step 1: Make htt[p request to backend
        const response = await fetch(BASE_URL + '/receipt');

        //Step 2: Check if request was successful
        if( !response.ok)
        {
            throw new Error('Failed to get receipts');
        }

        //Step 3: Parse JSON response from backend
        const data = await response.json();

        return data;
    }
    catch (error)
    {
        //Handle errors
        console.log('Error in getReceipts:', error);
        throw error;
        
    }
}
 
/**
 * CREATE RECEIPT - POST /api/receipt
 * 
 * ALGORITHM:
 * 1. Receive receipt data from screen(app)
 * 2. Make POST request to  backend
 * 3. Return the created receipt (with new ID)
 * 
 * CONNECTS TO: ReceiptController.Create()
 */

async function createReceipt(receiptData)
{
    try
    {
        // Step 1: Make HTTP POST request to backend
        const response = await fetch(BASE_URL + 'receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' //Tell Backend: I'm sending a JSON data
            },
            body: JSON.stringify(receiptData) //body: the DATA being sent, 
                                            //JSON.stringify: Convert js object to string that can be sent over HTTP
        }); 

        // STEP 2: Check if request was successful
        if (!response.ok)
        {
            throw new Error('failed to create receipt');
        }

        //STEP 3: Parse JSON response from backend
        const data = await response.json();
        
        //Return the creted receipt (with new ID!)
        return data;
    }
    catch (error){
        //Step 5: handle errors
        console.log('Error in createReceipt: ', error);
        throw error;
    }
    
} 

//Function 3: Get Receipt by ID
//Connects to ReceiptController.GetById(id)
async function getReceiptById()
{
    
    try
    {
        //Step 1: Build URL with ID parameter
        const url =  `${BASE_URL}/receipt/${id}`;

        //Step 2: Make HTTP GET request
        const response = await fetch(url);

        if(!response.ok){
            throw new error('Receipt not found');
        }

        //ste 3: Parse JSON response
        const data = await response.json();

        //return the receipt
        return data;
    }
    catch (error){
        console.log('Error in getReceiptById: ', error);
        throw error;
    }
}

async function deleteReceipt(){
    try
    {
        //step 1: Build URL WITH ID NUMBER
        const url = `${BASE_URL}/receipt/${id}`

        //Step 2: Make a HTTP DELETE request
        const response = await fetch(url, {
            method : 'DELETE'
        });

        if(!response.ok){
            throw new error('Failed to delete receipt');
        }
        
        //parse JSON response
        const data = await response.json();

        //return comfirmstion message
        return data;

    }
    catch(error){
        comsole.log(`Error in deleteReceipt:`, error);

    }
}

export default{
    getReceipts,
    getReceiptById,
    createReceipt,
    deleteReceipt
};