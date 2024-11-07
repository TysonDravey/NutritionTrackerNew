// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NutritionTracker } from './screens/NutritionTracker';
import { FastingTracker } from './screens/FastingTracker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define the theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#f1c40f',
  },
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: '#2196F3',
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Tab.Screen 
              name="Nutrition" 
              component={NutritionTracker}
              options={{
                tabBarLabel: 'Nutrition',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons 
                    name="food-apple" 
                    size={size} 
                    color={color} 
                  />
                ),
                headerTitle: 'Nutrition Tracker',
              }}
            />
            <Tab.Screen 
              name="Fasting" 
              component={FastingTracker}
              options={{
                tabBarLabel: 'Fasting',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons 
                    name="timer" 
                    size={size} 
                    color={color} 
                  />
                ),
                headerTitle: 'Fasting Timer',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

// If you want to use a custom status bar
import { StatusBar } from 'expo-status-bar';

// Add this inside the SafeAreaProvider if you want to customize the status bar
// <StatusBar style="light" backgroundColor="#1976D2" />