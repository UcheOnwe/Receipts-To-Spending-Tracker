import { Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const logo = require('@/assets/images/icon.png');



export default function Index() {
  return (
    <View style={styles.containerT}>
      <View style={styles.container}>
        <Text style={styles.textT}>Receipt Tracker</Text>
        <Image style={styles.tinyLogo} source={logo} />
      </View>
      <View style={styles.containerH}>
        <Text style={styles.textH}>Spending Advice</Text>
        <Text style={styles.textD}>Spend less at walmart</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  
  containerT: {
    backgroundColor: '#FDFEFF',
    flex: 1,
    width: '100%',
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: 32,
    paddingBottom: 12,
  },
  containerH: {
    marginTop: 12,
    marginBottom: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 69,
  },
  textT: {
    color: '#000000',
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '700',
    flex: 1,
    fontFamily: 'Kameron_700Bold',
    alignSelf: 'center',
  },
  textH: {
    color: '#173372',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  tinyLogo: {
    width: 67,
    height: 67,
  },

// component specific styles
textD: {
    marginTop: 18,
    color: '#000000',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
  },


});