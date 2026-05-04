import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ProgressCardProps {
  progressPercentage: number;
  completedCount: number;
  totalTasks: number;
  onReset: () => void;
}

export default function ProgressCard({ progressPercentage, completedCount, totalTasks, onReset }: ProgressCardProps) {
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>PROGRESS</Text>
        <TouchableOpacity onPress={onReset} style={styles.resetButton}>
          <MaterialIcons name="delete" size={16} color="#f87171" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressStats}>
        <Text style={styles.progressPercentage}>
          {progressPercentage}%
        </Text>
        <Text style={styles.progressFraction}>{completedCount} / {totalTasks} Tasks</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 1.5,
  },
  resetButton: {
    padding: 4,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2d2f2f',
    marginRight: 8,
  },
  progressFraction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5c5b5b',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#f0f1f1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#cca727',
    borderRadius: 6,
  },
});
