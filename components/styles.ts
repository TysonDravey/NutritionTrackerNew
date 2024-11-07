import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container and Base Styles
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  
  // Progress Bar Styles
  progressBarContainer: {
    height: 12,
    marginVertical: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  
  // Card Styles
  statsCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  mealCard: {
    marginBottom: 8,
  },
  dayCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  fastingCard: {
    marginBottom: 16,
  },
  fastingCardFasting: {
    backgroundColor: '#E8F5E9',
  },
  fastingCardEating: {
    backgroundColor: '#FFF3E0',
  },
  
  // Header Styles
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fastingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // List Styles
  mealsList: {
    flex: 1,
  },
  fastList: {
    flex: 1,
  },
  
  // Action Button Styles
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  
  // Time Info Styles
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  timeLabel: {
    fontWeight: '500',
    width: 90,
    color: '#666',
  },
  timeValue: {
    flex: 1,
    color: '#333',
  },
  
  // History Styles
  historyTimeInfo: {
    marginTop: 8,
  },
  historyTimeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  historyTimeLabel: {
    width: 80,
    fontWeight: '500',
    color: '#666',
  },
  historyTimeValue: {
    flex: 1,
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Dialog Styles
  editDialogContent: {
    paddingVertical: 8,
  },
  editTimeSection: {
    marginBottom: 16,
  },
  editTimeTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  durationPreview: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  
  // Text Styles
  nutritionValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  periodType: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  
  // Time Picker Styles
  timePickerContent: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  timePickerText: {
    color: 'black',
  },
  timePickerButton: {
    color: 'black',
  },

  // Button Styles
  targetButton: {
    marginTop: 16,
  },
  scheduleButton: {
    marginTop: 16,
  }
});