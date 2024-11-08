import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NutritionTracker } from './screens/NutritionTracker';
import { FastingTracker } from './screens/FastingTracker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

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

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Artificially delay for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide splash screen once app is ready
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

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
        <StatusBar style="light" backgroundColor="#1976D2" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}