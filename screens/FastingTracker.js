// screens/FastingTracker.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Title, Paragraph, Switch, Portal, Dialog } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FastingTracker = () => {
  const [fastingState, setFastingState] = useState({
    isFasting: false,
    startTime: null,
    scheduledEnd: null,
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    loadFastingState();
  }, []);

  useEffect(() => {
    let interval;
    if (fastingState.isFasting && fastingState.startTime) {
      interval = setInterval(() => {
        const elapsed = new Date() - new Date(fastingState.startTime);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [fastingState]);

  const loadFastingState = async () => {
    try {
      const stored = await AsyncStorage.getItem('fastingState');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFastingState(parsed);
      }
    } catch (error) {
      console.error('Error loading fasting state:', error);
    }
  };

  const toggleFasting = async () => {
    const newState = {
      isFasting: !fastingState.isFasting,
      startTime: !fastingState.isFasting ? new Date().toISOString() : null,
      scheduledEnd: null,
    };
    setFastingState(newState);
    await AsyncStorage.setItem('fastingState', JSON.stringify(newState));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFastingState(prev => ({
        ...prev,
        scheduledEnd: selectedDate.toISOString()
      }));
    }
  };

  const formatElapsedTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.mainCard}>
        <Card.Content>
          <Title>Fasting Tracker</Title>
          <View style={styles.switchContainer}>
            <Paragraph>Fasting Mode</Paragraph>
            <Switch
              value={fastingState.isFasting}
              onValueChange={toggleFasting}
            />
          </View>
          {fastingState.isFasting && (
            <>
              <Title>Current Fast</Title>
              <Paragraph>
                Elapsed Time: {formatElapsedTime(elapsedTime)}
              </Paragraph>
              <Paragraph>
                Started: {new Date(fastingState.startTime).toLocaleString()}
              </Paragraph>
              {fastingState.scheduledEnd && (
                <Paragraph>
                  Scheduled End: {new Date(fastingState.scheduledEnd).toLocaleString()}
                </Paragraph>
              )}
            </>
          )}
          <Button 
            mode="contained" 
            onPress={() => setShowDatePicker(true)}
            style={styles.scheduleButton}
          >
            Schedule End Time
          </Button>
        </Card.Content>
      </Card>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};
