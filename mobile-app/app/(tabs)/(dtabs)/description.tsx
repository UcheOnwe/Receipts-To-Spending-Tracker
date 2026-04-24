  import { Text,  TouchableOpacity, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const logo = require('@/assets/images/icon.png');



export default function Index() {
  return (
    
    <View style={styles.containerT}>
      <View  style={styles.container}>
        <Image style={styles.tinyLogo} source={logo} />
        <Text style={styles.textT}>Receipt  Tracker</Text>
      </View>
      <View  style={styles.containerH}>
        <Text style={styles.textH}>Spending Advice</Text>
        <Text style={styles.textD}>Spend less at walmart</Text>
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
textD: {
    color: '#000000',
    fontFamily: 'Inter',
    fontSize: 20,
    top: 20,
  },


});