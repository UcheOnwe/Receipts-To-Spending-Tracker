import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
//to put a button in react antive
//import React from 'react';
import { Button, View, Alert } from 'react-native';

//url api
import Constants from "expo-constants";

//test
const config = Constants.expoConfig ?? Constants.manifest;

//? for if when Expo loads config differently
const API_URL =  Constants.expoConfig?.extra?.apiUrl ??
  Constants.manifest?.extra?.apiUrl;
//console.log("API URL:", API_URL);
console.log("Config extra:", config?.extra);
console.log("API URL from config:", config?.extra?.apiUrl);

export default function TabTwoScreen() {
   // call test function here 
  const callTest = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai/test`);
      const text = await response.text();
      Alert.alert("Backend Response", text);
    } catch (error) {
      Alert.alert("Error", "Could not reach backend");
      console.error(error);
    }
  };
    return (
    //copied from the explore page
    <ParallaxScrollView
          headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
          headerImage={
            <IconSymbol
              size={310}
              color="#808080"
              name="chevron.left.forwardslash.chevron.right"
              style={styles.headerImage}
            />
          }>
          <ThemedView style={styles.titleContainer}>
                  <ThemedText
                    type="title"
                    style={{
                      fontFamily: Fonts.rounded,
                    }}>
                    AI Screen
                  </ThemedText>
            </ThemedView>  
       {/* //putting a button */}
    <View style={styles.container}> 
        <Button
        title="Call backend"
        onPress={callTest}
        color="#841584"
        />
    </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});