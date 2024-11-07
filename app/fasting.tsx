import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, Switch, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../components/styles';


const DEFAULT_FASTING_HOURS = 16;
const DEFAULT_EATING_HOURS = 8;

interface FastingPeriod {
    id: string;
    startTime: string;
    endTime: string | null;
    targetDuration: number | null; // in hours
    isActive: boolean;
    type: 'fasting' | 'eating';
  }

export default function FastingScreen() {
  const [currentFast, setCurrentFast] = useState<FastingPeriod | null>(null);
  const [pastFasts, setPastFasts] = useState<FastingPeriod[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [targetHours, setTargetHours] = useState('');
  const [tempDateTime, setTempDateTime] = useState<Date | null>(null);
  const [showTimeConfirmDialog, setShowTimeConfirmDialog] = useState(false);  
    // Add these new states to your component:
    const [editingHistoricalFast, setEditingHistoricalFast] = useState<FastingPeriod | null>(null);
    const [editStartTime, setEditStartTime] = useState<Date | null>(null);
    const [editEndTime, setEditEndTime] = useState<Date | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editTimeType, setEditTimeType] = useState<'start' | 'end'>('start');

  // Load saved fasting data
  useEffect(() => {
    loadFastingData();
  }, []);

  // Timer effect for active fast
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentFast?.isActive) {
      interval = setInterval(() => {
        const elapsed = Date.now() - new Date(currentFast.startTime).getTime();
        setElapsedTime(elapsed);

        if (currentFast.targetDuration) {
          const target = new Date(currentFast.startTime).getTime() + 
            (currentFast.targetDuration * 60 * 60 * 1000);
          const remaining = target - Date.now();
          setRemainingTime(remaining > 0 ? remaining : 0);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentFast]);

  const startEditingFast = (fast: FastingPeriod) => {
    setEditingHistoricalFast(fast);
    setEditStartTime(new Date(fast.startTime));
    setEditEndTime(fast.endTime ? new Date(fast.endTime) : null);
    setShowEditDialog(true);
  };
  
  const handleHistoricalTimeChange = (event: any, selectedDate?: Date) => {
    if (!selectedDate) return;
    
    if (editTimeType === 'start') {
      setEditStartTime(selectedDate);
    } else {
      setEditEndTime(selectedDate);
    }
  };
  
  const saveHistoricalEdit = async () => {
    if (!editingHistoricalFast || !editStartTime || !editEndTime) return;
  
    // Validate time range
    if (editEndTime.getTime() <= editStartTime.getTime()) {
      Alert.alert('Invalid Time Range', 'End time must be after start time');
      return;
    }
  
    const duration = (editEndTime.getTime() - editStartTime.getTime()) / (1000 * 60 * 60);
  
    const updatedFast: FastingPeriod = {
      ...editingHistoricalFast,
      startTime: editStartTime.toISOString(),
      endTime: editEndTime.toISOString(),
      targetDuration: duration,
    };
  
    const updatedPastFasts = pastFasts.map(fast => 
      fast.id === updatedFast.id ? updatedFast : fast
    );
  
    setPastFasts(updatedPastFasts);
    await AsyncStorage.setItem('pastFasts', JSON.stringify(updatedPastFasts));
    setShowEditDialog(false);
    setEditingHistoricalFast(null);
  };
  

  const loadFastingData = async () => {
    try {
      const currentFastData = await AsyncStorage.getItem('currentFast');
      const pastFastsData = await AsyncStorage.getItem('pastFasts');

      if (currentFastData) {
        setCurrentFast(JSON.parse(currentFastData));
      }
      if (pastFastsData) {
        setPastFasts(JSON.parse(pastFastsData));
      }
    } catch (error) {
      console.error('Error loading fasting data:', error);
    }
  };

  const toggleFasting = async () => {
    if (!currentFast?.isActive) {
      // Start new fast
      const newFast: FastingPeriod = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        endTime: null,
        targetDuration: DEFAULT_FASTING_HOURS, // Set default duration
        isActive: true,
        type: 'fasting'
      };
      setCurrentFast(newFast);
      await AsyncStorage.setItem('currentFast', JSON.stringify(newFast));
    } else {
      // End current fast and start new period of opposite type
      const endedFast: FastingPeriod = {
        ...currentFast,
        endTime: new Date().toISOString(),
        isActive: false
      };
      const updatedPastFasts = [endedFast, ...pastFasts];
      setPastFasts(updatedPastFasts);
      
      // Start new period of opposite type
      const newPeriod: FastingPeriod = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        endTime: null,
        targetDuration: currentFast.type === 'fasting' ? DEFAULT_EATING_HOURS : DEFAULT_FASTING_HOURS,
        isActive: true,
        type: currentFast.type === 'fasting' ? 'eating' : 'fasting'
      };
      setCurrentFast(newPeriod);
      
      await AsyncStorage.setItem('pastFasts', JSON.stringify(updatedPastFasts));
      await AsyncStorage.setItem('currentFast', JSON.stringify(newPeriod));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDateTime(selectedDate);
    }
  };

  const getEstimatedEndTime = (start: string, duration: number) => {
    const endTime = new Date(start);
    endTime.setHours(endTime.getHours() + duration);
    return endTime;
  };

  const confirmTimeChange = async () => {
    if (!tempDateTime || !currentFast) return;
  
    const updatedFast = {
      ...currentFast,
      startTime: tempDateTime.toISOString()
    };
    setCurrentFast(updatedFast);
    await AsyncStorage.setItem('currentFast', JSON.stringify(updatedFast));
    setShowTimeConfirmDialog(false);
    setShowDatePicker(false);
    setTempDateTime(null);
  };

  const setFastingTarget = async () => {
    if (!currentFast) return;
    
    const hours = parseFloat(targetHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid number of hours.');
      return;
    }

    const updatedFast = {
      ...currentFast,
      targetDuration: hours
    };
    setCurrentFast(updatedFast);
    await AsyncStorage.setItem('currentFast', JSON.stringify(updatedFast));
    setShowTargetDialog(false);
    setTargetHours('');
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const deleteFast = async (fastId: string) => {
    Alert.alert(
      "Delete Fast",
      "Are you sure you want to delete this fasting period?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const updatedFasts = pastFasts.filter(fast => fast.id !== fastId);
            setPastFasts(updatedFasts);
            await AsyncStorage.setItem('pastFasts', JSON.stringify(updatedFasts));
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Current Fasting/Eating Card */}
      <Card style={[
        styles.fastingCard,
        currentFast?.type === 'fasting' ? styles.fastingCardFasting : styles.fastingCardEating
      ]}>
        <Card.Content>
          <View style={styles.fastingHeader}>
            <Title>{currentFast?.type === 'fasting' ? 'Fasting Timer' : 'Eating Window'}</Title>
            <Switch
              value={currentFast?.isActive ?? false}
              onValueChange={toggleFasting}
            />
          </View>
  
          {currentFast?.isActive && (
            <>
              <View style={styles.timeInfo}>
                <Paragraph style={styles.timeLabel}>Started:</Paragraph>
                <Paragraph style={styles.timeValue}>
                  {new Date(currentFast.startTime).toLocaleString()}
                </Paragraph>
                <IconButton 
                  icon="pencil" 
                  size={20}
                  onPress={() => {
                    setDatePickerMode('start');
                    setTempDateTime(new Date(currentFast.startTime));
                    setShowDatePicker(true);
                  }}
                />
              </View>
  
              <View style={styles.timeInfo}>
                <Paragraph style={styles.timeLabel}>Elapsed:</Paragraph>
                <Paragraph style={styles.timeValue}>
                  {formatDuration(elapsedTime)}
                </Paragraph>
              </View>
  
              <View style={styles.timeInfo}>
                <Paragraph style={styles.timeLabel}>Target:</Paragraph>
                <Paragraph style={styles.timeValue}>
                  {currentFast.targetDuration} hours
                </Paragraph>
              </View>
  
              <View style={styles.timeInfo}>
                <Paragraph style={styles.timeLabel}>End Time:</Paragraph>
                <Paragraph style={styles.timeValue}>
                  {getEstimatedEndTime(currentFast.startTime, currentFast.targetDuration!).toLocaleString()}
                </Paragraph>
              </View>
  
              {remainingTime !== null && (
                <View style={styles.timeInfo}>
                  <Paragraph style={styles.timeLabel}>Remaining:</Paragraph>
                  <Paragraph style={styles.timeValue}>
                    {formatDuration(remainingTime)}
                  </Paragraph>
                </View>
              )}
  
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    {/* Base progress up to 100% */}
                    <View 
                    style={[
                        styles.progressFill,
                        { 
                        width: `${Math.min((elapsedTime / (currentFast.targetDuration! * 3600000)) * 100, 100)}%`,
                        backgroundColor: currentFast.type === 'fasting' ? '#2196F3' : '#2196F3'
                        }
                    ]} 
                    />
                    {/* Excess indicator if over target */}
                    {elapsedTime > (currentFast.targetDuration! * 3600000) && (
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
                <View style={styles.progressLabels}>
                    <Paragraph style={styles.progressText}>
                    {Math.min(Math.round((elapsedTime / (currentFast.targetDuration! * 3600000)) * 100), 100)}% Complete
                    </Paragraph>
                    {elapsedTime > (currentFast.targetDuration! * 3600000) && (
                    <Paragraph style={[styles.progressText, { color: '#FF5252' }]}>
                        (+{formatDuration(elapsedTime - (currentFast.targetDuration! * 3600000))} over)
                    </Paragraph>
                    )}
                </View>
            </View>
  
              <Button 
                mode="contained" 
                onPress={() => setShowTargetDialog(true)}
                style={styles.targetButton}
              >
                Change Target Duration
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
  
      {/* Past Periods List */}
      <ScrollView style={styles.fastList}>
        <Title style={styles.sectionTitle}>History</Title>
        {pastFasts.map((fast) => (
          <Card 
            key={fast.id} 
            style={[
              styles.fastingHistoryCard,
              { backgroundColor: fast.type === 'fasting' ? '#E8F5E9' : '#FFF3E0' }
            ]}
          >
            <Card.Content>
              <View style={styles.fastingHistoryHeader}>
                <View style={{ flex: 1 }}>
                  <Title style={styles.periodType}>
                    {fast.type === 'fasting' ? '⚡ Fasting' : '🍽️ Eating'}
                  </Title>
                  <View style={styles.historyTimeInfo}>
                    <View style={styles.historyTimeRow}>
                      <Paragraph style={styles.historyTimeLabel}>Started:</Paragraph>
                      <Paragraph style={styles.historyTimeValue}>
                        {new Date(fast.startTime).toLocaleString()}
                      </Paragraph>
                    </View>
                    <View style={styles.historyTimeRow}>
                      <Paragraph style={styles.historyTimeLabel}>Ended:</Paragraph>
                      <Paragraph style={styles.historyTimeValue}>
                        {fast.endTime ? new Date(fast.endTime).toLocaleString() : 'N/A'}
                      </Paragraph>
                    </View>
                    <View style={styles.historyTimeRow}>
                      <Paragraph style={styles.historyTimeLabel}>Duration:</Paragraph>
                      <Paragraph style={styles.historyTimeValue}>
                        {formatDuration(
                          new Date(fast.endTime ?? Date.now()).getTime() - 
                          new Date(fast.startTime).getTime()
                        )}
                      </Paragraph>
                    </View>
                  </View>
                </View>
                <View style={styles.historyActions}>
                  <IconButton 
                    icon="pencil" 
                    size={20}
                    onPress={() => startEditingFast(fast)}
                  />
                  <IconButton 
                    icon="delete" 
                    size={20}
                    onPress={() => deleteFast(fast.id)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
  
      {/* Portal Section for All Dialogs */}
      <Portal>
        {/* Target Duration Dialog */}
        <Dialog
          visible={showTargetDialog}
          onDismiss={() => setShowTargetDialog(false)}
        >
          <Dialog.Title>Set Target Duration</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Duration (hours)"
              value={targetHours}
              onChangeText={setTargetHours}
              keyboardType="numeric"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTargetDialog(false)}>Cancel</Button>
            <Button onPress={setFastingTarget}>Set Target</Button>
          </Dialog.Actions>
        </Dialog>
  
        {/* Edit Historical Entry Dialog */}
        <Dialog
          visible={showEditDialog}
          onDismiss={() => {
            setShowEditDialog(false);
            setEditingHistoricalFast(null);
          }}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>
            Edit {editingHistoricalFast?.type === 'fasting' ? 'Fasting' : 'Eating'} Period
          </Dialog.Title>
          
          <Dialog.Content>
            <View style={styles.editDialogContent}>
              <View style={styles.editTimeSection}>
                <Title style={styles.editTimeTitle}>Start Time</Title>
                <Button 
                  mode="outlined"
                  onPress={() => {
                    setEditTimeType('start');
                    setShowDatePicker(true);
                  }}
                >
                  {editStartTime ? editStartTime.toLocaleString() : 'Select Start Time'}
                </Button>
              </View>
  
              <View style={styles.editTimeSection}>
                <Title style={styles.editTimeTitle}>End Time</Title>
                <Button 
                  mode="outlined"
                  onPress={() => {
                    setEditTimeType('end');
                    setShowDatePicker(true);
                  }}
                >
                  {editEndTime ? editEndTime.toLocaleString() : 'Select End Time'}
                </Button>
              </View>
  
              {editStartTime && editEndTime && (
                <View style={styles.durationPreview}>
                  <Paragraph>
                    Duration: {formatDuration(editEndTime.getTime() - editStartTime.getTime())}
                  </Paragraph>
                </View>
              )}
            </View>
          </Dialog.Content>
  
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setShowEditDialog(false);
                setEditingHistoricalFast(null);
              }}
            >
              Cancel
            </Button>
            <Button onPress={saveHistoricalEdit}>
              Save Changes
            </Button>
          </Dialog.Actions>
        </Dialog>
  
        {/* Time Picker Dialog */}
        {showDatePicker && (
            <Dialog 
                visible={true} 
                onDismiss={() => {
                setShowDatePicker(false);
                setTempDateTime(null);
                }}
                style={{ backgroundColor: 'white' }}  // Ensure dialog background is white
            >
                <Dialog.Title>Select Time</Dialog.Title>
                <Dialog.Content style={styles.timePickerContent}>
                <DateTimePicker
                    value={
                    editingHistoricalFast
                        ? (editTimeType === 'start' ? editStartTime || new Date() : editEndTime || new Date())
                        : (tempDateTime || (currentFast ? new Date(currentFast.startTime) : new Date()))
                    }
                    mode="datetime"
                    is24Hour={true}
                    display="spinner"
                    onChange={editingHistoricalFast ? handleHistoricalTimeChange : handleDateChange}
                    themeVariant="light"  // Force light theme
                    textColor="black"     // Force black text
                    style={{ 
                    backgroundColor: 'white',
                    height: 200       // Give it enough height
                    }}
                />
                </Dialog.Content>
                <Dialog.Actions>
                <Button 
                    onPress={() => {
                    setShowDatePicker(false);
                    setTempDateTime(null);
                    }}
                    textColor="black"  // Ensure button text is visible
                >
                    Cancel
                </Button>
                <Button 
                    onPress={editingHistoricalFast ? saveHistoricalEdit : confirmTimeChange}
                    textColor="black"  // Ensure button text is visible
                >
                    OK
                </Button>
                </Dialog.Actions>
            </Dialog>
            )}
      </Portal>
    </View>
  );
}