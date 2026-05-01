
// IMPORTS

import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../Services/api';


// RECEIPT DETAILS SCREEN

export default function ReceiptDetailScreen()
{
    
    // GET THE RECEIPT ID FROM URL
    
    // If URL is /receipt/5, then params.id = "5"
    const params = useLocalSearchParams();
    const receiptId = params.id;  // The ID from the URL
    
    // Navigation
    const router = useRouter();

    
    // STATE - Data and loading states
    
    const [receipt, setReceipt] = useState(null);  // Will hold the full receipt object
    const [loading, setLoading] = useState(true);  // Are we fetching data?
    const [error, setError] = useState(null);      // Any errors?

    // ============================================
    // LOAD RECEIPT DATA - Runs when screen opens
    // ============================================
    useEffect(function() {
        loadReceiptDetails();
    }, []);  // Empty array = run once when screen loads

    // ============================================
    // FUNCTION: Fetch receipt from backend
    // ============================================
    async function loadReceiptDetails()
    {
        try
        {
            setLoading(true);
            
            // Call OUR api.getReceiptById function
            // This calls: GET /api/receipt/{id}
            const data = await api.getReceiptById(receiptId);
            
            // Store the full receipt in state
            setReceipt(data);
            
            setError(null);
        }
        catch (err)
        {
            if (err instanceof Error)
            {
                setError('Failed to load receipt: ' + err.message);
            }
            else
            {
                setError('Failed to load receipt');
            }
            console.log('Error loading receipt:', err);
        }
        finally
        {
            setLoading(false);
        }
    }

    // ============================================
    // FUNCTION: Delete receipt
    // ============================================
    function handleDelete()
    {
        // Show confirmation dialog first
        Alert.alert(
            'Delete Receipt',
            'Are you sure you want to delete this receipt?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete
                }
            ]
        );
    }

    async function confirmDelete()
    {
        try
        {
            // Call OUR api.deleteReceipt function
            // This calls: DELETE /api/receipt/{id}
            await api.deleteReceipt(receiptId);
            
            // Show success message
            Alert.alert('Success', 'Receipt deleted');
            
            // Go back to receipt list
            router.back();
        }
        catch (err)
        {
            if (err instanceof Error)
            {
                Alert.alert('Error', 'Failed to delete: ' + err.message);
            }
            else
            {
                Alert.alert('Error', 'Failed to delete receipt');
            }
        }
    }

    // ============================================
    // FUNCTION: Render list of items
    // ============================================
    function renderItems()
    {
        // If no items, show message
        if (!receipt.items || receipt.items.length === 0)
        {
            return <Text style={styles.noItems}>No items</Text>;
        }

        // Create array to hold JSX for each item
        const itemElements = [];
        
        // Loop through all items
        for (let i = 0; i < receipt.items.length; i++)
        {
            const item = receipt.items[i];
            const itemTotal = item.price * item.quantity;
            
            // Create JSX for this item
            const itemElement = (
                <View key={i} style={styles.itemCard}>
                    <View style={styles.itemLeft}>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        <Text style={styles.itemDetails}>
                            ${item.price.toFixed(2)} × {item.quantity}
                        </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                        ${itemTotal.toFixed(2)}
                    </Text>
                </View>
            );
            
            // Add to array
            itemElements.push(itemElement);
        }
        
        return itemElements;
    }

    // ============================================
    // UI - LOADING STATE
    // ============================================
    if (loading)
    {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading receipt...</Text>
            </View>
        );
    }

    // ============================================
    // UI - ERROR STATE
    // ============================================
    if (error)
    {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Go Back" onPress={function() { router.back(); }} />
            </View>
        );
    }

    // ============================================
    // UI - SUCCESS STATE (Show Receipt)
    // ============================================
    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.storeName}>{receipt.store}</Text>
                <Text style={styles.date}>
                    {new Date(receipt.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </Text>
            </View>

            {/* Total Section */}
            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>
                    ${receipt.amount ? receipt.amount.toFixed(2) : '0.00'}
                </Text>
            </View>

            {/* Items Section */}
            <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Items</Text>
                {renderItems()}
            </View>

            {/* Delete Button */}
            <View style={styles.deleteSection}>
                <Button 
                    title="Delete Receipt" 
                    onPress={handleDelete}
                    color="#ff4444"
                />
            </View>
        </ScrollView>
    );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10
    },
    storeName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5
    },
    date: {
        fontSize: 16,
        color: '#666'
    },
    totalSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    totalLabel: {
        fontSize: 18,
        color: '#666'
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    itemsSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    itemLeft: {
        flex: 1
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 3
    },
    itemDetails: {
        fontSize: 14,
        color: '#666'
    },
    itemTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    noItems: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        marginTop: 20
    },
    deleteSection: {
        padding: 20,
        marginBottom: 40
    }
});