import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressContext } from '../context/ProgressContext';
import ProgressCard from '../components/ProgressCard';

export default function ProgressScreen() {
  const router = useRouter();
  const progressContext = useContext(ProgressContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [inputTotal, setInputTotal] = useState('');
  const [inputCompleted, setInputCompleted] = useState('');
  const [inputHours, setInputHours] = useState('');

  useEffect(() => {
    const enforceLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/');
      } else {
        setIsAuthenticated(true);
      }
    };
    enforceLogin();
  }, [router]);

  // Sync initial inputs when progress loads
  useEffect(() => {
    if (progressContext?.progress) {
      setInputTotal(progressContext.progress.totalTasks.toString());
      setInputCompleted(progressContext.progress.completedTasks.toString());
      setInputHours(progressContext.progress.studyHours.toString());
    } else {
      setInputTotal('');
      setInputCompleted('');
      setInputHours('');
    }
  }, [progressContext?.progress]);

  if (!isAuthenticated || !progressContext) return null;

  const { progress, createProgress, updateProgress, deleteProgress, isLoading, error } = progressContext;

  const handleSave = async () => {
    const total = parseInt(inputTotal, 10);
    const completed = parseInt(inputCompleted, 10);
    const hours = parseFloat(inputHours);

    if (isNaN(total) || isNaN(completed) || isNaN(hours)) {
      Alert.alert('Configuration Error', 'Please enter valid numbers for tasks and study hours.');
      return;
    }

    if (completed > total) {
      Alert.alert('Configuration Error', 'Completed tasks cannot exceed total tasks.');
      return;
    }

    if (progress) {
      await updateProgress(progress._id, total, completed, hours);
      Alert.alert('Success', 'Progress explicitly updated.');
    } else {
      await createProgress(total, completed, hours);
      Alert.alert('Success', 'Progress configuration explicitly created.');
    }
  };

  const handleDeleteProgress = () => {
    Alert.alert(
      "Delete Tracker",
      "Are you sure you want to completely remove this progress tracker?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Forever", 
          style: "destructive", 
          onPress: async () => {
            if (progress) {
              await deleteProgress(progress._id);
              Alert.alert('Success', 'Progress tracker deleted.');
            }
          }
        }
      ]
    );
  };

  const currentTotal = progress?.totalTasks || 0;
  const currentCompleted = progress?.completedTasks || 0;
  const progressPercentage = currentTotal > 0 ? Math.max(0, Math.min(100, Math.round((currentCompleted / currentTotal) * 100))) : 0;

  if (isLoading && !progress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#2d2f2f', fontWeight: 'bold' }}>Loading modules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render fallback if API data completely fails
  if (error && !progress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <MaterialIcons name="error-outline" size={48} color="#f87171" />
          <Text style={{ color: '#2d2f2f', fontWeight: 'bold', fontSize: 18, marginTop: 16 }}>Failed to load data</Text>
          <Text style={{ color: '#5c5b5b', textAlign: 'center', marginTop: 8 }}>{error}</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24, padding: 12, backgroundColor: '#2d2f2f', borderRadius: 8 }}>
             <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#2d2f2f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarContainer}>
          <MaterialIcons name="person" size={20} color="#fdd34d" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Manual{"\n"}Tracker.</Text>
            <Text style={styles.headerSubtitle}>Explicitly configure your progress state globally.</Text>
          </View>

          {progress ? (
            <ProgressCard 
              progressPercentage={progressPercentage}
              completedCount={currentCompleted}
              totalTasks={currentTotal}
              onReset={handleDeleteProgress}
            />
          ) : (
            <View style={styles.emptyStateCard}>
              <MaterialIcons name="timeline" size={42} color="#a0a3a4" />
              <Text style={styles.emptyStateTitle}>No Tracking Active</Text>
              <Text style={styles.emptyStateSub}>Create your explicit progress configurations below.</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <Text style={styles.sectionHeading}>{progress ? 'OVERRIDE METRICS' : 'INITIALIZE METRICS'}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TOTAL TASKS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 50"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={inputTotal}
                onChangeText={setInputTotal}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>COMPLETED TASKS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 23"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={inputCompleted}
                onChangeText={setInputCompleted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>STUDY HOURS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 15.5"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={inputHours}
                onChangeText={setInputHours}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <MaterialIcons name="save" size={20} color="#fdd34d" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>{progress ? 'UPDATE TRACKER' : 'CREATE TRACKER'}</Text>
            </TouchableOpacity>

            {progress && (
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: '#fee2e2', marginTop: 12, borderWidth: 1, borderColor: '#f87171' }]} 
                onPress={handleDeleteProgress}
              >
                <MaterialIcons name="delete-forever" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={[styles.saveButtonText, { color: '#ef4444' }]}>DELETE TRACKER</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdd34d',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2d2f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  headerSection: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#2d2f2f',
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#5c5b5b',
    fontWeight: '500',
    lineHeight: 24,
    paddingRight: 20,
  },
  emptyStateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '900',
    color: '#2d2f2f',
  },
  emptyStateSub: {
    marginTop: 8,
    fontSize: 14,
    color: '#757777',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#cca727',
    letterSpacing: 1.5,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5c5b5b',
    marginBottom: 8,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: '#f0f1f1',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2f2f',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2d2f2f',
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fdd34d',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  }
});
