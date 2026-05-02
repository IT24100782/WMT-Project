import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CourseContext } from '../context/CourseContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CoursesScreen() {
  const router = useRouter();
  const courseContext = useContext(CourseContext);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  
  // Form State
  const [courseNameInput, setCourseNameInput] = useState('');
  const [semesterInput, setSemesterInput] = useState('');

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

  if (!isAuthenticated || !courseContext) {
    return null;
  }

  const { courses, addCourse, updateCourse, deleteCourse, isLoading } = courseContext;

  const handleOpenAddModal = () => {
    setEditingCourseId(null);
    setCourseNameInput('');
    setSemesterInput('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (id: string, name: string, semester: string) => {
    setEditingCourseId(id);
    setCourseNameInput(name);
    setSemesterInput(semester);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!courseNameInput.trim() || !semesterInput.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    let success = false;
    if (editingCourseId) {
      success = await updateCourse(editingCourseId, courseNameInput, semesterInput);
    } else {
      success = await addCourse(courseNameInput, semesterInput);
    }

    if (success) {
      setModalVisible(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Course", 
      "Are you sure you want to delete this course?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteCourse(id) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#2d2f2f" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>YOUR COURSES</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.greetingText}>Manage Your Learning</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
            <MaterialIcons name="add" size={20} color="#f5f2f1" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Add New Course</Text>
          </TouchableOpacity>
        </View>

        {isLoading && courses.length === 0 ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : courses.length === 0 ? (
          <Text style={styles.emptyText}>You haven't added any courses yet.</Text>
        ) : (
          courses.map((course, index) => {
            const colors = ['#fdd34d', '#a3e635', '#ef4444', '#3b82f6'];
            const color = colors[index % colors.length];
            return (
              <View key={course._id} style={styles.courseItem}>
                 <View style={[styles.courseColorBorder, { backgroundColor: color }]} />
                 <View style={styles.courseIconPill}>
                    <MaterialIcons name="school" size={22} color="#5c5b5b" />
                 </View>
                 <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.courseName}</Text>
                    <Text style={styles.courseStats}>Semester: {course.semester}</Text>
                 </View>
                 <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleOpenEditModal(course._id, course.courseName, course.semester)} style={styles.actionIconButton}>
                      <MaterialIcons name="edit" size={20} color="#5c5b5b" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(course._id)} style={styles.actionIconButton}>
                      <MaterialIcons name="delete" size={20} color="#ef4444" />
                    </TouchableOpacity>
                 </View>
              </View>
            );
          })
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingCourseId ? 'Edit Course' : 'Add New Course'}</Text>
              
              <Text style={styles.inputLabel}>COURSE NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Modern Physics"
                placeholderTextColor="#9c9d9d"
                value={courseNameInput}
                onChangeText={setCourseNameInput}
              />
              
              <Text style={styles.inputLabel}>SEMESTER</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Fall 2026"
                placeholderTextColor="#9c9d9d"
                value={semesterInput}
                onChangeText={setSemesterInput}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmit}>
                  <Text style={styles.modalSubmitBtnText}>{editingCourseId ? 'Save' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f2f1',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#fdd34d',
  },
  appBarTitle: {
    fontWeight: '900',
    fontSize: 16,
    color: '#2d2f2f',
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerSection: {
    flexDirection: 'column',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2d2f2f',
    lineHeight: 32,
    letterSpacing: -1,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#5c5b5b',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#f5f2f1',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#757777',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 40,
  },
  courseItem: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  courseColorBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  courseIconPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginLeft: 8,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2d2f2f',
    marginBottom: 4,
  },
  courseStats: {
    fontSize: 12,
    color: '#757777',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f5f2f1',
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2d2f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2d2f2f',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#f0f1f1',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2f2f',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#f0f1f1',
  },
  modalCancelBtnText: {
    color: '#757777',
    fontWeight: '800',
    fontSize: 14,
  },
  modalSubmitBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#fdd34d',
  },
  modalSubmitBtnText: {
    color: '#2d2f2f',
    fontWeight: '900',
    fontSize: 14,
  }
});
