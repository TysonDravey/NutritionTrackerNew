import { Tabs } from 'expo-router';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#f1c40f',
  },
};

export default function AppLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <Tabs
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
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Nutrition',
            tabBarLabel: 'Nutrition',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons 
                name="food-apple" 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="fasting"
          options={{
            title: 'Fasting',
            tabBarLabel: 'Fasting',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons 
                name="timer" 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}