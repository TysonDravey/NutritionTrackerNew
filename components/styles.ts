import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container and Base Styles
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  overProgressText: {
    color: '#FF5252',
    fontSize: 12,
    marginLeft: 8,
  },
  sectionCard: {
    marginTop: 16,
    marginBottom: 8,
  },
  dayTotals: {
    marginTop: 4,
  },
  totalValue: {
    fontSize: 15,
    marginVertical: 2,
  },
  expandedDay: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  pastMeal: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 16,
    marginBottom: 4,
  },
  mealNutrition: {
    marginLeft: 8,
  },
  mealTime: {
    marginTop: 4,
    opacity: 0.6,
    fontSize: 12,
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Progress Bar Styles
  progressBarContainer: {
    height: 12,
    marginVertical: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
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
    marginBottom: 8,
  },
  closeDayButton: {
    marginLeft: 16,
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