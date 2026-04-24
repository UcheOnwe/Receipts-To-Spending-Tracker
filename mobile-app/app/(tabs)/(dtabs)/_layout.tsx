import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Feather from '@expo/vector-icons/Feather';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 70 },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="bar"
        options={{
          title: 'Bar Graph',
          tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pie"
        options={{
          title: 'weekly spending',
          tabBarIcon: ({ color }) => <Feather name='pie-chart' size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="description"
        options={{
          title: 'Description',
          tabBarIcon: ({ color }) => <Feather name='align-center' size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
