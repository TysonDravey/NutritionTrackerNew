// screens/NutritionTracker.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph, FAB, Portal, Dialog, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

export const NutritionTracker = () => {
  const [meals, setMeals] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [dailyProtein, setDailyProtein] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [currentMeal, setCurrentMeal] = useState('');
  
  const PROTEIN_GOAL = 210 * 0.8; // Your target weight * 0.8

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const storedMeals = await AsyncStorage.getItem('meals');
      if (storedMeals) {
        const parsedMeals = JSON.parse(storedMeals);
        setMeals(parsedMeals);
        updateDailyProtein(parsedMeals);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const startVoiceInput = async () => {
    setIsListening(true);
    try {
      await Speech.speak('What did you eat?', {
        onDone: () => {
          // Simulate voice input for now
          setTimeout(() => {
            handleVoiceInput('16oz ribeye steak');
          }, 2000);
        }
      });
    } catch (error) {
      console.error('Error with voice input:', error);
    } finally {
      setIsListening(false);
    }
  };

  const handleVoiceInput = (input) => {
    setCurrentMeal(input);
    setShowDialog(true);
  };

  const addMeal = async () => {
    const nutritionInfo = calculateNutrition(currentMeal);
    const newMeal = {
      description: currentMeal,
      ...nutritionInfo,
      timestamp: new Date().toISOString()
    };

    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
    updateDailyProtein(updatedMeals);
    setShowDialog(false);
    setCurrentMeal('');
  };

  const calculateNutrition = (description) => {
    // Mock nutrition calculation - in production, you'd call an API
    return {
      protein: 50,
      calories: 500,
      fat: 30,
      carbs: 0
    };
  };

  const updateDailyProtein = (currentMeals) => {
    const today = new Date().toDateString();
    const todaysMeals = currentMeals.filter(meal => 
      new Date(meal.timestamp).toDateString() === today
    );
    const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);
    setDailyProtein(totalProtein);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Daily Protein Progress</Title>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((dailyProtein / PROTEIN_GOAL) * 100, 100)}%` }
              ]} 
            />
          </View>
          <Paragraph>{dailyProtein}g / {PROTEIN_GOAL}g</Paragraph>
        </Card.Content>
      </Card>

      <ScrollView style={styles.mealsList}>
        {meals.map((meal, index) => (
          <Card key={index} style={styles.mealCard}>
            <Card.Content>
              <Title>{meal.description}</Title>
              <Paragraph>Protein: {meal.protein}g</Paragraph>
              <Paragraph>Calories: {meal.calories}</Paragraph>
              <Paragraph>Time: {new Date(meal.timestamp).toLocaleTimeString()}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Confirm Meal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={currentMeal}
              onChangeText={setCurrentMeal}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button onPress={addMeal}>Add Meal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        style={styles.fab}
        icon={isListening ? "microphone-off" : "microphone"}
        onPress={startVoiceInput}
        loading={isListening}
      />
    </View>
  );
};