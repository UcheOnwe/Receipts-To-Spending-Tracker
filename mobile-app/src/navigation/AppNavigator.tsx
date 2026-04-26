import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BarGraphScreen } from '../screens/BarGraphScreen';
import { DescriptionScreen } from '../screens/DescriptionScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NewUserScreen } from '../screens/NewUserScreen';
import { ReceiptDetailsScreen } from '../screens/ReceiptDetailsScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ViewReceiptScreen } from '../screens/ViewReceiptScreen';
import { WeeklySpendingScreen } from '../screens/WeeklySpendingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FDFEFF',
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FDFEFF' },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="NewUser" component={NewUserScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Description" component={DescriptionScreen} />
        <Stack.Screen name="BarGraph" component={BarGraphScreen} />
        <Stack.Screen name="WeeklySpending" component={WeeklySpendingScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="ViewReceipt" component={ViewReceiptScreen} />
        <Stack.Screen name="ReceiptDetails" component={ReceiptDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
