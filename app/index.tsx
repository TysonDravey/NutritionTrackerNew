import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, FAB, Portal, Dialog, TextInput, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { styles } from '../components/styles';

interface Meal {
  id: string;
  description: string;
  protein: number;
  calories: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  timestamp: string;
}

interface DayRecord {
  id: string;
  date: string;
  totalProtein: number;
  totalNetCarbs: number;
  totalCalories: number;
  meals: Meal[];
  isExpanded?: boolean;
}

export default function Index() {
  // States
  const [currentMeals, setCurrentMeals] = useState<Meal[]>([]);
  const [pastDays, setPastDays] = useState<DayRecord[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [dailyProtein, setDailyProtein] = useState(0);
  const [dailyNetCarbs, setDailyNetCarbs] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [currentMeal, setCurrentMeal] = useState('');
  const [showManualInputDialog, setShowManualInputDialog] = useState(false);
  const [manualInputCallback, setManualInputCallback] = useState<((values: any) => void) | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  
  // Manual input states
  const [manualProtein, setManualProtein] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualSugar, setManualSugar] = useState('');

  const [editingDay, setEditingDay] = useState<DayRecord | null>(null);
  const [showDayEditDialog, setShowDayEditDialog] = useState(false);
  
  // Constants
  const PROTEIN_GOAL = 210 * 0.8;
  const CARBS_GOAL = 20;

  // Initial load effect
  useEffect(() => {
    loadMeals();
  }, []);

  // Day change check effect
  useEffect(() => {
    const checkDayChange = async () => {
      const now = new Date();
      const lastChecked = await AsyncStorage.getItem('lastChecked');
      
      if (lastChecked) {
        const lastDate = new Date(lastChecked);
        if (lastDate.toDateString() !== now.toDateString() && currentMeals.length > 0) {
          await archiveCurrentDay();
        }
      }
      
      await AsyncStorage.setItem('lastChecked', now.toISOString());
    };

    checkDayChange();
    const interval = setInterval(checkDayChange, 60000);
    return () => clearInterval(interval);
  }, [currentMeals]);


  //part2
  // Core functions
  const loadMeals = async () => {
    try {
      const storedCurrentMeals = await AsyncStorage.getItem('currentMeals');
      const storedPastDays = await AsyncStorage.getItem('pastDays');

      if (storedCurrentMeals) {
        const parsedMeals = JSON.parse(storedCurrentMeals);
        setCurrentMeals(parsedMeals);
        updateDailyTotals(parsedMeals);
      }

      if (storedPastDays) {
        setPastDays(JSON.parse(storedPastDays));
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const archiveCurrentDay = async () => {
    if (currentMeals.length === 0) return;

    const dayTotal = currentMeals.reduce((acc, meal) => ({
      protein: acc.protein + meal.protein,
      netCarbs: acc.netCarbs + (meal.carbs - meal.fiber),
      calories: acc.calories + meal.calories
    }), { protein: 0, netCarbs: 0, calories: 0 });

    const newDayRecord: DayRecord = {
      id: Date.now().toString(),
      date: new Date(currentMeals[0].timestamp).toDateString(),
      totalProtein: dayTotal.protein,
      totalNetCarbs: dayTotal.netCarbs,
      totalCalories: dayTotal.calories,
      meals: currentMeals,
      isExpanded: false
    };

    const updatedPastDays = [newDayRecord, ...pastDays];
    setPastDays(updatedPastDays);
    setCurrentMeals([]);

    await AsyncStorage.setItem('pastDays', JSON.stringify(updatedPastDays));
    await AsyncStorage.setItem('currentMeals', JSON.stringify([]));
    updateDailyTotals([]);
  };

  const calculateNutrition = async (description: string) => {
    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': 'd907b269',
          'x-app-key': '9f03308c34d83bed429d93a162c59fc3',
        },
        body: JSON.stringify({
          query: description,
        }),
      });

      if (!response.ok) {
        throw new Error('Nutrition API request failed');
      }

      const data = await response.json();
      const totalNutrients = data.foods.reduce((acc, food) => ({
        protein: acc.protein + food.nf_protein,
        calories: acc.calories + food.nf_calories,
        fat: acc.fat + food.nf_total_fat,
        carbs: acc.carbs + food.nf_total_carbohydrate,
        fiber: acc.fiber + (food.nf_dietary_fiber || 0),
        sugar: acc.sugar + (food.nf_sugars || 0),
      }), {
        protein: 0,
        calories: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
      });

      return {
        ...totalNutrients,
        protein: Math.round(totalNutrients.protein),
        calories: Math.round(totalNutrients.calories),
        fat: Math.round(totalNutrients.fat),
        carbs: Math.round(totalNutrients.carbs),
        fiber: Math.round(totalNutrients.fiber),
        sugar: Math.round(totalNutrients.sugar),
      };
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      return promptUserForNutrition(description);
    }
  };

  const promptUserForNutrition = (description: string): Promise<any> => {
    return new Promise((resolve) => {
      setShowManualInputDialog(true);
      setManualInputCallback((values) => {
        resolve(values);
        setShowManualInputDialog(false);
      });
    });
  };

  const startVoiceInput = async () => {
    setIsListening(true);
    try {
      await Speech.speak('What did you eat?', {
        onDone: () => {
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

  const handleVoiceInput = (input: string) => {
    setCurrentMeal(input);
    setShowDialog(true);
  };

  //part3
  // Meal Management Functions
  const addMeal = async () => {
    const nutritionInfo = await calculateNutrition(currentMeal);
    const newMeal: Meal = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      description: currentMeal,
      ...nutritionInfo,
      timestamp: new Date().toISOString()
    };

    const updatedMeals = [...currentMeals, newMeal];
    setCurrentMeals(updatedMeals);
    await AsyncStorage.setItem('currentMeals', JSON.stringify(updatedMeals));
    updateDailyTotals(updatedMeals);
    setShowDialog(false);
    setCurrentMeal('');
  };

  const toggleDayExpand = async (dayId: string) => {
    const updatedDays = pastDays.map(day => 
      day.id === dayId ? { ...day, isExpanded: !day.isExpanded } : day
    );
    setPastDays(updatedDays);
    await AsyncStorage.setItem('pastDays', JSON.stringify(updatedDays));
  };

  const updateDailyTotals = (meals: Meal[]) => {
    const today = new Date().toDateString();
    const todaysMeals = meals.filter(meal => 
      new Date(meal.timestamp).toDateString() === today
    );
    const totals = todaysMeals.reduce((sum, meal) => ({
      protein: sum.protein + meal.protein,
      netCarbs: sum.netCarbs + (meal.carbs - meal.fiber)
    }), { protein: 0, netCarbs: 0 });
    
    setDailyProtein(totals.protein);
    setDailyNetCarbs(totals.netCarbs);
  };

  const editMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setManualProtein(meal.protein.toString());
    setManualCalories(meal.calories.toString());
    setManualFat(meal.fat.toString());
    setManualCarbs(meal.carbs.toString());
    setManualFiber(meal.fiber.toString());
    setManualSugar(meal.sugar.toString());
    setShowManualInputDialog(true);
  };

  const handleManualSubmit = async () => {
    const nutritionValues = {
      protein: parseFloat(manualProtein) || 0,
      calories: parseFloat(manualCalories) || 0,
      fat: parseFloat(manualFat) || 0,
      carbs: parseFloat(manualCarbs) || 0,
      fiber: parseFloat(manualFiber) || 0,
      sugar: parseFloat(manualSugar) || 0,
    };

    if (editingMeal) {
      const updatedMeals = currentMeals.map(meal => 
        meal.id === editingMeal.id 
          ? { ...meal, ...nutritionValues }
          : meal
      );
      setCurrentMeals(updatedMeals);
      await AsyncStorage.setItem('currentMeals', JSON.stringify(updatedMeals));
      updateDailyTotals(updatedMeals);
      setEditingMeal(null);
    } else if (manualInputCallback) {
      manualInputCallback(nutritionValues);
    }

    setManualProtein('');
    setManualCalories('');
    setManualFat('');
    setManualCarbs('');
    setManualFiber('');
    setManualSugar('');
    setShowManualInputDialog(false);
  };
  const deletePastDay = async (dayId: string) => {
    Alert.alert(
      "Delete Day",
      "Are you sure you want to delete this entire day? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const updatedPastDays = pastDays.filter(day => day.id !== dayId);
              setPastDays(updatedPastDays);
              await AsyncStorage.setItem('pastDays', JSON.stringify(updatedPastDays));
            } catch (error) {
              console.error('Error deleting day:', error);
              Alert.alert('Error', 'Failed to delete day. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const editPastDay = (day: DayRecord) => {
    setEditingDay(day);
    setShowDayEditDialog(true);
  };

  const deleteMeal = async (mealId: string) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const updatedMeals = currentMeals.filter(meal => meal.id !== mealId);
              setCurrentMeals(updatedMeals);
              await AsyncStorage.setItem('currentMeals', JSON.stringify(updatedMeals));
              updateDailyTotals(updatedMeals);
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };


  //part 4
  // Render Method
  return (
    <View style={styles.container}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Daily Nutrition Progress</Title>
          
          {/* Protein Progress */}
          <Paragraph style={styles.progressLabel}>Protein Progress</Paragraph>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((dailyProtein / PROTEIN_GOAL) * 100, 100)}%`,
                    backgroundColor: '#2196F3'
                  }
                ]} 
              />
              {dailyProtein > PROTEIN_GOAL && (
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      position: 'absolute',
                      right: 0,
                      width: '20%',
                      backgroundColor: '#4CAF50',
                    }
                  ]} 
                />
              )}
            </View>
          </View>
          <Paragraph style={styles.nutritionValue}>
            {dailyProtein.toFixed(1)}g / {PROTEIN_GOAL}g Protein
            {dailyProtein > PROTEIN_GOAL && 
              ` (+${(dailyProtein - PROTEIN_GOAL).toFixed(1)}g over)`
            }
          </Paragraph>
          
          {/* Net Carbs Progress */}
          <Paragraph style={[styles.progressLabel, { marginTop: 16 }]}>Net Carbs</Paragraph>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((dailyNetCarbs / CARBS_GOAL) * 100, 100)}%`,
                    backgroundColor: dailyNetCarbs <= CARBS_GOAL ? '#2196F3' : '#FF5252'
                  }
                ]} 
              />
              {dailyNetCarbs > CARBS_GOAL && (
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      position: 'absolute',
                      right: 0,
                      width: '20%',
                      backgroundColor: '#FF5252',
                    }
                  ]} 
                />
              )}
            </View>
          </View>
          <Paragraph style={styles.nutritionValue}>
            {dailyNetCarbs.toFixed(1)}g / {CARBS_GOAL}g Net Carbs
            {dailyNetCarbs > CARBS_GOAL && 
              ` (+${(dailyNetCarbs - CARBS_GOAL).toFixed(1)}g over)`
            }
          </Paragraph>
        </Card.Content>
      </Card>
  
      <ScrollView style={styles.mealsList}>
        {/* Current Day's Meals */}
        <Card style={styles.dayCard}>
            <Card.Content>
                <View style={styles.dayHeader}>
                <Title>Today's Food</Title>
                {currentMeals.length > 0 && (
                    <Button 
                    mode="contained" 
                    onPress={() => {
                        Alert.alert(
                        "Close Today's Log",
                        "Are you sure you want to close today's log? This will archive all current meals and start a new day.",
                        [
                            {
                            text: "Cancel",
                            style: "cancel"
                            },
                            {
                            text: "Close Day",
                            onPress: async () => {
                                const dayTotal = currentMeals.reduce((acc, meal) => ({
                                protein: acc.protein + meal.protein,
                                netCarbs: acc.netCarbs + (meal.carbs - meal.fiber)
                                }), { protein: 0, netCarbs: 0 });

                                const newDayRecord = {
                                id: Date.now().toString(),
                                date: new Date().toDateString(),
                                totalProtein: dayTotal.protein,
                                totalNetCarbs: dayTotal.netCarbs,
                                meals: currentMeals,
                                isExpanded: false
                                };

                                const updatedPastDays = [newDayRecord, ...pastDays];
                                setPastDays(updatedPastDays);
                                setCurrentMeals([]);
                                
                                await AsyncStorage.setItem('pastDays', JSON.stringify(updatedPastDays));
                                await AsyncStorage.setItem('currentMeals', JSON.stringify([]));
                                updateDailyTotals([]);
                            },
                            style: "default"
                            }
                        ]
                        );
                    }}
                    style={styles.closeDayButton}
                    >
                    Close Day
                    </Button>
                )}
                </View>
            </Card.Content>
            </Card>
        
        {currentMeals.map((meal) => (
          <Card key={meal.id} style={styles.mealCard}>
            <Card.Content>
              <View style={styles.mealHeader}>
                <Title style={{ flex: 1 }}>{meal.description}</Title>
                <View style={styles.mealActions}>
                  <IconButton 
                    icon="pencil" 
                    size={20}
                    onPress={() => {
                      setEditingMeal(meal);
                      setManualProtein(meal.protein.toString());
                      setManualCalories(meal.calories.toString());
                      setManualFat(meal.fat.toString());
                      setManualCarbs(meal.carbs.toString());
                      setManualFiber(meal.fiber.toString());
                      setManualSugar(meal.sugar.toString());
                      setShowManualInputDialog(true);
                    }}
                  />
                  <IconButton 
                    icon="delete" 
                    size={20}
                    onPress={() => deleteMeal(meal.id)}
                  />
                </View>
              </View>
              <Paragraph>Protein: {meal.protein}g</Paragraph>
              <Paragraph>Net Carbs: {(meal.carbs - meal.fiber)}g</Paragraph>
              <Paragraph>Fat: {meal.fat}g</Paragraph>
              <Paragraph>Fiber: {meal.fiber}g</Paragraph>
              <Paragraph>Sugar: {meal.sugar}g</Paragraph>
              <Paragraph style={styles.timeStamp}>
                Time: {new Date(meal.timestamp).toLocaleTimeString()}
              </Paragraph>
            </Card.Content>
          </Card>
        ))}
        {pastDays.length > 0 && (
            <Card style={styles.sectionCard}>
                <Card.Content>
                <Title>Past Days</Title>
                </Card.Content>
            </Card>
            )}

            {pastDays.map((day) => (
            <Card 
                key={day.id} 
                style={[
                styles.dayCard,
                { marginBottom: 8 }
                ]}
            >
                <Card.Content>
                <View style={styles.dayHeader}>
                    <View style={{ flex: 1 }}>
                    <Title>{new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</Title>
                    <View style={styles.dayTotals}>
                        <Paragraph style={[
                        styles.totalValue,
                        { color: day.totalProtein >= PROTEIN_GOAL ? '#4CAF50' : '#FF5252' }
                        ]}>
                        Protein: {day.totalProtein.toFixed(1)}g
                        {day.totalProtein >= PROTEIN_GOAL && ' ✓'}
                        </Paragraph>
                        <Paragraph style={[
                        styles.totalValue,
                        { color: day.totalNetCarbs <= CARBS_GOAL ? '#4CAF50' : '#FF5252' }
                        ]}>
                        Net Carbs: {day.totalNetCarbs.toFixed(1)}g
                        {day.totalNetCarbs <= CARBS_GOAL && ' ✓'}
                        </Paragraph>
                    </View>
                    </View>
                    <View style={styles.dayActions}>
                    <IconButton 
                        icon={day.isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        onPress={() => toggleDayExpand(day.id)}
                    />
                    </View>
                </View>
                
                {day.isExpanded && (
                    <View style={styles.expandedDay}>
                    {day.meals.map((meal) => (
                        <View key={meal.id} style={styles.pastMeal}>
                        <Title style={styles.mealDescription}>{meal.description}</Title>
                        <View style={styles.mealNutrition}>
                            <Paragraph>Protein: {meal.protein}g</Paragraph>
                            <Paragraph>Net Carbs: {(meal.carbs - meal.fiber)}g</Paragraph>
                            <Paragraph>Fat: {meal.fat}g</Paragraph>
                            <Paragraph>Fiber: {meal.fiber}g</Paragraph>
                            <Paragraph style={styles.mealTime}>
                            {new Date(meal.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                            })}
                            </Paragraph>
                        </View>
                        </View>
                    ))}
                    </View>
                )}
                </Card.Content>
            </Card>
            ))}
      </ScrollView>
  
      {/* Add Meal Dialog */}
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
  
        {/* Manual Input Dialog */}
        <Dialog 
          visible={showManualInputDialog} 
          onDismiss={() => {
            setShowManualInputDialog(false);
            setEditingMeal(null);
          }}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>
            {editingMeal ? 'Edit Meal Information' : 'Enter Nutrition Information'}
          </Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ paddingHorizontal: 20 }}>
              <TextInput
                label="Protein (g)"
                value={manualProtein}
                onChangeText={setManualProtein}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Fat (g)"
                value={manualFat}
                onChangeText={setManualFat}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Carbs (g)"
                value={manualCarbs}
                onChangeText={setManualCarbs}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Fiber (g)"
                value={manualFiber}
                onChangeText={setManualFiber}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 10 }}
              />
              <TextInput
                label="Sugar (g)"
                value={manualSugar}
                onChangeText={setManualSugar}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 40 }}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowManualInputDialog(false);
              setEditingMeal(null);
            }}>Cancel</Button>
            <Button onPress={handleManualSubmit}>
              {editingMeal ? 'Update' : 'Add'}
            </Button>
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
}