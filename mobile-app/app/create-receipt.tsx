import {Text, View, StyleSheet } from 'react-native';

export default function CreateReceiptScreen(){
    return(
        <View style = {styles.container}>
            <Text style = {styles.title}>Hello from Create receipt screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});