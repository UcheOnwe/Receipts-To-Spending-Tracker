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
        <Text style={styles.textH}>Scan Receipt</Text>
        < TouchableOpacity style={styles.Button}>
        <Text style={styles.ButtonText}>Take a Photo</Text>
         <Image style={styles.buttonLogoCam} source={require('@/assets/images/Camera.png')}/>
         </TouchableOpacity>
        <Text style={styles.Or}>Or</Text>
        < TouchableOpacity style={styles.Button}>
        <Text style={styles.ButtonText}>Upload From Gallery</Text>
        <Image style={styles.buttonLogoImg} source={require('@/assets/images/picture.png')}/>
         </TouchableOpacity>
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
Or: {
    color: '#000000',
    fontFamily: 'Cochin',
    fontSize: 30,
    textAlign: 'center',
    top: 35,
    bottom: 35,
  },

  ButtonText: {
    color: '#242424',
    fontFamily: 'Cochin',
    fontSize: 30,
    textAlign: 'center',
    alignSelf: 'center',
    verticalAlign: 'middle',
    bottom: 15,
    width: 200,
  height: 220,
  },
  buttonLogoCam: {
    position: 'absolute',
    width: 48,
    height: 38,
    bottom: 40,
    alignSelf: 'center',
  },
  buttonLogoImg: {
    position: 'absolute',
    width: 47,
    height: 41,
    bottom: 40,
    alignSelf: 'center',
  },

Button: {
  backgroundColor: '#9b9b9b',
 alignSelf: 'center',
 verticalAlign: 'middle',
  color: '#5c5c5c',
  width: 300,
  height: 220,
  top: 35,
    bottom: 35,
}


});