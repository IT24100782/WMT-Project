import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Platform, KeyboardAvoidingView, Modal, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedbackContext, Feedback } from '../context/FeedbackContext';
import { NoteContext } from '../context/NoteContext';

export default function FeedbackScreen() {
  const router = useRouter();
  const feedbackContext = useContext(FeedbackContext);
  const noteContext = useContext(NoteContext);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editFeedbackId, setEditFeedbackId] = useState<string | null>(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notePickerVisible, setNotePickerVisible] = useState(false);

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

  if (!isAuthenticated || !feedbackContext || !noteContext) return null;

  const { feedbackList, addFeedback, updateFeedback, deleteFeedback, isLoading } = feedbackContext;
  const { notes } = noteContext;

  const handleOpenModal = (feedbackToEdit: Feedback | null = null) => {
    if (feedbackToEdit) {
      setEditFeedbackId(feedbackToEdit._id);
      setRating(feedbackToEdit.rating);
      setComment(feedbackToEdit.comment);
      setSelectedNoteId(feedbackToEdit.noteId);
    } else {
      setEditFeedbackId(null);
      setRating(5);
      setComment('');
      setSelectedNoteId(notes.length > 0 ? notes[0]._id : null);
    }
    setModalVisible(true);
  };

  const handleSubmitModal = async () => {
    if (!selectedNoteId) {
      Alert.alert('Error', 'Please select a note to provide feedback for.');
      return;
    }

    if (editFeedbackId) {
        const success = await updateFeedback(editFeedbackId, rating, comment, selectedNoteId);
        if (success) setModalVisible(false);
    } else {
        const success = await addFeedback(rating, comment, selectedNoteId);
        if (success) setModalVisible(false);
    }
  };

  const handleDeleteFeedback = (id: string) => {
    Alert.alert(
      "Delete Feedback", 
      "Are you sure you want to delete this feedback?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteFeedback(id) }
      ]
    );
  };

  const getNoteTitle = (id: string) => {
    return notes.find(n => n._id === id)?.title || 'Unknown Note';
  };

  const renderRatingStars = (r: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            disabled={!interactive} 
            onPress={() => setRating(star)}
            style={{ marginRight: 4 }}
          >
            <MaterialIcons 
              name={star <= r ? "star" : "star-border"} 
              size={size} 
              color={star <= r ? "#fdd34d" : "#ccc"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#2d2f2f" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>FEEDBACK</Text>
        <TouchableOpacity style={styles.avatarContainer}>
          <MaterialIcons name="person" size={20} color="#fdd34d" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Academic{"\n"}Insights.</Text>
            <Text style={styles.headerSubtitle}>Reflect on your notes and track your comprehension levels.</Text>
          </View>

          <TouchableOpacity style={styles.addFeedbackCard} onPress={() => handleOpenModal()}>
            <View style={styles.addIconCircle}>
               <MaterialIcons name="add" size={24} color="#fdd34d" />
            </View>
            <Text style={styles.addFeedbackText}>Post New Feedback</Text>
          </TouchableOpacity>

          <View style={styles.listContainer}>
            {isLoading && feedbackList.length === 0 ? (
              <Text style={styles.emptyText}>Loading feedback...</Text>
            ) : feedbackList.length === 0 ? (
              <Text style={styles.emptyText}>No feedback posted yet. Select a note and share your thoughts!</Text>
            ) : feedbackList.map((item) => (
              <View key={item._id} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.noteIndicator}>
                    <MaterialIcons name="description" size={14} color="#757777" />
                    <Text style={styles.noteIndicatorText}>{getNoteTitle(item.noteId)}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleOpenModal(item)}>
                      <MaterialIcons name="edit" size={20} color="#757777" style={{ marginRight: 16 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteFeedback(item._id)}>
                      <MaterialIcons name="delete" size={20} color="#f87171" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {renderRatingStars(item.rating, 20)}
                
                {item.comment ? (
                  <Text style={styles.commentText}>{item.comment}</Text>
                ) : (
                  <Text style={[styles.commentText, { fontStyle: 'italic', color: '#9ca3af' }]}>No additional comments.</Text>
                )}
                
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editFeedbackId ? 'Edit Feedback' : 'New Feedback'}</Text>
              
              <Text style={styles.inputLabel}>SELECT NOTE</Text>
              <TouchableOpacity style={styles.notePicker} onPress={() => setNotePickerVisible(true)}>
                <Text style={styles.notePickerText}>
                  {selectedNoteId ? getNoteTitle(selectedNoteId) : 'Select a note...'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#2d2f2f" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>RATING</Text>
              <View style={styles.ratingContainer}>
                {renderRatingStars(rating, 36, true)}
                <Text style={styles.ratingValueText}>{rating}/5</Text>
              </View>

              <Text style={styles.inputLabel}>COMMENTS (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How helpful was this note?"
                placeholderTextColor="#9c9d9d"
                value={comment}
                onChangeText={setComment}
                multiline={true}
                numberOfLines={4}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmitModal}>
                  <Text style={styles.modalSubmitBtnText}>{editFeedbackId ? 'Update' : 'Post'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>

        {/* Nested Modal for Note Selection */}
        <Modal visible={notePickerVisible} transparent={true} animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Choose a Note</Text>
              {notes.length === 0 ? (
                <Text style={styles.emptyText}>You haven't created any notes yet.</Text>
              ) : (
                <FlatList
                  data={notes}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.pickerItem} 
                      onPress={() => {
                        setSelectedNoteId(item._id);
                        setNotePickerVisible(false);
                      }}
                    >
                      <Text style={styles.pickerItemText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 300 }}
                />
              )}
              <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setNotePickerVisible(false)}>
                <Text style={styles.pickerCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>
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
  appBarTitle: {
    fontWeight: '900',
    fontSize: 16,
    color: '#2d2f2f',
    letterSpacing: 1,
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
  addFeedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2d2f2f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addFeedbackText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2d2f2f',
  },
  listContainer: {
    marginBottom: 32,
  },
  emptyText: {
    color: '#5c5b5b',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f2f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
  },
  noteIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5c5b5b',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentText: {
    fontSize: 15,
    color: '#2d2f2f',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 0.5,
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
    marginTop: 12,
  },
  notePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f1f1',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 12,
  },
  notePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2f2f',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingValueText: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '900',
    color: '#2d2f2f',
  },
  input: {
    backgroundColor: '#f0f1f1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2f2f',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2d2f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f1f1',
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d2f2f',
  },
  pickerCloseBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  pickerCloseBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f87171',
    textTransform: 'uppercase',
  }
});
