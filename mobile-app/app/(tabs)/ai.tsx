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

export default function TabTwoScreen() {
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
        title="Click Me"
        onPress={() => Alert.alert('Button Pressed!')}
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